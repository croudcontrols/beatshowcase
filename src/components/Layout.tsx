import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 py-4 text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <Link to="/dashboard" className="text-2xl font-bold">BeatShowcase Pro</Link>
          <nav className="flex items-center space-x-4">
            <Link to="/dashboard" className="hover:text-indigo-200">Dashboard</Link>
            <Link to="/library" className="hover:text-indigo-200">My Beats</Link>
            <Link to="/create" className="hover:text-indigo-200">Create Showcase</Link>
            <Link to="/profile" className="hover:text-indigo-200">Profile</Link>
            <button 
              onClick={handleSignOut}
              className="rounded-md bg-indigo-700 px-3 py-1 text-sm hover:bg-indigo-800"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-800 py-6 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div>
              <div className="text-xl font-bold">BeatShowcase Pro</div>
              <p className="text-sm">Create professional showcase videos for your beats</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Support</a>
            </div>
          </div>
          <div className="mt-6 text-center text-sm">
            &copy; {new Date().getFullYear()} BeatShowcase Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 