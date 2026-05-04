# PactTrack 🚀

PactTrack is a comprehensive, full-stack Habit Tracker designed not just to track your habits, but to hold you strictly accountable. Through a unique system of financial accountability (fines and a "piggy bank"), gamification (XP, leaderboards, trophies), and deep analytics, PactTrack ensures that you stay on top of your daily goals.

## 🌟 Key Features

*   **Financial Accountability**: Put your money (or points) where your mouth is. Fail to complete a habit? You pay a fine that goes into a virtual Piggy Bank.
*   **Social Gamification**: Add friends, compete on the Leaderboard, and earn achievements in the Trophy Room to keep motivation high.
*   **Pomodoro Timer**: A built-in study/focus timer that integrates with your daily workflow.
*   **Deep Analytics**: Visualize your progress with heatmaps, daily summaries, and weekly reviews.
*   **Secure Authentication**: Powered by Firebase Auth for secure and seamless user access.

## 🛠 Tech Stack

PactTrack is built with a modern, scalable full-stack architecture.

**Frontend:**
*   React 19 & Vite
*   TailwindCSS (v4) for styling
*   Zustand for global state management
*   Recharts for data visualization
*   Firebase Authentication

**Backend:**
*   Node.js & Express
*   PostgreSQL (hosted on Neontech)
*   Prisma ORM for database management
*   Firebase Admin SDK

## 📁 Project Structure

The repository is structured into two main workspaces:

```
PactTrack/
├── frontend/       # React + Vite frontend application
└── backend/        # Node.js + Express + Prisma API server
```

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   PostgreSQL Database (or a Neontech account)
*   Firebase Project (for authentication)

### 1. Clone the Repository
```bash
git clone https://github.com/Sid-is-afk/PactTrack.git
cd PactTrack
```

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on the `.env.example`:
```env
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
PORT=5005
```
*(Ensure your Firebase Admin service account JSON is securely placed and referenced).*

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory containing your Firebase configuration:
```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Open the App
The frontend will typically run at `http://localhost:5173/` and the backend at `http://localhost:5005/`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is open-source and available under the [ISC License](LICENSE).
