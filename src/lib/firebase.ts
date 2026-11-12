import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  doc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    (firebaseConfig as any).firestoreDatabaseId
  );
} catch (e) {
  // Fallback if running in an environment without IndexedDB or already initialized
  firestoreInstance = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { firebaseConfig };

// Test Firestore connection on boot per Firebase skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    // If not signed in, getDocFromServer may throw permission-denied or offline, which is expected
    if (auth.currentUser) {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable.');
    }
    return false;
  }
}

// Initial connection verification attempt
testConnection().catch(() => {});
