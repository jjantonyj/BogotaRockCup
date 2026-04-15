import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, serverTimestamp, doc, setDoc, getDocFromServer, collection, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';
import adminsData from './data/admins.json';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const isAdmin = (email: string | null | undefined) => {
  if (!email) return false;
  return (adminsData as string[]).includes(email);
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper for voting
export const voteForBand = async (matchId: string, bandId: string) => {
  if (!auth.currentUser) throw new Error('Must be logged in to vote');
  
  const voteId = `${matchId}_${auth.currentUser.uid}`;
  const path = `votes/${voteId}`;
  console.log('Attempting to vote:', { matchId, bandId, userId: auth.currentUser.uid, voteId });
  
  try {
    const voteRef = doc(db, 'votes', voteId);
    await setDoc(voteRef, {
      matchId,
      bandId,
      userId: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });
    console.log('Vote successfully recorded');
  } catch (error) {
    console.error('Detailed voting error:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// CRUD for Bands
export const getBands = async () => {
  try {
    const q = query(collection(db, 'bands'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bands');
  }
};

export const addBand = async (bandData: any) => {
  try {
    const { id, ...data } = bandData;
    if (id) {
      await setDoc(doc(db, 'bands', id), { ...data, createdAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'bands'), { ...data, createdAt: serverTimestamp() });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'bands');
  }
};

export const updateBand = async (id: string, bandData: any) => {
  try {
    const bandRef = doc(db, 'bands', id);
    await updateDoc(bandRef, bandData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bands/${id}`);
  }
};

export const deleteBand = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'bands', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bands/${id}`);
  }
};

// CRUD for Matches
export const getMatches = async () => {
  try {
    const q = query(collection(db, 'matches'), orderBy('date'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'matches');
  }
};

export const addMatch = async (matchData: any) => {
  try {
    const { id, ...data } = matchData;
    if (id) {
      await setDoc(doc(db, 'matches', id), { ...data, createdAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'matches'), { ...data, createdAt: serverTimestamp() });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'matches');
  }
};

export const updateMatch = async (id: string, matchData: any) => {
  try {
    const matchRef = doc(db, 'matches', id);
    await updateDoc(matchRef, matchData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `matches/${id}`);
  }
};

export const deleteMatch = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'matches', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `matches/${id}`);
  }
};

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
