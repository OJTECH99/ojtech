import React, { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';

interface BioStepProps {
  bio: string | null | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default class BioStep extends Component<BioStepProps> {
  componentDidMount() {
    // Load saved bio from localStorage if current bio is empty, null, or undefined
    if (!this.props.bio || typeof this.props.bio !== 'string' || !this.props.bio.trim()) {
      const savedBio = localStorageManager.getStepData<string>('bio');
      if (savedBio) {
        // Simulate a change event to update the parent state
        const mockEvent = {
          target: {
            name: 'bio',
            value: savedBio
          }
        } as ChangeEvent<HTMLTextAreaElement>;
        this.props.onChange(mockEvent);
        localStorageManager.saveStepData('bio', this.props.bio);
      }
    }
  }

  isValid = (): boolean => {
    return this.props.bio ? this.props.bio.length >= 50 : false;
  };

  handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (this.isValid()) {
      // Save bio to localStorage
      if (this.props.bio) {
        localStorageManager.saveStepData('bio', this.props.bio);
      }
      this.props.onNext();
    }
  };

  render() {
    const { bio, onChange, onPrev } = this.props;
    const minLength = 50;
    const maxLength = 500;
    const currentLength = bio ? bio.length : 0;

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            About You
          </h3>
          <p className="text-gray-400 mt-2">
            Tell employers about yourself, your aspirations, and what makes you unique
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
              Bio <span className="text-red-500">*</span>
              <span className="text-gray-500 text-xs ml-2">(Tell us about yourself, your interests, and career goals)</span>
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={6}
              value={bio || ''}
              onChange={onChange}
              required
              minLength={minLength}
              maxLength={maxLength}
              className="w-full bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
              placeholder="Share your story, interests, and what drives you professionally..."
            />
            
            <div className={`text-xs mt-2 flex justify-between ${currentLength < minLength ? 'text-red-400' : 'text-gray-500'}`}>
              <span>{currentLength} / {maxLength} characters</span>
              {currentLength < minLength && (
                <span>At least {minLength - currentLength} more characters needed</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800/30 shadow-inner">
          <h4 className="text-gray-300 font-medium mb-2">Bio Writing Tips</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Highlight your passion for your field of study and career aspirations</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Mention any unique experiences, projects, or interests that make you stand out</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Briefly explain what you're looking for in an internship or job opportunity</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onPrev}
            className="px-6 py-3 rounded-lg font-medium text-white border border-gray-600 hover:bg-gray-800 transition-all duration-300"
          >
            Back
          </button>
          <button
            onClick={this.handleNext}
            disabled={!this.isValid()}
            className={`
              px-6 py-3 rounded-lg font-medium text-white
              transition-all duration-300 shadow-lg
              ${!this.isValid() 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20'
              }
            `}
          >
            Review Your Profile
          </button>
        </div>
      </div>
    );
  }
}