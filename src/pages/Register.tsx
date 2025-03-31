import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const { createUserDocument } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      console.log("Creating user account with email:", email);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with name
      console.log("Updating user profile with name:", name);
      await updateProfile(user, { displayName: name });
      
      // Create user document in Firestore
      try {
        const userData = {
          name,
          email,
          subscription: 'free',
          beatsCount: 0,
          showcasesCount: 0
        };
        
        await createUserDocument(user.uid, userData);
        console.log("User document created during registration");
      } catch (docError) {
        console.error("Error creating document during registration:", docError);
        // Continue anyway - the auth listener will try to create it again if needed
      }
      
      console.log("Account created successfully, navigating to dashboard");
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Registration error:", err);
      let message = 'Failed to create account';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Create Account</h2>
        
        {error && <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          
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
          
          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 