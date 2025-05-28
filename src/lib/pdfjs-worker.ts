import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl; 