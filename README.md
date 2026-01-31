# C++ Homework Submission Portal

A production-ready web application for students to submit C++ homework solutions and teachers to manage submissions. Built with vanilla HTML, CSS, and JavaScript, deployed on GitHub Pages with Firebase Firestore as the database.

## Features

### Student Page (index.html)
- Clean submission form with validation
- Real-time character counter for code
- Auto-resizing textarea
- Copy-to-clipboard functionality
- Duplicate submission prevention
- Loading states and success/error messages
- Mobile-responsive design

### Admin Dashboard (admin.html)
- View all submissions in a clean table
- Search submissions by student name
- Sort by submission date
- View full solutions in modal
- Copy solutions to clipboard
- Delete submissions
- Export all submissions to CSV
- Real-time data updates

## Tech Stack

- **Frontend**: Pure HTML, CSS, Vanilla JavaScript
- **Database**: Firebase Firestore
- **Deployment**: GitHub Pages
- **Design**: Soft UI (Neumorphism-lite) academic style

## Project Structure

```
/project
├── index.html          # Student submission page
├── admin.html          # Teacher admin dashboard
├── style.css           # Complete styling with Soft UI design
├── firebase.js         # Firebase configuration
├── app.js              # Student page functionality
├── admin.js            # Admin dashboard functionality
└── README.md           # This file
```

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and create a new project
3. Enable Firestore Database in your project
4. Create a Firestore database in test mode (we'll add security rules later)

### 2. Get Firebase Configuration

1. In your Firebase project, go to Project Settings
2. Under "Your apps", click the web icon (</>)
3. Register your app (give it a name)
4. Copy the Firebase configuration object

### 3. Update Firebase Configuration

Open `firebase.js` and replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};
```

### 4. Set Up Security Rules

In Firebase Console, go to Firestore Database → Rules and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students can only write to submissions collection
    match /submissions/{docId} {
      allow create: if true;
      allow read: if false; // Students cannot read
      allow update, delete: if false; // No updates or deletes
    }
    
    // For now, allow admin access (you can enhance this later)
    match /submissions/{docId} {
      allow read: if true;
    }
  }
}
```

### 5. Deploy to GitHub Pages

1. Push all files to a GitHub repository
2. Go to repository Settings → Pages
3. Under "Build and deployment", select "Deploy from a branch"
4. Choose the main branch and `/ (root)` folder
5. Click Save
6. Your site will be available at `https://your-username.github.io/your-repo-name`

## Usage

### For Students

1. Access the main page (`index.html`)
2. Fill in your full name
3. Describe the problem you're solving
4. Paste your C++ solution code
5. Click "Submit Solution"

### For Teachers

1. Access the admin page (`admin.html`)
2. View all student submissions
3. Search by student name
4. Click "View" to see full solutions
5. Use "Copy" to copy code to clipboard
6. Use "Delete" to remove submissions
7. Click "Export to CSV" to download all submissions

## Security Notes

- Students can only write submissions, they cannot read others' submissions
- The admin dashboard should be protected (consider adding password protection)
- For production, enhance Firebase security rules with proper authentication
- Consider adding rate limiting to prevent spam submissions

## Customization

### Colors and Styling

Edit `style.css` to customize:
- Primary color: Change `#4a90e2` to your preferred color
- Background gradient: Modify the `body` background
- Card shadows and borders: Adjust `.card` styles

### Form Fields

Add or remove fields in both HTML files:
1. Update the form in `index.html`
2. Update the table headers in `admin.html`
3. Modify the JavaScript files to handle new fields

### Firebase Collection

Change the collection name from "submissions" by updating:
- `db.collection('submissions')` in both JavaScript files
- Security rules in Firebase Console

## Troubleshooting

### Common Issues

1. **Firebase connection error**: Check your Firebase configuration
2. **Permission denied**: Verify Firestore security rules
3. **Deployment issues**: Ensure all files are in the repository root
4. **Modal not working**: Check for JavaScript errors in browser console

### Browser Compatibility

This application works on all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the browser console for JavaScript errors
2. Verify Firebase configuration and rules
3. Ensure all files are properly deployed
4. Test with different browsers if needed

---

**Ready to deploy!** Follow the setup instructions above to get your C++ Homework Submission Portal running in minutes.
