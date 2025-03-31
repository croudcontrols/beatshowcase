import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface UserData {
  name: string;
  email: string;
  subscription: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserData;
            setUserData(data);
            setNewEmail(user.email || '');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // User is not logged in, redirect to login
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setSuccessMessage('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password should be at least 6 characters');
      return;
    }
    
    if (!auth.currentUser) {
      setPasswordError('You must be logged in to change your password');
      return;
    }
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email || '',
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      setSuccessMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password');
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setSuccessMessage('');
    
    if (!auth.currentUser) {
      setEmailError('You must be logged in to change your email');
      return;
    }
    
    if (newEmail === auth.currentUser.email) {
      setEmailError('New email is the same as current email');
      return;
    }
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email || '',
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update email
      await updateEmail(auth.currentUser, newEmail);
      
      // Update email in Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { email: newEmail });
      
      if (userData) {
        setUserData({
          ...userData,
          email: newEmail
        });
      }
      
      setSuccessMessage('Email updated successfully');
      setCurrentPassword('');
    } catch (error: any) {
      setEmailError(error.message || 'Failed to update email');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 py-4 text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="text-2xl font-bold">BeatShowcase Pro</div>
          <nav className="flex items-center space-x-4">
            <Link to="/dashboard" className="hover:text-indigo-200">Dashboard</Link>
            <Link to="/library" className="hover:text-indigo-200">My Beats</Link>
            <Link to="/create" className="hover:text-indigo-200">Create Showcase</Link>
            <Link to="/profile" className="hover:text-indigo-200">Profile</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">My Profile</h1>
        
        {successMessage && (
          <div className="mb-6 rounded-md bg-green-100 p-4 text-green-700">
            {successMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Account Details */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">Account Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{userData?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userData?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subscription</p>
                <p className="font-medium capitalize">{userData?.subscription}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="mt-4 rounded-md bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Subscription */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">Subscription</h2>
            <div className="mb-4 rounded-lg bg-indigo-50 p-4">
              <p className="mb-1 text-sm font-medium text-indigo-800">Current Plan</p>
              <p className="text-2xl font-bold capitalize text-indigo-800">{userData?.subscription}</p>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">Producer</h3>
                    <p className="text-sm text-gray-600">For individual producers</p>
                  </div>
                  <div className="text-xl font-bold">$9.99/mo</div>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>• 50 beats storage</li>
                  <li>• 10 showcases per month</li>
                  <li>• 5 templates</li>
                </ul>
                <button className="mt-3 w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700">
                  {userData?.subscription === 'producer' ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
              
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">Studio</h3>
                    <p className="text-sm text-gray-600">For professional producers</p>
                  </div>
                  <div className="text-xl font-bold">$24.99/mo</div>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>• Unlimited beats storage</li>
                  <li>• Unlimited showcases</li>
                  <li>• All templates</li>
                  <li>• Custom branding</li>
                </ul>
                <button className="mt-3 w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700">
                  {userData?.subscription === 'studio' ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Security */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold">Change Password</h2>
              {passwordError && (
                <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{passwordError}</div>
              )}
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label htmlFor="current-password" className="mb-1 block text-sm font-medium">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="new-password" className="mb-1 block text-sm font-medium">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">Confirm New Password</label>
                  <input
                    id="confirm-password"
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
                  className="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700"
                >
                  Update Password
                </button>
              </form>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold">Change Email</h2>
              {emailError && (
                <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{emailError}</div>
              )}
              <form onSubmit={handleEmailChange}>
                <div className="mb-3">
                  <label htmlFor="new-email" className="mb-1 block text-sm font-medium">New Email</label>
                  <input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email-current-password" className="mb-1 block text-sm font-medium">Current Password</label>
                  <input
                    id="email-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700"
                >
                  Update Email
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile; 