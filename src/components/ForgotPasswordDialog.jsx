import React, { useState } from 'react';
import api from './api';

function ForgotPasswordDialog({ onClose }) {
    const [step, setStep] = useState(1);
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSendOtp = async () => {
        const formattedNumber = mobileNumber.startsWith('+91') 
        ? mobileNumber 
        : `+91${mobileNumber}`;
    
        try {
            await api.post('/api/auth/forgot-password', null, {
                params: { mobileNumber: formattedNumber,
                    email: email
                 }
            });
            setMessage('OTP sent to your mobile number');
            setStep(2);
        } catch (err) {
            setError(err.response?.data || "Failed to send OTP");
        }
    };

    const handleResetPassword = async () => {
       const formattedMobileNumber = mobileNumber.startsWith('+91') 
        ? mobileNumber 
        : `+91${mobileNumber}`;
    
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        try {
            await api.post('/api/auth/reset-password', {
                mobileNumber:formattedMobileNumber,
                otp,
                newPassword,
                confirmPassword,
                email
            });
            setMessage('Password reset successfully');
            setTimeout(onClose, 2000);
        } catch (err) {
            setError(err.response?.data || "Failed to reset password");
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            width: '400px',
            maxWidth: '90%'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Forgot Password</h2>
            
            {step === 1 && (
                <>
                    <p>Enter your registered mobile number</p>
                    <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <input
            placeholder="Registered Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
          />
                    <button
                        onClick={handleSendOtp}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Send OTP
                    </button>
                </>
            )}

            {step === 2 && (
                <>
                    {/*<p>Enter OTP sent to {mobileNumber}</p>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="OTP"
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />*/}
                    <input
            placeholder="Enter OTP from email"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
          />
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <button
                        onClick={handleResetPassword}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '10px'
                        }}
                    >
                        Reset Password
                    </button>
                    <button
                        onClick={() => setStep(1)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Back
                    </button>
                </>
            )}

            {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer'
                }}
            >
                ×
            </button>
        </div>
    );
}

export default ForgotPasswordDialog;