import { supabase } from '../../lib/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({})
    const [fields, files] = await form.parse(req)
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    // Read file content
    const fileContent = fs.readFileSync(file.filepath, 'utf-8')
    
    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.originalFilename}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, fileContent)
    
    if (uploadError) {
      return res.status(400).json({ error: uploadError.message })
    }
    
    // Parse CSV/Excel for Service Catalog
    const processes = parseProcessData(fileContent)
    
    return res.status(200).json({ 
      fileUrl: uploadData.path, 
      processes,
      preview: processes.slice(0, 5) 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    })
  }
}

function parseProcessData(content: string) {
  // Simple CSV parsing - enhance based on actual format
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const process: any = {}
    headers.forEach((header, index) => {
      process[header] = values[index]?.trim() || ''
    })
    return process
  }).filter(process => Object.values(process).some(value => value))
} 