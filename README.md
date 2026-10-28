# Smart Bus Route Management System 🚍
### Digital Route Board & Transport Management Portal

Inspired by traditional red-and-white physical bus route boards, this modern, responsive, and intelligent web application digitizes physical route directories into a real-time transport dashboard. Built with a modern red, white, and charcoal palette, it features Google Authentication, role-based portals (Admin, Student, Teacher), a live 12-hour IST clock with seconds, editable route records, interactive image filters, and persistent storage.

---

## 🌟 Key Features

### 1. Main Dashboard Header
- **Three-Dot Hamburger Menu**: Smooth animated toggle opening the navigation drawer.
- **Dynamic Profile Section**: Displays user avatar, name, and role badge (`ADMIN`, `STUDENT`, `TEACHER`).
- **Automatic Current Date & Greeting**: Calculated in the user's local timezone (`Asia/Kolkata` IST), displaying day of the week and full date (e.g. *Wednesday, 28 October 2026*) with greetings like *"Good Afternoon"* / *"Good Evening"*.
- **Live Digital Clock**: 12-hour format with AM/PM and real-time seconds counter updating continuously every second.

### 2. Role-Based Access Control ("Who are you?")
Selectable, responsive role cards:
1. **Administrator (Shield)**:
   - Full route management: Add new routes, edit existing routes, delete routes with confirmation.
   - Route verification audit controls: Mark routes as `Verified Board Route` or `Needs Verification [Manual Check]` with audit notes.
   - Appearance and theme customization for the board.
   - Dashboard statistics: Total routes, active buses, verified routes, and announcements.
2. **Student (Graduation Cap)**:
   - Access to campus shuttles and city routes.
   - **"My Assigned Route"** banner (Route 12B - West Gate Hostel Complex ↔ Science Quad) with departure frequencies and driver contacts.
   - Star favorite routes for quick access.
   - View student-specific transport notices and exam timetables.
3. **Teacher / Faculty (Book Open)**:
   - Access to faculty staff quarters shuttles (Route 42 - Staff Quarters ↔ University Admin Quad).
   - Priority schedules and institutional advisories.
   - Star favorite staff routes and emergency transit helplines.

### 3. Digital Bus Route Board
- **Physical Board Aesthetic**: Bold route numbers, destination tags, category badges, and transit statuses (`On Time`, `Departing Soon`, `In Transit`, `Delayed`).
- **Physical Route Verification**: Preserves original route data and explicitly flags uncertain text with `[Needs Verification - Manual Check]` badges rather than inventing missing stops.
- **Search & Filtering**: Instant search across route number, destination, intermediate stops, bus number, and driver name. Category filters for *Campus & University*, *City Express*, *Metro Feeder*, *Suburban / Outstation*, and *Night Service*.
- **Route Details Modal**: Sequential step-by-step transit line, morning & evening timings, fare, passenger load, bus capacity, and direct telephone call buttons for fleet drivers.

### 4. Appearance & Theme Customization (Image Upload & Filters)
- Upload any image/photo from device with live preview.
- **Photographic Sliders**:
  - Brightness (50% – 150%)
  - Contrast (50% – 150%)
  - Saturation (0% – 200%)
  - Color Tone / Hue Rotate (0° – 360°)
- **Preset Filters**: *Original*, *B&W Grayscale*, *Vintage Sepia*, *Warm Sunlight*, *Cool Cyan*, *High Contrast*.
- **Placement Options**: Apply image to *Entire Dashboard Background*, *Header Banner*, or *Route Board Card Container*.
- **Dark Tint Overlay Opacity Slider (0% – 90%)**: Guarantees high text legibility and contrast over any uploaded photo.
- **Accent Color Picker**: Crimson Red, Ruby Rose, Bus Maroon, Transport Amber, Deep Navy, Forest Emerald, and custom hex picker.
- Persistent saved state across sessions.

---

## 🚀 Running the Project

### Option A: Instant Run (Zero Setup, Recommended)
This project includes a self-contained, high-performance web application in `index.html` that runs in any modern browser without needing to download Node packages.

1. **Using the Python Web Server**:
   ```powershell
   python serve.py
   ```
   Or double-click `start.bat`. Your browser will automatically open at `http://localhost:3000`.

2. **Direct Browser Execution**:
   Simply double-click `index.html` to open it directly in Chrome, Edge, Brave, or Firefox.

### Option B: Node.js & Vite Development
If you have Node.js installed and wish to build the TypeScript source code:
```bash
npm install
npm run dev
```

---

## 🔐 Firebase & Google Authentication Setup Guide

### 1. Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com).
2. Click **Add project** and name it (e.g. `smart-bus-route-system`).
3. Under **Build → Authentication**, click **Get Started**.
4. In the **Sign-in method** tab, click **Google**, enable it, select your support email, and save.
5. In **Authorized domains**, make sure `localhost` is listed.

### 2. Set Up Cloud Firestore
1. Under **Build → Firestore Database**, click **Create database**.
2. Start in test mode or production mode.
3. Deploy the rules provided in `firestore.rules`:
   ```javascript
   // firestore.rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAuthenticated() { return request.auth != null; }
       function getUserRole() {
         return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
       }
       function isAdmin() {
         return isAuthenticated() && (getUserRole() == 'admin' || request.auth.token.admin == true);
       }

       match /users/{userId} {
         allow read: if isAuthenticated();
         allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
       }

       match /routes/{routeId} {
         allow read: if true;
         allow write: if isAdmin();
       }

       match /announcements/{id} {
         allow read: if isAuthenticated();
         allow write: if isAdmin();
       }
     }
   }
   ```

### 3. Connect Credentials to the Website
You can configure Firebase in two ways:
1. **Interactive In-App Modal**:
   - On the role selection screen or in **Profile & Settings**, click **"Configure Firebase Credentials"**.
   - Paste your `apiKey`, `authDomain`, `projectId`, `storageBucket`, and `appId`.
   - Click **Save Configuration** — saved securely in local storage.
2. **Environment Variables (.env)**:
   - Copy `.env.example` to `.env` and fill in your keys:
     ```env
     VITE_FIREBASE_API_KEY=AIzaSy...
     VITE_FIREBASE_AUTH_DOMAIN=smart-bus-routes.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=smart-bus-routes
     ```

*(Note: The app includes verified 1-click test access accounts for Admin, Student, and Teacher so you can explore all role-based features immediately!)*

---

## 📁 Project Structure

```
smart-bus-route-manager/
├── index.html               # Complete, self-contained interactive web application
├── serve.py                 # Python server launcher with browser auto-open
├── start.bat                # Windows 1-click batch launcher
├── firestore.rules          # Production Firebase Firestore security rules
├── .env.example             # Firebase environment template
├── package.json             # NPM dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind theme colors & extensions
├── postcss.config.js        # PostCSS configuration
├── src/
│   ├── main.tsx             # Application entry point
│   ├── App.tsx              # Root React component
│   ├── index.css            # Custom CSS & Tailwind imports
│   ├── types.ts             # TypeScript interfaces (BusRoute, UserProfile, etc.)
│   ├── firebase.ts          # Firebase Auth & Firestore initialization
│   ├── data/
│   │   └── initialRoutes.ts # Authentic bus route dataset with verification notes
│   └── components/
│       ├── Header.tsx       # Top header with profile, date, & live IST clock
│       └── Sidebar.tsx      # Smooth animated navigation drawer
└── README.md                # Comprehensive documentation
```

---

## 🎨 Design System & Palette

- **Brand Red**: `#DC2626` (Classic transport route board crimson)
- **Dark Charcoal**: `#11151A` (Clean typography & high-contrast surfaces)
- **Pure White**: `#FFFFFF` (Card surfaces & contrast dividers)
- **Timezone**: `Asia/Kolkata` (IST, 12-hour format with AM/PM & live seconds)
