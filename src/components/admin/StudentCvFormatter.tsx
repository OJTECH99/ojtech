import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { FileText, Download, Code } from 'lucide-react';
import resumeHtmlGenerator from '../../lib/api/resumeHtmlGenerator';

interface StudentCvFormatterProps {
  cvHtml: string;
  studentProfile: any;
}

// HTML Resume view component with iframe to safely render HTML content
const ResumeHtmlView: React.FC<{ html: string }> = ({ html }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [processedHtml, setProcessedHtml] = useState<string>(html);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Helper function to generate HTML from JSON data
    const generateHTMLFromJSON = (jsonData: any): string => {
      try {
        return resumeHtmlGenerator.generateResumeHtml(jsonData);
      } catch (error) {
        console.error('Error in generateHTMLFromJSON:', error);
        return `
          <!DOCTYPE html>
          <html>
          <head><title>Resume</title></head>
          <body>
            <h1>Resume Generation Error</h1>
            <p>There was an error generating the resume. Please try again or contact support.</p>
          </body>
          </html>
        `;
      }
    };
    
    // Process HTML content - handle both JSON and HTML formats
    const processHtml = (content: string) => {
      console.log('Processing HTML content, length:', content.length);
      
      if (!content || content.trim() === '') {
        console.warn('Empty HTML content received');
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Resume</title>
            <style>
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                padding: 20px; 
                text-align: center;
                color: #4a5568;
                line-height: 1.6;
              }
              h1 { color: #2d3748; }
            </style>
          </head>
          <body>
            <h1>No Resume Content Available</h1>
            <p>Please try regenerating the resume.</p>
          </body>
          </html>
        `;
      }
      
      // Check if it looks like HTML
      const isHtml = content.includes('<!DOCTYPE html>') || 
                    content.includes('<html>') || 
                    (content.includes('<') && content.includes('</'));
      
      // Check if it looks like JSON
      const isJson = (content.startsWith('{') && content.endsWith('}')) || 
                     (content.includes('\\"') && content.includes('\\"'));
                   
      console.log('Content appears to be:', isHtml ? 'HTML' : isJson ? 'JSON' : 'Unknown format');
      
      // If it's already HTML, use it directly
      if (isHtml) {
        return content;
      }
      
      // If it might be JSON, try to parse and convert
      if (isJson) {
        try {
          // Handle multiple levels of escaping
          let processedContent = content;
          
          // Handle string with quotes at start and end
          if (processedContent.startsWith('"') && processedContent.endsWith('"')) {
            processedContent = processedContent.substring(1, processedContent.length - 1);
          }
          
          // Handle escaped quotes and backslashes
          processedContent = processedContent.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          
          // Parse the JSON data
          const jsonData = JSON.parse(processedContent);
          console.log('Successfully parsed JSON data:', Object.keys(jsonData));
          
          // Use our resumeHtmlGenerator to create HTML
          try {
            const htmlContent = resumeHtmlGenerator.generateResumeHtml(jsonData);
            console.log('Generated HTML from JSON with resumeHtmlGenerator, length:', htmlContent.length);
            return htmlContent;
          } catch (generatorError) {
            console.error('Error using resumeHtmlGenerator:', generatorError);
            // If the generator fails, fall back to legacy method
            const htmlContent = generateHTMLFromJSON(jsonData);
            console.log('Fallback: Generated HTML from JSON with legacy method, length:', htmlContent.length);
            return htmlContent;
          }
        } catch (error) {
          console.error('Error processing JSON content:', error);
          // If parsing fails, return a fallback HTML
          return `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Resume</title>
              <style>
                body { 
                  font-family: 'Segoe UI', Arial, sans-serif; 
                  padding: 20px; 
                  line-height: 1.6;
                }
                .error { 
                  color: #e53e3e; 
                  margin-bottom: 1rem;
                  padding: 1rem;
                  border-left: 4px solid #e53e3e;
                  background-color: #fff5f5;
                }
                h1 { color: #2d3748; }
                pre {
                  background-color: #f7fafc;
                  padding: 1rem;
                  border-radius: 0.25rem;
                  overflow: auto;
                  font-size: 0.875rem;
                }
              </style>
            </head>
            <body>
              <h1>Resume Parsing Error</h1>
              <p class="error">There was an error processing the resume data. Please try regenerating it.</p>
              <pre>${content.substring(0, 200)}...</pre>
            </body>
            </html>
          `;
        }
      }
      
      // If we couldn't determine the format, wrap it in basic HTML
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
              color: #2d3748;
            }
            pre {
              background-color: #f7fafc;
              padding: 1rem;
              border-radius: 0.25rem;
              overflow: auto;
              font-size: 0.875rem;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <pre>${content}</pre>
        </body>
        </html>
      `;
    };
    
    // Process the HTML content and update state
    try {
      const processed = processHtml(html);
      console.log('Setting processed HTML, length:', processed.length);
      setProcessedHtml(processed);
      setIframeLoaded(false); // Reset loaded state when content changes
    } catch (error) {
      console.error('Error processing HTML:', error);
      // Set a fallback HTML on error
      setProcessedHtml(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
            }
            .error { 
              color: #e53e3e; 
              padding: 1rem;
              border-left: 4px solid #e53e3e;
              background-color: #fff5f5;
            }
          </style>
        </head>
        <body>
          <h1>Error Loading Resume</h1>
          <p class="error">There was an error processing the resume. Please try regenerating it.</p>
        </body>
        </html>
      `);
    }
  }, [html]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Iframe loaded!');
    setIframeLoaded(true);
    
    // Check if iframe content is loaded correctly
    if (iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          const bodyContent = iframeDoc.body.innerHTML;
          console.log('Iframe body content length:', bodyContent.length);
        }
      } catch (e) {
        console.error('Error checking iframe content:', e);
      }
    }
  };

  return (
    <div className="relative">
      {!iframeLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-center text-white">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-white mx-auto mb-4"></div>
            <p>Loading resume...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Resume Preview"
        className="w-full h-[800px] border-0 bg-white rounded-b-lg"
        sandbox="allow-same-origin allow-scripts"
        srcDoc={processedHtml}
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

/**
 * StudentCvFormatter component for displaying student CV in different formats
 * This component is used on the admin side to view and manage student CVs
 */
const StudentCvFormatter: React.FC<StudentCvFormatterProps> = ({ cvHtml, studentProfile }) => {
  const [activeTab, setActiveTab] = useState<string>('preview');
  
  // Function to download CV as HTML
  const downloadCvAsHtml = () => {
    const blob = new Blob([cvHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentProfile.firstName}_${studentProfile.lastName}_CV.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to download CV as PDF (requires server-side implementation)
  const downloadCvAsPdf = () => {
    // This would typically call a server endpoint that converts HTML to PDF
    alert('PDF download functionality requires server-side implementation');
  };

  return (
    <Card className="mt-4 overflow-hidden">
      <div className="bg-gray-100 p-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Student CV</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadCvAsHtml}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            HTML
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadCvAsPdf}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b px-4">
          <TabsList className="bg-transparent">
            <TabsTrigger value="preview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Preview
            </TabsTrigger>
            <TabsTrigger value="source" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                Source
              </div>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="preview" className="p-0 m-0">
          <ResumeHtmlView html={cvHtml} />
        </TabsContent>
        
        <TabsContent value="source" className="p-0 m-0">
          <div className="p-4 overflow-auto bg-gray-50">
            <pre className="text-xs">{cvHtml}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default StudentCvFormatter;
