import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createFFmpeg, FFmpeg } from '@ffmpeg/ffmpeg';
import { useAuth } from '../contexts/AuthContext';

// Initialize FFmpeg with error handling
let ffmpeg: FFmpeg | undefined;
try {
  ffmpeg = createFFmpeg({
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
  });
} catch (error) {
  console.error('Error initializing FFmpeg:', error);
}

interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  genre: string;
  audioUrl: string;
  duration: number;
}

interface Template {
  id: string;
  name: string;
  thumbnailUrl: string;
  description: string;
}

const ShowcaseCreator: React.FC = () => {
  const { currentUser } = useAuth();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedBeats, setSelectedBeats] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegError, setFfmpegError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      if (!ffmpeg) {
        setFfmpegError("FFmpeg initialization failed. Some browser security features may need to be enabled.");
        return;
      }
      
      if (!ffmpeg.isLoaded()) {
        try {
          await ffmpeg.load();
          setFfmpegLoaded(true);
        } catch (error) {
          console.error('Error loading FFmpeg:', error);
          setFfmpegError(error instanceof Error ? error.message : 'Unknown error loading FFmpeg');
        }
      } else {
        setFfmpegLoaded(true);
      }
    };

    loadFFmpeg();
  }, []);

  // Fetch beats and templates when user is available
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        console.log("Fetching beats and templates for user:", currentUser.uid);
        
        // Fetch beats
        const beatsQuery = query(
          collection(db, 'beats'),
          where('userId', '==', currentUser.uid)
        );
        
        const beatsSnapshot = await getDocs(beatsQuery);
        const beatsList: Beat[] = [];
        
        beatsSnapshot.forEach((doc) => {
          beatsList.push({
            id: doc.id,
            ...doc.data()
          } as Beat);
        });
        
        setBeats(beatsList);
        console.log(`Fetched ${beatsList.length} beats`);
        
        // Fetch templates
        const templatesSnapshot = await getDocs(collection(db, 'templates'));
        const templatesList: Template[] = [];
        
        templatesSnapshot.forEach((doc) => {
          templatesList.push({
            id: doc.id,
            ...doc.data()
          } as Template);
        });
        
        setTemplates(templatesList);
        console.log(`Fetched ${templatesList.length} templates`);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  const handleBeatSelect = (beatId: string) => {
    if (selectedBeats.includes(beatId)) {
      setSelectedBeats(selectedBeats.filter(id => id !== beatId));
    } else {
      setSelectedBeats([...selectedBeats, beatId]);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const generateShowcase = async () => {
    if (!ffmpegLoaded) {
      alert('Video processing engine is not loaded yet. Please wait.');
      return;
    }
    
    if (selectedBeats.length === 0) {
      alert('Please select at least one beat');
      return;
    }
    
    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }
    
    if (!title) {
      alert('Please enter a title for your showcase');
      return;
    }
    
    setGenerating(true);
    setProgress(0);
    
    try {
      // Placeholder for actual video generation logic
      // This is a simplified version - actual implementation would involve:
      // 1. Download audio files
      // 2. Generate video frames based on template
      // 3. Use FFmpeg to combine audio and video
      // 4. Upload the final video
      
      // Simulating progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 5;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          
          // Create a mock video URL (in a real app, this would be the actual video)
          const mockVideoUrl = 'https://example.com/showcase-video.mp4';
          setPreviewUrl(mockVideoUrl);
          
          setGenerating(false);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error generating showcase:', error);
      alert('Failed to generate showcase video');
      setGenerating(false);
    }
  };

  const publishToYouTube = async () => {
    if (!previewUrl) {
      alert('Please generate a showcase first');
      return;
    }
    
    alert('YouTube upload feature coming soon!');
    // Implementation would include:
    // 1. Connecting to YouTube API
    // 2. Uploading the video with metadata
    // 3. Handling upload progress and completion
  };

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
        <h1 className="mb-6 text-3xl font-bold">Create Showcase</h1>
        
        {ffmpegError && (
          <div className="mb-6 rounded-lg bg-yellow-100 p-4 text-yellow-800">
            <h3 className="mb-2 font-bold">Video Processing Error</h3>
            <p>{ffmpegError}</p>
            <p className="mt-2">
              This feature requires a secure context with special headers. For now, you can still browse and manage your beats.
            </p>
          </div>
        )}
        
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Beat Selection */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">1. Select Beats</h2>
            {beats.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {beats.map((beat) => (
                  <div 
                    key={beat.id} 
                    className={`mb-2 cursor-pointer rounded-md p-3 ${
                      selectedBeats.includes(beat.id) 
                        ? 'bg-indigo-100 border border-indigo-300' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleBeatSelect(beat.id)}
                  >
                    <h3 className="font-semibold">{beat.title}</h3>
                    <div className="text-sm text-gray-600">
                      {beat.bpm} BPM | Key: {beat.key} | {beat.genre}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4">No beats in your library</p>
                <Link to="/library" className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
                  Upload Beats
                </Link>
              </div>
            )}
          </div>
          
          {/* Template Selection */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">2. Choose Template</h2>
            <div className="grid grid-cols-2 gap-2">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <div 
                    key={template.id}
                    className={`cursor-pointer rounded-lg border p-2 ${
                      selectedTemplate === template.id
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="mb-2 h-24 w-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-md"></div>
                    <div className="text-center text-sm font-medium">{template.name}</div>
                  </div>
                ))
              ) : (
                // Fallback templates if none are fetched from the database
                <>
                  <div 
                    className={`cursor-pointer rounded-lg border p-2 ${
                      selectedTemplate === 'template1' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTemplateSelect('template1')}
                  >
                    <div className="mb-2 h-24 w-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-md"></div>
                    <div className="text-center text-sm font-medium">Waves</div>
                  </div>
                  <div 
                    className={`cursor-pointer rounded-lg border p-2 ${
                      selectedTemplate === 'template2' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTemplateSelect('template2')}
                  >
                    <div className="mb-2 h-24 w-full bg-gradient-to-r from-red-500 to-orange-500 rounded-md"></div>
                    <div className="text-center text-sm font-medium">Fire</div>
                  </div>
                  <div 
                    className={`cursor-pointer rounded-lg border p-2 ${
                      selectedTemplate === 'template3' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTemplateSelect('template3')}
                  >
                    <div className="mb-2 h-24 w-full bg-gradient-to-r from-blue-500 to-green-500 rounded-md"></div>
                    <div className="text-center text-sm font-medium">Spectrum</div>
                  </div>
                  <div 
                    className={`cursor-pointer rounded-lg border p-2 ${
                      selectedTemplate === 'template4' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTemplateSelect('template4')}
                  >
                    <div className="mb-2 h-24 w-full bg-gradient-to-r from-gray-700 to-gray-900 rounded-md"></div>
                    <div className="text-center text-sm font-medium">Minimal</div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">3. Video Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. 'Hard Trap Beats Showcase 2023'"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  rows={3}
                  placeholder="Describe your beats..."
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="tags" className="mb-1 block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. trap, beats, hip hop, rap"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Generation Controls */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={generateShowcase}
            disabled={generating || selectedBeats.length === 0 || !selectedTemplate || !title || ffmpegError !== null}
            className="mr-4 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {generating ? 'Generating...' : 'Generate Showcase'}
          </button>
          
          <button
            onClick={publishToYouTube}
            disabled={!previewUrl || generating}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:bg-red-300"
          >
            Publish to YouTube
          </button>
        </div>
        
        {/* Progress and Preview */}
        {generating && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">Generating Showcase</h2>
            <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div 
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600">
              {progress}% Complete
            </p>
          </div>
        )}
        
        {previewUrl && !generating && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">Preview</h2>
            <div className="aspect-video w-full bg-black">
              {/* In a real app, this would be an actual video player */}
              <div className="flex h-full items-center justify-center text-white">
                Video Preview (Placeholder)
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ShowcaseCreator; 