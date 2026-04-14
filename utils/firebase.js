// utils/firebase.js
// Firebase configuration — values are injected from environment variables at build time
// For local dev, copy .env.example to .env and fill in your Firebase project values.

(function () {
  const firebaseConfig = {
    apiKey:            window.__ENV__?.FIREBASE_API_KEY            || "",
    authDomain:        window.__ENV__?.FIREBASE_AUTH_DOMAIN        || "",
    projectId:         window.__ENV__?.FIREBASE_PROJECT_ID         || "",
    storageBucket:     window.__ENV__?.FIREBASE_STORAGE_BUCKET     || "",
    messagingSenderId: window.__ENV__?.FIREBASE_MESSAGING_SENDER_ID|| "",
    appId:             window.__ENV__?.FIREBASE_APP_ID             || "",
  };

  // Guard against double-init (Babel/hot-reload can run this twice)
  if (!firebase.apps || firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  window._db   = firebase.firestore();
  window._auth = firebase.auth();
})();
