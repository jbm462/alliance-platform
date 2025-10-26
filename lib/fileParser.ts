import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Parse Excel or CSV file content
 */
export const parseFileContent = async (file: File): Promise<any[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    throw new Error('Unknown file type');
  }
  
  // Handle Excel files
  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file);
  }
  
  // Handle CSV files
  if (extension === 'csv') {
    return parseCsv(file);
  }
  
  throw new Error(`Unsupported file type: ${extension}`);
};

/**
 * Parse Excel file
 */
const parseExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

/**
 * Parse CSV file
 */
const parseCsv = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      }
    });
  });
};

/**
 * Check if the data appears to be an APQC taxonomy
 */
export const isAPQCTaxonomy = (data: any[]): boolean => {
  if (!data || data.length === 0) {
    return false;
  }
  
  // Look for common APQC headers
  const firstRow = data[0];
  const headers = Object.keys(firstRow).map(h => h.toLowerCase());
  
  const apqcKeywords = ['process', 'category', 'activity', 'level', 'apqc', 'pcf'];
  
  // Check if at least 2 APQC keywords are present in headers
  const matchCount = apqcKeywords.filter(keyword => 
    headers.some(header => header.includes(keyword))
  ).length;
  
  return matchCount >= 2;
};

/**
 * Transform data into a hierarchical structure
 */
export const transformToHierarchy = (data: any[]): any => {
  // This is a simplified version - in a real app, we would have more robust logic
  // to handle different APQC formats
  
  const hierarchy: any = {
    L1: [],
    L2: [],
    L3: [],
    L4: []
  };
  
  // Try to identify level columns
  const firstRow = data[0];
  const keys = Object.keys(firstRow);
  
  let levelColumns: string[] = [];
  
  // Look for level indicators in column names
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('level') || 
      lowerKey.includes('l1') || 
      lowerKey.includes('l2') || 
      lowerKey.includes('l3') || 
      lowerKey.includes('l4') ||
      lowerKey.includes('category') ||
      lowerKey.includes('process') ||
      lowerKey.includes('activity')
    ) {
      levelColumns.push(key);
    }
  }
  
  // If we couldn't identify level columns, assume first 4 columns
  if (levelColumns.length === 0) {
    levelColumns = keys.slice(0, 4);
  }
  
  // Group data by levels
  data.forEach(row => {
    levelColumns.forEach((col, index) => {
      const level = `L${index + 1}`;
      if (row[col] && hierarchy[level]) {
        // Check if this item already exists
        const exists = hierarchy[level].some((item: any) => 
          item.name === row[col]
        );
        
        if (!exists) {
          hierarchy[level].push({
            name: row[col],
            code: row['Code'] || row['code'] || row['ID'] || row['id'] || '',
            children: []
          });
        }
      }
    });
  });
  
  // Build parent-child relationships
  for (let i = 1; i < 4; i++) {
    const parentLevel = `L${i}`;
    const childLevel = `L${i + 1}`;
    
    hierarchy[parentLevel].forEach((parent: any) => {
      // Find child items that belong to this parent
      data.forEach(row => {
        const parentCol = levelColumns[i - 1];
        const childCol = levelColumns[i];
        
        if (row[parentCol] === parent.name && row[childCol]) {
          const child = hierarchy[childLevel].find((c: any) => 
            c.name === row[childCol]
          );
          
          if (child && !parent.children.includes(child)) {
            parent.children.push(child);
          }
        }
      });
    });
  }
  
  return hierarchy;
}; 