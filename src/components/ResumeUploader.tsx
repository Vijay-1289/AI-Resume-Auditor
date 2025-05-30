import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Import the worker script using Vite's asset handling
// @ts-ignore // Ignore TypeScript error for importing worker file directly
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.js';

interface ResumeUploaderProps {
  onUpload: (text: string) => void;
}

export const ResumeUploader = ({ onUpload }: ResumeUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [workerInitialized, setWorkerInitialized] = useState(false);

  useEffect(() => {
    const initializeWorker = async () => {
      try {
        console.log('Attempting to initialize PDF.js worker...');
        // Create a new worker instance using Vite's asset handling
        // This ensures the worker file is bundled and served correctly.
        const worker = new Worker(PdfWorker);

        // Set the worker instance for PDF.js
        pdfjsLib.GlobalWorkerOptions.workerPort = worker;

        // Wait a bit for the worker to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test the worker by loading a simple PDF
        const testPdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
        const loadingTask = pdfjsLib.getDocument({ data: testPdf });
        await loadingTask.promise;

        setWorkerInitialized(true);
        setError(''); // Clear any previous error on successful init
        console.log('PDF.js worker initialized successfully.');

      } catch (err) {
        console.error('Failed to initialize PDF.js worker:', err);
        setError('PDF processing is not available. Please refresh the page and try again.');
        setWorkerInitialized(false);
      }
    };

    initializeWorker();

    // Optional: Clean up worker on component unmount
    // return () => {
    //   if (pdfjsLib.GlobalWorkerOptions.workerPort) {
    //     (pdfjsLib.GlobalWorkerOptions.workerPort as Worker).terminate();
    //     pdfjsLib.GlobalWorkerOptions.workerPort = null;
    //   }
    // };

  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    if (!workerInitialized) {
      // This case should ideally be prevented by disabling the dropzone
      throw new Error('PDF processing is not available. Please refresh the page and try again.');
    }

    try {
      console.log('Starting PDF text extraction...');

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are supported');
      }

      const arrayBuffer = await file.arrayBuffer();
      console.log('File loaded, processing with PDF.js...');

      // Load the PDF document with error handling
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      if (!pdf || pdf.numPages === 0) {
        throw new Error('Invalid PDF file or empty document');
      }

      console.log(`PDF loaded successfully, pages: ${pdf.numPages}`);

      let fullText = '';
      const maxPages = 10; // Limit to prevent processing extremely large documents

      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, maxPages); pageNum++) {
        console.log(`Processing page ${pageNum}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        if (!textContent || !textContent.items || textContent.items.length === 0) {
          console.warn(`No text content found on page ${pageNum}`);
          continue;
        }

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();

        if (pageText) {
          fullText += pageText + '\n';
        }
      }

      if (!fullText.trim()) {
        throw new Error('No text could be extracted from the PDF');
      }

      console.log(`Text extraction complete. Total length: ${fullText.length}`);
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
      }
      throw new Error('Failed to extract text from PDF');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const text = await extractTextFromPDF(file);
      if (text.trim().length < 50) {
        throw new Error('Resume appears to be too short or text could not be extracted properly');
      }
      onUpload(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, workerInitialized]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading || !workerInitialized
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
          ${(isUploading || !workerInitialized) ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="flex justify-center">
            {isUploading ? (
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : !workerInitialized ? (
              <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isUploading ? 'Processing Resume...' : !workerInitialized ? 'Initializing...' : 'Upload Your Resume'}
            </h3>
            <p className="text-gray-600">
              {isDragActive
                ? 'Drop your PDF resume here'
                : !workerInitialized
                ? `Please wait while we initialize PDF processing...`
                : 'Drag and drop your PDF resume, or click to browse'
              }
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>PDF format only • Max 10MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
