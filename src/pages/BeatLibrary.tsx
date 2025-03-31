import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  genre: string;
  uploadDate: string;
  audioUrl: string;
  duration: number;
  blobUrl?: string; // For local URLs that work with CORS
}

const BeatLibrary: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isAudioOnlyMode = location.state && location.state.disableCoep;
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingBeat, setUploadingBeat] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [corsError, setCorsError] = useState(false);
  const navigate = useNavigate();

  // If in audio-only mode, update document title to indicate it
  useEffect(() => {
    if (isAudioOnlyMode) {
      document.title = 'BeatShowcase Pro - Audio Player';
    }
  }, [isAudioOnlyMode]);

  // Fetch beats when user is available
  useEffect(() => {
    const fetchBeats = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        console.log("Fetching beats for user:", currentUser.uid);
        const beatsQuery = query(
          collection(db, 'beats'),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(beatsQuery);
        const beatList: Beat[] = [];
        
        querySnapshot.forEach((doc) => {
          beatList.push({
            id: doc.id,
            ...doc.data()
          } as Beat);
        });
        
        setBeats(beatList);
        console.log(`Fetched ${beatList.length} beats`);
      } catch (error) {
        console.error('Error fetching beats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, [currentUser, navigate]);

  // Create local blob URLs for audio files to handle CORS
  useEffect(() => {
    const fetchAudioBlobs = async () => {
      try {
        const updatedBeats = await Promise.all(
          beats.map(async (beat) => {
            if (beat.blobUrl) return beat; // Skip if already processed
            
            try {
              // Fetch audio file
              const response = await fetch(beat.audioUrl, { mode: 'cors' });
              
              if (!response.ok) {
                throw new Error(`Failed to fetch audio: ${response.status}`);
              }
              
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              
              return { ...beat, blobUrl };
            } catch (error) {
              console.error(`Error fetching audio for ${beat.title}:`, error);
              setCorsError(true);
              return beat;
            }
          })
        );
        
        setBeats(updatedBeats);
      } catch (error) {
        console.error('Error creating blob URLs:', error);
        setCorsError(true);
      }
    };
    
    if (beats.length > 0) {
      fetchAudioBlobs();
    }
    
    // Cleanup blob URLs on unmount
    return () => {
      beats.forEach(beat => {
        if (beat.blobUrl) {
          URL.revokeObjectURL(beat.blobUrl);
        }
      });
    };
  }, [beats.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile || !title || !bpm || !key || !genre) {
      alert('Please fill all fields and select an audio file');
      return;
    }
    
    if (!currentUser) {
      alert('You must be logged in to upload beats');
      return;
    }
    
    setUploadingBeat(true);
    setUploadProgress(0);
    
    try {
      const userId = currentUser.uid;
      
      // Clean the filename - Firebase Storage can be sensitive to special characters
      const originalName = audioFile.name;
      const cleanFileName = originalName
        .replace(/\s+/g, '_')       // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9_.-]/g, ''); // Remove any non-alphanumeric characters except underscores, periods, and hyphens
      
      const fileName = `${Date.now()}_${cleanFileName}`;
      console.log("Original filename:", originalName);
      console.log("Cleaned filename for upload:", fileName);
      
      // Check file size - Firebase Storage has limits
      const fileSizeMB = audioFile.size / (1024 * 1024);
      console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
      
      if (fileSizeMB > 50) {
        alert('File size exceeds 50MB. Please use a smaller file.');
        setUploadingBeat(false);
        return;
      }
      
      // Create storage reference with cleaned file name
      const storageRef = ref(storage, `users/${userId}/beats/${fileName}`);
      
      console.log("Uploading audio file:", fileName);
      console.log("Storage reference path:", storageRef.fullPath);
      
      // Upload the audio file
      const uploadTask = uploadBytesResumable(storageRef, audioFile);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          
          let errorMessage = 'Error uploading file';
          
          // Check for specific error codes
          if (error.code === 'storage/unauthorized') {
            errorMessage = 'You don\'t have permission to upload files';
          } else if (error.code === 'storage/canceled') {
            errorMessage = 'Upload was cancelled';
          } else if (error.code === 'storage/server-file-wrong-size') {
            errorMessage = 'File size mismatch. Try again with a different file.';
          } else if (error.code === 'storage/retry-limit-exceeded') {
            errorMessage = 'Upload failed too many times. Please check your connection.';
          } else if (error.code === 'storage/invalid-argument') {
            errorMessage = 'Invalid file format. Try renaming the file or using a different file.';
          } else if (error.name === 'AbortError') {
            errorMessage = 'Upload was aborted. Please try again.';
          } else if (error.message && error.message.includes('500')) {
            errorMessage = 'Server error (500). This might be due to file name, size, or server issues. Try renaming the file or using a different file.';
          }
          
          alert(errorMessage);
          setUploadingBeat(false);
        },
        async () => {
          // Get the download URL
          const audioUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File uploaded, URL:", audioUrl);
          
          // TODO: Calculate actual duration from audio file
          const duration = 180; // Placeholder - 3 minutes
          
          console.log("Creating beat document in Firestore");
          // Create beat document in Firestore
          const beatData = {
            userId,
            title,
            bpm: parseInt(bpm, 10),
            key,
            genre,
            uploadDate: new Date().toISOString(),
            audioUrl,
            duration
          };
          
          const beatRef = await addDoc(collection(db, 'beats'), beatData);
          console.log("Beat document created:", beatRef.id);
          
          try {
            console.log("Updating user's beat count");
            // Update user's beat count
            const userRef = doc(db, 'users', userId);
            
            // Check if user document exists first
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              await updateDoc(userRef, {
                beatsCount: increment(1)
              });
              console.log("User beat count updated successfully");
            } else {
              console.log("User document doesn't exist, creating it");
              await setDoc(userRef, {
                name: currentUser?.displayName || 'User',
                email: currentUser?.email || '',
                subscription: 'free',
                beatsCount: 1, // Start with 1 since this is their first beat
                showcasesCount: 0,
                createdAt: new Date().toISOString()
              });
              console.log("User document created with initial beat count");
            }
          } catch (error) {
            console.error("Error updating user beat count:", error);
            // Continue anyway - we don't want to block the beat upload process
            // due to a permission issue with the beat counter
          }
          
          // Reset form and state
          setTitle('');
          setBpm('');
          setKey('');
          setGenre('');
          setAudioFile(null);
          setUploadingBeat(false);
          
          // Create a blob URL for the newly uploaded file
          try {
            const response = await fetch(audioUrl, { mode: 'cors' });
            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              
              // Add the new beat to the list with blob URL
              setBeats([...beats, {
                id: beatRef.id,
                ...beatData,
                blobUrl
              } as Beat]);
            } else {
              // Add without blob URL
              setBeats([...beats, {
                id: beatRef.id,
                ...beatData
              } as Beat]);
              setCorsError(true);
            }
          } catch (error) {
            console.error('Error creating blob URL for new upload:', error);
            setBeats([...beats, {
              id: beatRef.id,
              ...beatData
            } as Beat]);
            setCorsError(true);
          }
          
          console.log("Beat upload complete");
        }
      );
    } catch (error) {
      console.error('Error in upload process:', error);
      alert('Failed to upload beat');
      setUploadingBeat(false);
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
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Beat Library</h1>
          <button 
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            onClick={() => document.getElementById('uploadForm')?.classList.toggle('hidden')}
          >
            Upload New Beat
          </button>
        </div>
        
        {corsError && (
          <div className="mb-6 rounded-lg bg-yellow-100 p-4 text-yellow-800">
            <h3 className="font-bold mb-2">Audio Playback Issue</h3>
            <p>There's a conflict between the security settings needed for video creation and audio playback.</p>
            <div className="mt-3 flex space-x-3">
              <a 
                href="/library-audio-only" 
                target="_blank"
                className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Open Audio Player
              </a>
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.reload();
                }}
                className="inline-block rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Refresh Page
              </a>
            </div>
          </div>
        )}
        
        {/* Upload Form */}
        <div id="uploadForm" className="mb-8 hidden rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold">Upload New Beat</h2>
          <form onSubmit={handleUpload}>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-2 block font-medium text-gray-700">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="bpm" className="mb-2 block font-medium text-gray-700">BPM</label>
                <input
                  id="bpm"
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="key" className="mb-2 block font-medium text-gray-700">Key</label>
                <select
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">Select Key</option>
                  <option value="C">C</option>
                  <option value="C#">C#</option>
                  <option value="D">D</option>
                  <option value="D#">D#</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="F#">F#</option>
                  <option value="G">G</option>
                  <option value="G#">G#</option>
                  <option value="A">A</option>
                  <option value="A#">A#</option>
                  <option value="B">B</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="genre" className="mb-2 block font-medium text-gray-700">Genre</label>
                <input
                  id="genre"
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="audioFile" className="mb-2 block font-medium text-gray-700">Audio File (MP3)</label>
              <input
                id="audioFile"
                type="file"
                accept="audio/mpeg"
                onChange={handleFileChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            
            {uploadingBeat && (
              <div className="mb-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-full bg-indigo-600" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-center text-sm text-gray-600">
                  Uploading: {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={uploadingBeat}
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {uploadingBeat ? 'Uploading...' : 'Upload Beat'}
            </button>
          </form>
        </div>
        
        {/* Beat Library */}
        {beats.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {beats.map((beat) => (
              <div key={beat.id} className="rounded-lg bg-white p-4 shadow-md">
                <h3 className="mb-2 text-lg font-semibold">{beat.title}</h3>
                <div className="mb-4 flex text-sm text-gray-600">
                  <span className="mr-3">{beat.bpm} BPM</span>
                  <span className="mr-3">Key: {beat.key}</span>
                  <span>{beat.genre}</span>
                </div>
                {!beat.blobUrl && corsError ? (
                  <div className="mb-3 rounded-md bg-gray-100 p-3 text-center text-sm">
                    <p>Audio playback unavailable due to security settings.</p>
                    <a 
                      href="/library-audio-only" 
                      target="_blank"
                      className="mt-2 inline-block rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                    >
                      Open Audio Player
                    </a>
                  </div>
                ) : (
                  <audio src={beat.blobUrl || beat.audioUrl} controls className="mb-3 w-full"></audio>
                )}
                <div className="flex justify-end">
                  <button className="mr-2 rounded-md bg-indigo-100 px-3 py-1 text-indigo-700 hover:bg-indigo-200">
                    Edit
                  </button>
                  <button className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="mb-4 text-xl">Your beat library is empty</p>
            <p className="mb-6 text-gray-600">Upload your first beat to get started!</p>
            <button 
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              onClick={() => document.getElementById('uploadForm')?.classList.remove('hidden')}
            >
              Upload Beat
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BeatLibrary; 