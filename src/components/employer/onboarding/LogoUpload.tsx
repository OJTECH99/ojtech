import React, { Component, createRef } from 'react';
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
// Next Image replaced with standard img;

interface LogoUploadProps {
  onUpload: (file: File) => Promise<string>;
  onSubmit: (logoUrl: string) => Promise<void>;
  defaultLogoUrl?: string;
}

interface LogoUploadState {
  logoUrl: string;
  isUploading: boolean;
  isSubmitting: boolean;
}

export class LogoUpload extends Component<LogoUploadProps, LogoUploadState> {
  fileInputRef = createRef<HTMLInputElement>();
  
  constructor(props: LogoUploadProps) {
    super(props);
    this.state = {
      logoUrl: props.defaultLogoUrl || '',
      isUploading: false,
      isSubmitting: false
    };
  }

  handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      this.setState({ isUploading: true });
      const logoUrl = await this.props.onUpload(file);
      this.setState({ 
        logoUrl,
        isUploading: false
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      this.setState({ isUploading: false });
    }
  };

  handleRemoveLogo = () => {
    this.setState({ logoUrl: '' });
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = '';
    }
  };

  handleSubmit = async () => {
    const { logoUrl } = this.state;
    if (!logoUrl) return;
    
    try {
      this.setState({ isSubmitting: true });
      await this.props.onSubmit(logoUrl);
      this.setState({ isSubmitting: false });
    } catch (error) {
      console.error('Error submitting logo:', error);
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    const { logoUrl, isUploading, isSubmitting } = this.state;
    
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">Upload Your Company Logo</h3>
          <p className="text-sm text-muted-foreground">
            Your logo will be displayed on your job postings and company profile
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {logoUrl ? (
            <Card className="relative w-48 h-48 overflow-hidden">
              <CardContent className="p-0">
                {logoUrl.endsWith('.svg') ? (
                  <img
                    src={logoUrl}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image 
                    src={logoUrl}
                    alt="Company Logo"
                    width={192}
                    height={192}
                    className="w-full h-full object-contain"
                  />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={this.handleRemoveLogo}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card
              className="w-48 h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => this.fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                {isUploading ? (
                  <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Click to upload your company logo
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <input
            type="file"
            ref={this.fileInputRef}
            onChange={this.handleFileChange}
            className="hidden"
            accept="image/jpeg,image/png,image/svg+xml,image/webp"
          />

          {!logoUrl && (
            <Button
              variant="outline"
              onClick={() => this.fileInputRef.current?.click()}
              disabled={isUploading}
              type="button"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </>
              )}
            </Button>
          )}

          <Button
            className="w-full"
            onClick={this.handleSubmit}
            disabled={!logoUrl || isUploading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    );
  }
}
