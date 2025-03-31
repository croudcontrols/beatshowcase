import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Log In</h2>
        
        {error && <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 