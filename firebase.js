// Firebase Configuration
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSBJxf9N2_fxrBm-Ofw92vmFENDKvm7Bs",
    authDomain: "code-submit-hub.firebaseapp.com",
    projectId: "code-submit-hub",
    storageBucket: "code-submit-hub.firebasestorage.app",
    messagingSenderId: "410135076046",
    appId: "1:410135076046:web:e5723f5a7215190142449f",
    measurementId: "G-YWS6MK8E29"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Firebase Security Rules (add these in Firebase Console):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Questions collection - read access for all, write restricted
    match /questions/{docId} {
      allow read: if true; // Everyone can read questions
      allow create, update, delete: if false; // Use Firebase Console for admin operations
    }
    
    // Submissions collection
    match /submissions/{docId} {
      allow create: if true; // Students can submit
      allow read: if false; // Students cannot read
      allow update, delete: if false; // No updates or deletes
    }
    
    // Admin can read all submissions (for now - enhance with auth later)
    match /submissions/{docId} {
      allow read: if true;
    }
  }
}
*/

// Test data - create this in Firebase Console manually:
/*
Go to Firebase Console -> Firestore Database -> Add collection
Collection name: "questions"

Add a document with:
- title: "Sample C++ Question"
- description: "Write a C++ program that prints 'Hello World'"
- timerMinutes: 30
- status: "active"
- createdAt: (current timestamp)
*/

// Export for use in other files
window.db = db;
window.firebase = firebase;
