import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

import { isFldStr } from '@/utils';

let fstore;
if (isFldStr(process.env.FIRESTORE_EMULATOR_HOST)) {
  if (getApps().length === 0) initializeApp();

  fstore = getFirestore();
  connectFirestoreEmulator(fstore, '127.0.0.1', 5003);
} else {
  let fbase;

  const apps = getApps();
  if (apps.length === 0) {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    fbase = initializeApp(config);
  } else {
    fbase = apps[0];
  }
  fstore = getFirestore(fbase);
}

export { fstore };
