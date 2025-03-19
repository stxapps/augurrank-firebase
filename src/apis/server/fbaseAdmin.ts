import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { isFldStr } from '@/utils';

if (isFldStr(process.env.FIRESTORE_EMULATOR_HOST)) {
  if (getApps().length === 0) initializeApp();
} else {
  if (getApps().length === 0) {
    initializeApp({ credential: applicationDefault() });
  }
}

const fstoreAdmin = getFirestore();

export { fstoreAdmin };
