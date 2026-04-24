// backend/config/firebase.js
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
    serviceAccount = JSON.parse(buffer.toString('utf-8'));
  } else {
    throw new Error('La variable FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida en .env');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.firebasestorage.app` // Asegura compatibilidad con el nuevo formato de Storage
  });

  console.log('🔥 Firebase Admin SDK Inicializado con éxito en Enlapet 2.0');
} catch (error) {
  console.error('❌ Error crítico inicializando Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
