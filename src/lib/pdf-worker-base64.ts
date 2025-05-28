// This is a base64-encoded version of the PDF.js worker
export const workerBase64 = 'data:application/javascript;base64,' + btoa(`
  self.importScripts('https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js');
`); 