// src/components/ImportMOCs.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient'; // Verify this path matches your project structure!

const ImportMOCs = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        // Insert into Supabase 'mocs' table
        const { error } = await supabase
          .from('mocs')
          .upsert(jsonData, { onConflict: 'MOC ID', ignoreDuplicates: false });

        if (error) throw error;

        alert('Success! Data imported.');
        if (onUploadSuccess) onUploadSuccess(); // Refresh the list if a function was passed

      } catch (err) {
        console.error(err);
        alert('Error importing: ' + err.message);
      } finally {
        setUploading(false);
        e.target.value = null; // Reset input
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-md border border-gray-300 mb-6">
      <h3 className="font-bold text-sm mb-2 text-gray-700">Import Excel/CSV File</h3>
      {uploading ? (
        <span className="text-blue-600 font-semibold">Uploading...</span>
      ) : (
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
      )}
    </div>
  );
};

export default ImportMOCs;