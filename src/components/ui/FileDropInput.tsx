import React, { Component, createRef } from 'react';
import { cn } from "../../lib/utils";
import { Upload, File, X } from "lucide-react";
import { Button } from "./button";

interface FileDropInputProps {
  onChange: (file: File | null) => void;
  currentFile: File | null;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

interface FileDropInputState {
  isDragging: boolean;
}

export class FileDropInput extends Component<FileDropInputProps, FileDropInputState> {
  private inputRef = createRef<HTMLInputElement>();

  constructor(props: FileDropInputProps) {
    super(props);
    this.state = {
      isDragging: false
    };
  }

  handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isDragging: true });
  };

  handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isDragging: false });
  };

  handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isDragging: false });

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      this.validateAndProcessFile(file);
    }
  };

  handleClick = () => {
    if (this.inputRef.current) {
      this.inputRef.current.click();
    }
  };

  handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      this.validateAndProcessFile(file);
    }
  };

  handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    this.props.onChange(null);
    if (this.inputRef.current) {
      this.inputRef.current.value = '';
    }
  };

  validateAndProcessFile = (file: File) => {
    const { acceptedFileTypes, maxSizeMB = 5 } = this.props;
    
    // Check file type
    if (acceptedFileTypes && acceptedFileTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isValidType = acceptedFileTypes.some(type => {
        if (type.startsWith('.')) {
          return `.${fileExtension}` === type.toLowerCase();
        }
        return mimeType === type;
      });
      
      if (!isValidType) {
        alert(`Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`);
        return;
      }
    }
    
    // Check file size
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds the limit of ${maxSizeMB} MB`);
      return;
    }
    
    this.props.onChange(file);
  };

  render() {
    const { currentFile, acceptedFileTypes, className } = this.props;
    const { isDragging } = this.state;
    
    const acceptAttribute = acceptedFileTypes ? acceptedFileTypes.join(',') : undefined;

    return (
      <div className="space-y-2">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/20 hover:bg-muted/50"
          } ${className || ""}`}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
          onClick={this.handleClick}
        >
          <input
            type="file"
            ref={this.inputRef}
            onChange={this.handleFileSelect}
            className="hidden"
            accept={acceptAttribute}
          />
          
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            {currentFile ? (
              <div className="flex items-center gap-2 w-full">
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{currentFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/80"
                  onClick={this.handleRemove}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {acceptedFileTypes 
                      ? `Accepted formats: ${acceptedFileTypes.join(', ')}`
                      : 'Upload your file here'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}
