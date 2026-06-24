'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Connect to real password reset API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#003366] via-[#0B3058] to-[#003366] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#8CC63F]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#A2D45E]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8CC63F] to-[#A2D45E] flex items-center justify-center shadow-2xl">
                <Bot className="w-9 h-9 text-[#003366]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8CC63F] to-[#A2D45E] bg-clip-text text-transparent">
                  SentinelAI
                </h1>
                <p className="text-gray-300 text-sm mt-1">Fraud Detection Platform</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              Need Help Accessing<br />Your Account?
            </h2>
            <p className="text-gray-300 text-lg mb-12">
              Don't worry! We'll help you reset your password and get back to protecting your business.
            </p>

            <div className="space-y-6">
              {[
                { step: '1', title: 'Enter your email', desc: 'Provide your registered email address' },
                { step: '2', title: 'Check your inbox', desc: 'We\'ll send you a reset link' },
                { step: '3', title: 'Create new password', desc: 'Set a secure password and sign in' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-[#8CC63F]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#8CC63F] font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8CC63F] to-[#A2D45E] flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-[#003366]" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#003366] to-[#0B3058] bg-clip-text text-transparent">
              SentinelAI
            </h1>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8">
            {!success ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#003366] to-[#0B3058] bg-clip-text text-transparent mb-2">
                    Reset Password
                  </h2>
                  <p className="text-gray-600">Enter your email to receive a reset link</p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@sentinel.ai"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#8CC63F] to-[#A2D45E] hover:from-[#7AB52F] hover:to-[#91C34E] text-[#003366] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6">
                  <a
                    href="/login"
                    className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-600 hover:text-[#003366] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </a>
                </div>
              </>
            ) : (
              /* Success Message */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-[#8CC63F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-[#8CC63F]" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#003366] to-[#0B3058] bg-clip-text text-transparent mb-3">
                  Check Your Email
                </h3>
                <p className="text-gray-600 mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="text-[#003366] font-semibold mb-6">
                  {email}
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#8CC63F] to-[#A2D45E] hover:from-[#7AB52F] hover:to-[#91C34E] text-[#003366] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Back to Sign In
                  </button>
                  <button
                    onClick={() => setSuccess(false)}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
                  >
                    Resend Email
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Protected by enterprise-grade security • © 2026 SentinelAI
          </p>
        </motion.div>
      </div>
    </div>
  );
}

