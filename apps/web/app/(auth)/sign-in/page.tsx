'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { IconBrandGoogle, IconArrowLeft, IconMail, IconPhone } from '@tabler/icons-react';
import { useRecallrAuth } from '@/providers/RecallrProvider';

export default function SignInPage() {
  const router = useRouter();
  const {
    session,
    signInWithPhoneOtp,
    verifyPhoneOtp,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    resetPassword,
  } = useRecallrAuth();

  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');

  // Phone states
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  // Email states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // If already authenticated, redirect to home
  useEffect(() => {
    if (session) {
      router.replace('/');
    }
  }, [session, router]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const getFormattedPhone = () => {
    const trimmed = phoneNumber.trim();
    if (trimmed.startsWith('+')) {
      return trimmed;
    }
    const cleanDigits = trimmed.replace(/\D/g, '');
    return `+91${cleanDigits}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const fullPhone = getFormattedPhone();
      await signInWithPhoneOtp(fullPhone);
      setStep('otp');
      setResendTimer(30);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP. Please check your number and try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('').trim();
    if (code.length < 6) {
      setErrorMessage('Please enter the 6-digit verification code');
      return;
    }

    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const fullPhone = getFormattedPhone();
      await verifyPhoneOtp(fullPhone, code);
      router.replace('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired verification code';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setErrorMessage('');
    setIsLoading(true);
    try {
      const fullPhone = getFormattedPhone();
      await signInWithPhoneOtp(fullPhone);
      setResendTimer(30);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not resend OTP. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter your email and password');
      return;
    }

    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      if (emailMode === 'signin') {
        await signInWithEmailPassword(email.trim(), password);
      } else {
        await signUpWithEmailPassword(email.trim(), password, fullName.trim() || undefined);
      }
      router.replace('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address first to reset password');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setInfoMessage('Password reset link sent to your email.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send password reset email.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    const cleanVal = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanVal.slice(-1);
    setOtp(newOtp);
    if (errorMessage) setErrorMessage('');

    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center max-w-sm mx-auto px-6 py-12">
      {step === 'phone' ? (
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-[14px] bg-accent flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-sm">
              R
            </div>
            <h1 className="text-2xl font-medium text-text pt-2">
              {authMethod === 'email' && emailMode === 'signup'
                ? 'Create your account'
                : 'Welcome to Recallr'}
            </h1>
            <p className="text-xs text-textSecondary">
              Your network, safe and always with you.
            </p>
          </div>

          {/* Segmented Control: Phone vs Email */}
          <div className="flex bg-[#F1EFEA] p-1 rounded-card border border-border">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setErrorMessage('');
                setInfoMessage('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-[10px] transition-colors ${
                authMethod === 'phone'
                  ? 'bg-white text-text shadow-xs'
                  : 'text-textSecondary hover:text-text'
              }`}
            >
              <IconPhone size={14} />
              <span>Phone</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setErrorMessage('');
                setInfoMessage('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-[10px] transition-colors ${
                authMethod === 'email'
                  ? 'bg-white text-text shadow-xs'
                  : 'text-textSecondary hover:text-text'
              }`}
            >
              <IconMail size={14} />
              <span>Email</span>
            </button>
          </div>

          {infoMessage && (
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-input text-xs text-accent text-center">
              {infoMessage}
            </div>
          )}

          {/* Phone Method */}
          {authMethod === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center h-11 bg-white rounded-input border border-border focus-within:border-accent overflow-hidden shadow-xs">
                  <span className="px-3 text-xs text-textSecondary font-medium border-r border-divider select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="98765 43210"
                    className="flex-1 px-3 bg-transparent text-sm text-text focus:outline-none"
                    autoFocus
                  />
                </div>
                {errorMessage && (
                  <p className="text-xs text-danger mt-1.5">{errorMessage}</p>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                {isLoading ? 'Sending code...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {/* Email Method */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {emailMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-11 px-3 bg-white rounded-input border border-border focus:outline-none focus:border-accent text-sm text-text shadow-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@example.com"
                  className="w-full h-11 px-3 bg-white rounded-input border border-border focus:outline-none focus:border-accent text-sm text-text shadow-xs"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-textSecondary">
                    Password
                  </label>
                  {emailMode === 'signin' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] text-accent hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 bg-white rounded-input border border-border focus:outline-none focus:border-accent text-sm text-text shadow-xs"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-danger mt-1">{errorMessage}</p>
              )}

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                {isLoading
                  ? 'Please wait...'
                  : emailMode === 'signup'
                  ? 'Create Account'
                  : 'Sign In'}
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode(emailMode === 'signin' ? 'signup' : 'signin');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  className="text-xs text-textSecondary hover:text-text font-medium"
                >
                  {emailMode === 'signin' ? (
                    <>
                      Don't have an account?{' '}
                      <span className="text-accent underline">Sign up</span>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <span className="text-accent underline">Sign in</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-divider w-full" />
            <span className="bg-bg px-3 text-[11px] text-textMuted uppercase">
              or
            </span>
            <div className="border-t border-divider w-full" />
          </div>

          {/* Google Sign In */}
          <Button
            variant="outline"
            size="md"
            icon={<IconBrandGoogle size={18} />}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            Continue with Google
          </Button>

          {/* Terms text */}
          <p className="text-[11px] text-center text-textMuted leading-relaxed pt-2">
            By continuing, you agree to our{' '}
            <span className="text-accent underline cursor-pointer">Terms</span> and{' '}
            <span className="text-accent underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      ) : (
        /* OTP Step */
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setErrorMessage('');
            }}
            className="inline-flex items-center gap-1 text-xs text-textSecondary hover:text-text font-medium"
          >
            <IconArrowLeft size={16} />
            <span>Change number</span>
          </button>

          <div className="space-y-1">
            <h1 className="text-2xl font-medium text-text">Verify your phone</h1>
            <p className="text-xs text-textSecondary">
              Enter the 6-digit code sent to <strong>{getFormattedPhone()}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-12 h-12 text-center text-lg font-mono font-medium rounded-input bg-white border border-border focus:outline-none focus:border-accent shadow-xs"
                />
              ))}
            </div>

            {errorMessage && (
              <p className="text-xs text-danger text-center">{errorMessage}</p>
            )}

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>

          <p className="text-xs text-center text-textSecondary">
            Didn't get code?{' '}
            <button
              type="button"
              disabled={resendTimer > 0 || isLoading}
              onClick={handleResendOtp}
              className="text-accent font-medium hover:underline disabled:opacity-50"
            >
              Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
            </button>
          </p>
        </div>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
}
