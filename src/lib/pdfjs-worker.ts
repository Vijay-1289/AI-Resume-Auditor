import * as pdfjsLib from 'pdfjs-dist';
import { workerBase64 } from './pdf-worker-base64';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerBase64; 