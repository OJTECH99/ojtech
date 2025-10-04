import React, { Component } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { toast } from '../ui/toast-utils';
import { X } from 'lucide-react';

interface OnboardingFeedbackProps {
  onClose: () => void;
}

interface OnboardingFeedbackState {
  rating: number | null;
  feedback: string;
  isSubmitting: boolean;
}

export class OnboardingFeedback extends Component<OnboardingFeedbackProps, OnboardingFeedbackState> {
  constructor(props: OnboardingFeedbackProps) {
    super(props);
    
    this.state = {
      rating: null,
      feedback: '',
      isSubmitting: false
    };
  }
  
  handleRatingChange = (rating: number) => {
    this.setState({ rating });
  };
  
  handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ feedback: e.target.value });
  };
  
  handleSubmit = async () => {
    const { rating, feedback } = this.state;
    
    if (rating === null) {
      toast({
        title: "Error",
        description: "Please provide a rating",
        variant: "destructive"
      });
      return;
    }
    
    try {
      this.setState({ isSubmitting: true });
      
      // In a real implementation, you would send this data to your backend
      console.log('Onboarding Feedback:', { rating, feedback });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted"
      });
      
      this.props.onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };
  
  render() {
    const { rating, feedback, isSubmitting } = this.state;
    const { onClose } = this.props;
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md p-6 relative bg-white dark:bg-gray-800 shadow-xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Close feedback form"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-semibold mb-6">How was your onboarding experience?</h2>
          
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm text-gray-500">Please rate your onboarding experience:</p>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => this.handleRatingChange(value)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      rating === value 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Rate ${value} out of 5`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <div>
              <p className="mb-2 text-sm text-gray-500">Any suggestions for improvement?</p>
              <Textarea
                placeholder="Your feedback helps us improve..."
                value={feedback}
                onChange={this.handleFeedbackChange}
                className="min-h-[100px] w-full"
                aria-label="Feedback suggestions"
              />
            </div>
            
            <div className="pt-2">
              <Button
                className="w-full"
                onClick={this.handleSubmit}
                disabled={isSubmitting || rating === null}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }
} 