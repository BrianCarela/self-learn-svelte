import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import pkg from 'firebase-admin';

try {
  pkg.initializeApp({
    credential: pkg.credential.cert({
      projectId: process.env.VITE_FB_PROJECT_ID,
      clientEmail: process.env.VITE_FB_CLIENT_EMAIL,
      privateKey: process.env.VITE_FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} catch (err) {
  if (!/already exists/u.test(err.message)) {
    console.error('Firebase Admin Error: ', err.stack)
  }
}


export const adminDB = getFirestore();
export const adminAuth = getAuth();