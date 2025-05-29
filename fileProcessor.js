// fileProcessor.js

// Setup global variables for XLSX
window.fileProcessor = {
  isXlsx: false,
  xlsxFileLookup: {}, // e.g., { filename1: true, filename2: true }
  fileData: {}, // e.g., { filename1: base64Data, filename2: base64Data }

  filledCell: function(cell) {
    return cell !== '' && cell != null;
  },

  loadFileData: function(filename) {
    if (this.isXlsx && this.xlsxFileLookup[filename]) {
      try {
        const workbook = XLSX.read(this.fileData[filename], { type: 'base64' });
        const sheetNames = workbook.SheetNames;
        const firstSheetName = sheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
        const filteredData = jsonData.filter(row => row.some(cell => this.filledCell(cell)));
        let headerRowIndex = filteredData.findIndex((row, index) => {
          const nextRow = filteredData[index + 1];
          if (nextRow) {
            return row.filter(cell => this.filledCell(cell)).length >= nextRow.filter(cell => this.filledCell(cell)).length;
          }
          return false;
        });
        if (headerRowIndex === -1 || headerRowIndex > 25) {
          headerRowIndex = 0;
        }
        const sheet = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
        const csv = XLSX.utils.sheet_to_csv(sheet, { header: 1 });
        return csv;
      } catch (e) {
        console.error(e);
        return "";
      }
    }
    return this.fileData[filename] || "";
  },

  hasFileData: function(key) {
    return !!this.fileData[key];
  }
};