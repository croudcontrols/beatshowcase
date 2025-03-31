import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();

  // If not authenticated, redirect to login
  React.useEffect(() => {
    if (!loading && !userData) {
      navigate('/login');
    }
  }, [userData, loading, navigate]);

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
        <h1 className="mb-6 text-3xl font-bold">Welcome, {userData?.name}</h1>
        
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-lg font-semibold text-gray-700">Subscription</h3>
            <p className="mb-2 text-2xl font-bold capitalize">{userData?.subscription}</p>
            <Link to="/profile" className="text-sm text-indigo-600 hover:underline">Upgrade Plan</Link>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-lg font-semibold text-gray-700">Beats</h3>
            <p className="mb-2 text-2xl font-bold">{userData?.beatsCount}</p>
            <Link to="/library" className="text-sm text-indigo-600 hover:underline">Manage Library</Link>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-lg font-semibold text-gray-700">Showcases</h3>
            <p className="mb-2 text-2xl font-bold">{userData?.showcasesCount}</p>
            <Link to="/create" className="text-sm text-indigo-600 hover:underline">Create New</Link>
          </div>
        </div>
        
        <div className="rounded-lg bg-indigo-50 p-6">
          <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link to="/library" className="flex items-center rounded-lg bg-white p-4 shadow-sm hover:bg-gray-50">
              <div className="mr-4 rounded-full bg-indigo-100 p-3">
                <span className="text-indigo-600">📁</span>
              </div>
              <div>
                <h3 className="font-semibold">Upload Beat</h3>
                <p className="text-sm text-gray-600">Add new beats to your library</p>
              </div>
            </Link>
            
            <Link to="/create" className="flex items-center rounded-lg bg-white p-4 shadow-sm hover:bg-gray-50">
              <div className="mr-4 rounded-full bg-indigo-100 p-3">
                <span className="text-indigo-600">🎬</span>
              </div>
              <div>
                <h3 className="font-semibold">Create Showcase</h3>
                <p className="text-sm text-gray-600">Generate a new showcase video</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 