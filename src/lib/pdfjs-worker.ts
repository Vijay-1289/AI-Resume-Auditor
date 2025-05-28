import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc; 