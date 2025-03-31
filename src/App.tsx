import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const BeatLibrary = lazy(() => import('./pages/BeatLibrary'));
const ShowcaseCreator = lazy(() => import('./pages/ShowcaseCreator'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<BeatLibrary />} />
          <Route path="/library-audio-only" element={
            <Navigate to="/library" replace state={{ disableCoep: true }} />
          } />
          <Route path="/create" element={<ShowcaseCreator />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App; 