import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
const pdfjsVersion = '4.0.379';
const workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;

// Create a script element to preload the worker
const script = document.createElement('script');
script.src = workerSrc;
script.async = true;
document.head.appendChild(script);

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc; 