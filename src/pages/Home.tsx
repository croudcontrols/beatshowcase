import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <header className="mb-16">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold">BeatShowcase Pro</div>
            <div>
              <Link to="/login" className="mr-4 hover:text-indigo-300">Log In</Link>
              <Link to="/register" className="rounded-lg bg-indigo-500 px-4 py-2 hover:bg-indigo-600">Sign Up</Link>
            </div>
          </nav>
        </header>

        <main>
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="mb-6 text-5xl font-bold">Create Professional Beat Showcases</h1>
            <p className="mb-8 text-xl">
              Automatically generate YouTube showcase videos for your beats without video editing skills
            </p>
            <Link to="/register" className="rounded-lg bg-indigo-500 px-6 py-3 text-lg font-semibold hover:bg-indigo-600">
              Start For Free
            </Link>
          </div>

          <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-indigo-800 bg-opacity-50 p-6">
              <h3 className="mb-4 text-xl font-semibold">Save Time</h3>
              <p>Create professional showcase videos in minutes, not hours</p>
            </div>
            <div className="rounded-lg bg-indigo-800 bg-opacity-50 p-6">
              <h3 className="mb-4 text-xl font-semibold">Boost Engagement</h3>
              <p>Attract more listeners with visually appealing showcases</p>
            </div>
            <div className="rounded-lg bg-indigo-800 bg-opacity-50 p-6">
              <h3 className="mb-4 text-xl font-semibold">Increase Sales</h3>
              <p>Convert viewers to customers with professional presentations</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home; 