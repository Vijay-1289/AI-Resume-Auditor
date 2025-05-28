import * as pdfjsLib from 'pdfjs-dist';

// Create a blob URL for the worker
const workerBlob = new Blob(
  [
    `importScripts('https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js');`
  ],
  { type: 'application/javascript' }
);

const workerUrl = URL.createObjectURL(workerBlob);
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl; 