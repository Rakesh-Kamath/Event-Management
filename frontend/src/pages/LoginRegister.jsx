import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function LoginRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [mockEmail, setMockEmail] = useState('participant@demo.com');

  const handleGoogleLoginResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/google', {
        credential: response.credential
      });
      login(res.data.token, res.data.user);
      
      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'organizer') navigate('/organizer');
      else navigate('/my-bookings');
    } catch (err) {
      console.error('Google Login Error:', err);
      setError(err.response?.data?.message || err.message || 'Google Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    if (!mockEmail) {
      setError('Please enter a mock email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/google', {
        credential: `mock_token_${mockEmail.trim()}`
      });
      login(res.data.token, res.data.user);
      
      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'organizer') navigate('/organizer');
      else navigate('/my-bookings');
    } catch (err) {
      console.error('Mock Google Login Error:', err);
      setError(err.response?.data?.message || err.message || 'Mock Google Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let intervalId;
    const initializeGoogleSignIn = () => {
      if (typeof google !== 'undefined') {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleLoginResponse
          });
          const buttonElement = document.getElementById("googleSignInDiv");
          if (buttonElement) {
            google.accounts.id.renderButton(
              buttonElement,
              { theme: "outline", size: "large" }
            );
            if (intervalId) clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Failed to render Google Sign-In button:', err);
        }
      }
    };

    initializeGoogleSignIn();
    intervalId = setInterval(initializeGoogleSignIn, 500);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister 
        ? { name, email, password }
        : { email, password };

      const res = await axios.post(endpoint, payload);
      login(res.data.token, res.data.user);

      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'organizer') navigate('/organizer');
      else navigate('/my-bookings');

    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-6">
      <div className="max-w-md w-full glass-panel border border-monochrome-800 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Top Header: Evently */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white text-black font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xl">
            E
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-monochrome-400 font-mono">
            {isRegister ? 'Join Evently to reserve and discover top Indian events' : 'Sign in to Evently'}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-monochrome-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-monochrome-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-monochrome-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-monochrome-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-monochrome-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-monochrome-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/50 p-2.5 rounded-xl border border-red-800">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-monochrome-800 w-full"></div>
          <span className="bg-monochrome-950 px-3 text-xs text-monochrome-500 font-mono absolute">OR</span>
        </div>

        <div className="space-y-3">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div id="googleSignInDiv" className="w-full flex justify-center"></div>
          )}

          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="space-y-2">
              <div className="bg-monochrome-900 border border-dashed border-monochrome-700 rounded-xl p-3 text-center space-y-2">
                <p className="text-[10px] font-mono text-monochrome-400">
                  ⚠️ Google Client ID not set.<br />
                  Use Developer Mock Mode to test:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="mock.user@gmail.com"
                    value={mockEmail}
                    onChange={(e) => setMockEmail(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-monochrome-950 border border-monochrome-800 text-[11px] text-white focus:outline-none focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={handleMockGoogleLogin}
                    className="px-3 py-1.5 bg-white text-black text-[11px] font-extrabold rounded-lg hover:bg-monochrome-200 transition-colors"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-monochrome-400 hover:text-white font-mono transition-colors"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
