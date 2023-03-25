const firebaseAdmin = require("firebase-admin");

const serviceAccount = require("../../serviceAccountKey.json");

const firebase = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    ...serviceAccount,
    client_id: process.env.FIREBASE_CLIENT_ID,
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.FIREBASE_REALTIME_URL,
});

module.exports = {
  firebase,
};
