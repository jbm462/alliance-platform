import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
import { promises as fs } from 'fs';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { getSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  // Get user session
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // Parse the incoming form data
    const form = new IncomingForm({
      multiples: true,
      keepExtensions: true,
    });
    
    // Parse form and files
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });
    
    // Check if files were uploaded
    if (!files.file) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    // Get the uploaded file
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    // Get the workflow instance ID if provided
    const instanceId = fields.instanceId ? fields.instanceId[0] : null;
    const stepId = fields.stepId ? fields.stepId[0] : null;
    
    // Get file path and extension
    const filePath = file.filepath;
    const fileName = file.originalFilename || 'unknown';
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    
    // Read the file
    const fileData = await fs.readFile(filePath);
    
    // Process based on file type
    let parsedData;
    
    if (fileExt === 'csv') {
      // Parse CSV
      const csvString = fileData.toString();
      parsedData = Papa.parse(csvString, { header: true }).data;
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      // Parse Excel
      const workbook = XLSX.read(fileData);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      parsedData = XLSX.utils.sheet_to_json(worksheet);
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
    
    // Upload to Supabase Storage (if set up)
    /*
    const fileId = uuidv4();
    const storagePath = `uploads/${fileId}-${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(storagePath, fileData);
      
    if (uploadError) {
      throw uploadError;
    }
    */
    
    // If this is part of a workflow execution, record the file upload
    if (instanceId && stepId) {
      // Create a record of the upload
      const uploadId = uuidv4();
      const now = new Date().toISOString();
      
      const { error: recordError } = await supabase
        .from('file_uploads')
        .insert({
          id: uploadId,
          instance_id: instanceId,
          step_id: stepId,
          file_name: fileName,
          file_type: fileExt,
          file_size: file.size,
          uploaded_at: now,
          // storage_path: storagePath
        });
      
      if (recordError) {
        throw recordError;
      }
      
      // Update the step execution with the file upload
      const { error: executionError } = await supabase
        .from('step_executions')
        .insert({
          instance_id: instanceId,
          step_id: stepId,
          started_at: now,
          completed_at: now,
          status: 'completed',
          output: JSON.stringify({
            fileName,
            fileType: fileExt,
            fileSize: file.size,
            rows: parsedData.length,
            uploadId
          }),
          input_data: {}
        });
      
      if (executionError) {
        throw executionError;
      }
    }
    
    // Return the parsed data
    return res.status(200).json({
      message: 'File uploaded and processed successfully',
      fileName,
      fileType: fileExt,
      fileSize: file.size,
      rowCount: parsedData.length,
      data: parsedData
    });
  } catch (error) {
    console.error('Error processing file upload:', error);
    return res.status(500).json({ message: 'Failed to process file upload' });
  }
} 