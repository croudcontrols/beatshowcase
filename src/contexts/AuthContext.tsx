import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, reconnectFirestore } from '../firebase/config';

interface UserData {
  uid: string;
  name: string;
  email: string;
  subscription: string;
  beatsCount: number;
  showcasesCount: number;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  createUserDocument: (uid: string, data: any) => Promise<void>;
  isOffline: boolean;
  reconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  createUserDocument: async () => {},
  isOffline: false,
  reconnect: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network is online");
      setIsOffline(false);
      reconnect();
    };

    const handleOffline = () => {
      console.log("Network is offline");
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reconnect to Firebase
  const reconnect = async () => {
    try {
      console.log("Attempting to reconnect to Firestore");
      await reconnectFirestore();
      
      // Re-fetch user data if needed
      if (currentUser && !userData) {
        setTimeout(() => {
          fetchUserData(currentUser);
        }, 1000); // Wait a bit after reconnection
      }
    } catch (error) {
      console.error("Error reconnecting to Firestore:", error);
    }
  };

  // Create a user document in Firestore
  const createUserDocument = async (uid: string, data: any) => {
    try {
      console.log(`Creating user document for UID: ${uid}`, data);
      const userRef = doc(db, 'users', uid);
      
      // Add a timestamp for the creation time
      const userData = {
        ...data,
        createdAt: Timestamp.now().toDate().toISOString()
      };
      
      await setDoc(userRef, userData);
      console.log(`User document created successfully for UID: ${uid}`);
      
      return userData;
    } catch (error) {
      console.error(`Error creating user document for UID: ${uid}:`, error);
      
      if (isOffline) {
        console.warn("User is offline. Document will be created when back online.");
      }
      
      throw error;
    }
  };

  // Fetch user data helper function with retries
  const fetchUserData = async (user: User) => {
    try {
      console.log("Fetching user data for:", user.uid, "- Attempt:", retryCount + 1);
      
      // Try to reconnect before fetching
      if (retryCount > 0) {
        console.log("Reconnecting before retry attempt");
        await reconnectFirestore();
      }
      
      const userRef = doc(db, 'users', user.uid);
      
      console.log("Getting document snapshot...");
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        console.log("User document exists, data:", docSnap.data());
        const data = docSnap.data();
        setUserData({
          uid: user.uid,
          name: data.name || user.displayName || 'User',
          email: data.email || user.email || '',
          subscription: data.subscription || 'free',
          beatsCount: data.beatsCount || 0,
          showcasesCount: data.showcasesCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
        });
        
        // Reset retry counter on success
        setRetryCount(0);
      } else {
        console.log("Creating new user document");
        // Create a default user document
        const newUserData = {
          name: user.displayName || 'User',
          email: user.email || '',
          subscription: 'free',
          beatsCount: 0,
          showcasesCount: 0,
          createdAt: new Date().toISOString(),
        };
        
        try {
          await createUserDocument(user.uid, newUserData);
          setUserData({
            uid: user.uid,
            ...newUserData
          });
          
          // Reset retry counter on success
          setRetryCount(0);
        } catch (docError) {
          console.error("Failed to create user document:", docError);
          // Continue without user data - the app should still work
          setUserData({
            uid: user.uid,
            ...newUserData
          });
        }
      }
    } catch (error) {
      console.error("Error in user data handling:", error);
      
      if (error instanceof Error && error.message.includes("offline")) {
        setIsOffline(true);
        console.warn("Offline mode detected. Some features may be limited.");
        
        // Retry fetching up to 3 times
        if (retryCount < 3) {
          console.log(`Will retry fetching data (${retryCount + 1}/3)`);
          setRetryCount(retryCount + 1);
          
          // Wait a moment before retrying
          setTimeout(() => {
            fetchUserData(user);
          }, 2000);
          return; // Return early to avoid setting loading to false
        }
      }
      
      // Set a minimal user profile so the app can continue
      setUserData({
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        subscription: 'free',
        beatsCount: 0,
        showcasesCount: 0,
        createdAt: new Date().toISOString(),
      });
    } finally {
      // Only set loading to false if all retries are done
      if (retryCount >= 3 || !isOffline) {
        setLoading(false);
      }
    }
  };

  // Handle authentication state changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Ensure Firestore is connected first
    const setupAuth = async () => {
      try {
        // Wait for Firestore to connect
        await reconnectFirestore();
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user");
          setCurrentUser(user);
          
          if (!user) {
            setUserData(null);
            setLoading(false);
            return;
          }
          
          // When we have a user, try to get their data
          fetchUserData(user);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    createUserDocument,
    isOffline,
    reconnect,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {isOffline && (
        <div className="fixed bottom-4 right-4 rounded-md bg-yellow-500 p-2 text-white shadow-lg">
          You are currently offline. Some features may be limited.
        </div>
      )}
    </AuthContext.Provider>
  );
}; 