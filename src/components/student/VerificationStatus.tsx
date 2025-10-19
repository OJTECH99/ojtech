import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, Button, Card, CardContent, Typography } from '@mui/material';
import profileService from '../../lib/api/profileService';
import { useNavigate } from 'react-router-dom';

interface VerificationStatusProps {
  onComplete?: () => void;
}

interface VerificationStatusData {
  isVerified: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
  hasCompletedOnboarding: boolean;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<VerificationStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setLoading(true);
        const data = await profileService.getVerificationStatus();
        setStatus(data);
      } catch (err) {
        console.error('Error fetching verification status:', err);
        setError('Failed to load verification status. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, []);

  const handleCompleteProfile = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography>Loading verification status...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  if (!status.hasCompletedOnboarding) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <AlertTitle>Complete Your Profile</AlertTitle>
        You need to complete your profile before you can apply for jobs.
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCompleteProfile}
          >
            Complete Profile
          </Button>
        </Box>
      </Alert>
    );
  }

  if (!status.isVerified) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Verification Pending</AlertTitle>
        Your account is pending verification by an administrator. You won't be able to apply for jobs or view job matches until your account is verified.
        {status.verificationNotes && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Notes:</strong> {status.verificationNotes}
          </Typography>
        )}
      </Alert>
    );
  }

  return (
    <Alert severity="success" sx={{ mb: 3 }}>
      <AlertTitle>Account Verified</AlertTitle>
      Your account has been verified! You can now apply for jobs and view job matches.
      {status.verifiedAt && (
        <Typography variant="body2">
          Verified on: {new Date(status.verifiedAt).toLocaleDateString()}
        </Typography>
      )}
    </Alert>
  );
};

export default VerificationStatus;
