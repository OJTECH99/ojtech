import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import profileService from '../../lib/api/profileService';

interface VerificationBannerProps {
  onlyShowIfUnverified?: boolean;
}

interface VerificationStatus {
  verified: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
}

const VerificationBanner: React.FC<VerificationBannerProps> = ({ onlyShowIfUnverified = false }) => {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setLoading(true);
        const data = await profileService.getVerificationStatus();
        setStatus(data);
      } catch (err) {
        console.error('Error fetching verification status:', err);
        setError('Failed to check verification status');
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, []);

  if (loading || error || !status) {
    return null;
  }

  // If we only want to show the banner for unverified accounts and the account is verified, return null
  if (onlyShowIfUnverified && status.verified) {
    return null;
  }

  if (!status.verified) {
    return (
      <div className="mb-4 flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-yellow-900 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-500">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div>
          <div className="font-medium">Account Verification Required</div>
          <div className="text-sm">
            Your account is pending verification by an administrator. You won't be able to apply for jobs or view job matches until your account is verified.
            {status.verificationNotes && (
              <p className="mt-2 text-sm font-medium">
                <strong>Notes:</strong> {status.verificationNotes}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If onlyShowIfUnverified is false, we'll show a success message for verified accounts
  return (
    <div className="mb-4 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
      <CheckCircle className="h-5 w-5 shrink-0" />
      <div>
        <div className="font-medium">Account Verified</div>
        <div className="text-sm">
          Your account has been verified. You can apply for jobs and view job matches.
          {status.verifiedAt && (
            <p className="mt-1 text-xs">
              Verified on: {new Date(status.verifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationBanner;
