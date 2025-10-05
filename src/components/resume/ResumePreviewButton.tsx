import { Component } from 'react';
import { Button } from "../../components/ui/Button";
import { Eye, Loader2 } from "lucide-react";

interface ResumePreviewButtonProps {
  fileUrl?: string | null;
  cvId?: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
}

interface ResumePreviewButtonState {
  loading: boolean;
}

class ResumePreviewButton extends Component<ResumePreviewButtonProps, ResumePreviewButtonState> {
  constructor(props: ResumePreviewButtonProps) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  handlePreview = () => {
    const { fileUrl } = this.props;
    this.setState({ loading: true }, () => {
      if (fileUrl) {
        try {
          window.open(fileUrl, '_blank', 'noopener,noreferrer');
        } catch (e) {
          // noop
        }
      } else {
        // Fallback if no URL provided
        console.warn('No fileUrl provided to ResumePreviewButton');
      }
      // Reset loading quickly since this is a navigation/open action
      this.setState({ loading: false });
    });
  }

  render() {
    const {
      label,
      variant = 'outline',
      size = 'sm',
      className,
      showIcon = true,
    } = this.props;
    const { loading } = this.state;

    return (
      <Button
        variant={variant}
        size={size}
        className={`${showIcon ? 'flex items-center gap-1' : ''} ${className || ''}`}
        onClick={this.handlePreview}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showIcon ? (
          <Eye className="h-4 w-4" />
        ) : null}
        {label && <span>{label}</span>}
      </Button>
    );
  }
}

export default ResumePreviewButton;
