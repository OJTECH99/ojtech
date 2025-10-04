import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker path for PDF.js
try {
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
} catch (error) {
  console.warn('Failed to load PDF worker:', error);
}

interface PDFViewerProps {
  fileUrl: string;
  onClose?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<boolean>(false);
  const [useIframe, setUseIframe] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError() {
    console.warn('React-PDF failed, switching to iframe fallback');
    setError(true);
    setUseIframe(true);
  }

  function handleIframeLoad() {
    setIframeLoading(false);
  }

  function handleTryIframe() {
    setUseIframe(true);
    setError(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => Math.max(1, Math.min(numPages || 1, prevPageNumber + offset)));
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  // Create PDF.js viewer URL for iframe fallback
  const pdfJsViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {error && !useIframe && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600 mb-2">Error loading PDF with react-pdf</p>
              <p className="text-gray-600 text-sm mb-4">Trying alternative viewer...</p>
              <div className="flex justify-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleTryIframe}>
                  Try Iframe Viewer
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, '_blank')}>
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}

          {useIframe && (
            <div className="w-full">
             
              <div className="relative w-full h-[1000px] border border-gray-200 rounded-md overflow-hidden">
                {iframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <iframe
                  src={pdfJsViewerUrl}
                  className="w-full h-full"
                  title="PDF Document"
                  onLoad={handleIframeLoad}
                />
              </div>
              <div className="flex justify-center space-x-2 mt-4">
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, '_blank')}>
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
          
          {!error && !useIframe && (
            <>
              <div className="border border-gray-200 rounded-md overflow-hidden mb-4 max-h-[500px] overflow-y-auto">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="py-16 flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }
                >
                  <Page 
                    pageNumber={pageNumber} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    scale={1.2}
                  />
                </Document>
              </div>

              <div className="flex items-center justify-between w-full mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={previousPage} 
                  disabled={pageNumber <= 1}
                >
                  Previous
                </Button>
                
                <p className="text-sm text-gray-600">
                  Page {pageNumber} of {numPages || '--'}
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={nextPage} 
                  disabled={!numPages || pageNumber >= numPages}
                >
                  Next
                </Button>
              </div>

              <div className="flex space-x-3 mt-2">
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleTryIframe}>
                  Switch to Iframe Viewer
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, '_blank')}>
                  Open in New Tab
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
