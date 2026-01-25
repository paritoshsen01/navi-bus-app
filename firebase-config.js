// Firebase Admin SDK configuration
// Replace this with your actual Firebase config from Firebase Console

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You need to download the service account key from Firebase Console
// and place it in the project root as 'serviceAccountKey.json'

const serviceAccount = require('./serviceAccountKey.json'); // You'll need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'navi-bus-48b81.firebasestorage.app' // Updated with your storage bucket
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
