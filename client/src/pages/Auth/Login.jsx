import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import ThemeToggle from '../../components/common/ThemeToggle';
import {
  Boxes,
  Phone,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [authMethod, setAuthMethod] = useState('password');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, sendPhoneOTP, loginWithPhoneOTP } = useAuthStore();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone.trim()) { toast.error('Please enter your phone number'); return; }
    try {
      setIsSubmitting(true);
      await sendPhoneOTP(phone);
      setStep(2);
    } catch (err) {}
    finally { setIsSubmitting(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { toast.error('Please enter the 6-digit code'); return; }
    try {
      setIsSubmitting(true);
      await loginWithPhoneOTP(phone, otp);
      navigate('/dashboard');
    } catch (err) {}
    finally { setIsSubmitting(false); }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password'); return; }
    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {}
    finally { setIsSubmitting(false); }
  };

  const fillDemoCredentials = () => {
    setEmail('manager@stocksense.com');
    setPassword('password123');
    setAuthMethod('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0A0F1E] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
      {/* Floating Theme Toggle */}
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm relative"
      >
        {/* Card */}
        <div className="rounded-3xl p-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-3 bg-amber-400 text-slate-950 shadow-md">
              <Boxes className="w-6 h-6" />
            </Link>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">StockSense</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Secure Warehouse & Inventory Management
            </p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex p-1 rounded-xl mb-6 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => { setAuthMethod('password'); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail size={13} />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setStep(1); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'phone'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Phone size={13} />
              <span>Phone OTP</span>
            </button>
          </div>

          {/* Email + Password Flow */}
          {authMethod === 'password' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@stocksense.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-amber-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><span>Sign In</span><ArrowRight size={15} /></>
                )}
              </button>

              {/* Demo auto-fill */}
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Auto-fill Demo Credentials (Manager)
              </button>
            </form>
          )}

          {/* Phone OTP Flow */}
          {authMethod === 'phone' && (
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="phone-1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  onSubmit={handleSendOTP}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Phone Number (E.164)
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        required
                      />
                    </div>
                    <p className="text-[11px] mt-1.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={11} />
                      SMS code will be sent via Twilio
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><span>Send Verification Code</span><ArrowRight size={15} /></>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="phone-2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-4"
                >
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Code sent to <span className="font-mono font-bold text-amber-500">{phone}</span>
                  </p>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-center text-slate-700 dark:text-slate-300">
                      Enter 6-Digit SMS Code
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        autoFocus
                        className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-lg font-bold text-center tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><ShieldCheck size={15} /><span>Verify & Sign In</span></>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs">
                    <button type="button" onClick={() => setStep(1)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 cursor-pointer">
                      <ArrowLeft size={11} /> Change number
                    </button>
                    <button type="button" onClick={handleSendOTP} disabled={isSubmitting}
                      className="text-amber-500 hover:underline flex items-center gap-1 cursor-pointer">
                      <RefreshCw size={11} /> Resend code
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Need an account?{' '}
            <Link to="/signup" className="font-semibold text-amber-500 hover:underline ml-1">
              Create account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
