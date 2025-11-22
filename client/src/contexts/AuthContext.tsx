import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  avatarUrl: string;
  bannerUrl: string;
  bio?: string;
  parentalPin: string;
  preferences: {
    genres: string[];
  };
  totalWatchTime?: number;
  lastWatchUpdate?: any;
  createdAt: any;
  isWatchlistPublic?: boolean;
  isContinueWatchingPublic?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function createUserProfile(user: User, username?: string) {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const baseUsername = username || user.displayName || user.email?.split('@')[0] || 'User';
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        username: baseUsername,
        avatarUrl: user.photoURL || '/img1.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200',
        bio: '',
        parentalPin: '',
        preferences: {
          genres: []
        },
        totalWatchTime: 0,
        isWatchlistPublic: true,
        isContinueWatchingPublic: true,
        createdAt: serverTimestamp()
      };
      
      await setDoc(userRef, profile);
      return profile;
    }
    
    return userDoc.data() as UserProfile;
  }

  async function fetchUserProfile(user: User) {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile);
    } else {
      const profile = await createUserProfile(user);
      setUserProfile(profile);
    }
  }

  async function signup(email: string, password: string, username: string) {
    const { isUsernameAvailable } = await import('@/lib/firestore-utils');
    const available = await isUsernameAvailable(username);
    
    if (!available) {
      throw new Error('Username is already taken or contains restricted words (e.g., "admin")');
    }
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: username });
    await createUserProfile(result.user, username);
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
  }

  async function googleSignIn() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await createUserProfile(result.user);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(updates: Partial<UserProfile>) {
    if (!currentUser || !userProfile) throw new Error('No user logged in');
    
    const userRef = doc(db, 'users', currentUser.uid);
    
    // If username is being updated, validate it first
    if (updates.username && updates.username !== userProfile.username) {
      const { isUsernameAvailable, updateUsernameInContent } = await import('@/lib/firestore-utils');
      const available = await isUsernameAvailable(updates.username, currentUser.uid);
      
      if (!available) {
        throw new Error('Username is already taken or contains restricted words (e.g., "admin")');
      }
      
      await updateUsernameInContent(
        currentUser.uid, 
        userProfile.username, 
        updates.username,
        updates.avatarUrl || userProfile.avatarUrl
      );
    }
    
    await setDoc(userRef, updates, { merge: true });
    
    setUserProfile({ ...userProfile, ...updates });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    googleSignIn,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
