import React, { useState } from 'react';
import { requestOtp, verifyOtp } from "../../services/api";
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';

function OtpModal({ setIsVerified, setLoginData }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpData, setOtpData] = useState();
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({ email: '', name: '' });
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRequestOtp = async () => {
    const newErrors = { email: '', name: '' };
    if (name.length < 4) {
      newErrors.name = 'Name must be at least 4 characters long.';
    }
    if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (newErrors.name || newErrors.email) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const res = await requestOtp(email);
    setLoading(false);
    if (res?.success === true) {
      setOtpData(res);
      setOtpSent(true);
      setErrors({ email: '', name: '' });
    }
  };

  const handleVerifyOtp = async () => {
    const data = {
      email,
      name,
      otp,
      hash: otpData?.hash
    };
    setLoading(true);
    const res = await verifyOtp(data);
    setLoading(false);
    if (res?.success === true) {
      setLoginData({
        accessToken: res.accessToken,
        email,
        name
      });
      setIsVerified(true);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 4 },
        borderRadius: 2,
        boxShadow: 3,
        width: { xs: '90%', sm: 400 },
        bgcolor: 'background.paper',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
      }}
    >
      <Typography variant="h5" gutterBottom>
        {otpSent ? 'Enter OTP' : 'Join Chat'}
      </Typography>
      <TextField
        label="Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email}
      />
      {loading ? (
        <CircularProgress />
      ) : !otpSent ? (
        <Button
          variant="contained"
          onClick={handleRequestOtp}
          sx={{ marginTop: 2, width: { xs: '100%', sm: 'auto' } }}
        >
          Request OTP
        </Button>
      ) : (
        <>
          <TextField
            label="OTP"
            type="text"
            variant="outlined"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleVerifyOtp}
            sx={{ marginTop: 2, width: { xs: '100%', sm: 'auto' } }}
          >
            Verify OTP
          </Button>
        </>
      )}
    </Box>
  );
}

export default OtpModal;
