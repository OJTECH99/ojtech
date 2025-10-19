import React, { useState, useRef } from 'react';
import { X, Send, Mail, User, FileText, Loader2, Upload, Paperclip } from 'lucide-react';
import { Button } from './ui/Button';
import { EmailDraft } from '../lib/api/jobApplicationService';

interface EmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailDraft: EmailDraft;
  onSend: (emailBody: string, subject: string, attachments?: File[]) => Promise<void>;
  jobTitle: string;
  companyName: string;
}

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({
  isOpen,
  onClose,
  emailDraft,
  onSend,
  jobTitle,
  companyName,
}) => {
  const [emailBody, setEmailBody] = useState(emailDraft.body);
  const [subject, setSubject] = useState(emailDraft.subject);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Limit total size to 10MB
    const totalSize = [...attachments, ...files].reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setError('Total attachment size cannot exceed 10MB');
      return;
    }
    setAttachments(prev => [...prev, ...files]);
    setError(null);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!emailBody.trim()) {
      setError('Email body cannot be empty');
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      await onSend(emailBody, subject, attachments);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email. Please try again.');
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Application Email</h2>
              <p className="text-sm text-gray-600">{jobTitle} at {companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Recipient Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">To:</span>
              <span className="text-gray-900">
                {emailDraft.toName} ({emailDraft.to})
              </span>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Body
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              disabled={isSending}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Write your email message here..."
            />
            <p className="mt-2 text-xs text-gray-500">
              You can edit this message to personalize your application before sending.
            </p>
          </div>

          {/* Applicant Info Card */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Information (Included in Email)</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">{emailDraft.studentName}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{emailDraft.studentEmail}</span>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 text-gray-900">{emailDraft.studentPhone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-gray-600">University:</span>
                <span className="ml-2 text-gray-900">{emailDraft.studentUniversity || 'Not provided'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Major:</span>
                <span className="ml-2 text-gray-900">{emailDraft.studentMajor || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* CV Link */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">CV/Resume Attached</p>
                <p className="text-xs text-gray-600 mt-1">Your CV will be included as a downloadable link in the email</p>
              </div>
              <a
                href={emailDraft.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Preview
              </a>
            </div>
          </div>

          {/* Additional Attachments */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Additional Attachments</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="text-xs"
              >
                <Upload className="h-4 w-4 mr-1" />
                Add Files
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />

            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      disabled={isSending}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  Total size: {formatFileSize(attachments.reduce((sum, f) => sum + f.size, 0))} / 10MB
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No additional files attached. You can attach documents, certificates, or portfolio items.</p>
            )}
          </div>

          {/* Rate Limit Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> You can send up to 10 application emails per day. Make sure to review your message before sending.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !emailBody.trim()}
            className="min-w-[120px]"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
