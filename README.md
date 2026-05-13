# 🌹 The Godfather - A Cinematic Tribute

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

> *"Great men are not born great, they grow great..."*

An immersive, premium web experience dedicated to Francis Ford Coppola's cinematic masterpiece, **The Godfather**. This project captures the dark, elegant, and powerful aesthetic of the film with modern web technologies.

---

## 🎬 Features

✨ **Cinematic Preloader**
- Fast-paced slideshow with generated horizontal posters.
- Dramatic "An Offer You Can't Refuse" loading text.

🎵 **Ambient Soundscape**
- The legendary theme music plays in the background.
- Smart auto-pause when viewing video clips.

📺 **Iconic Scenes Gallery**
- Hover over scene cards to play video clips instantly.
- Clean, poster-less video players for a pure cinematic feel.

👥 **Family Tree**
- Explore the characters of the Corleone family with custom photos.

🌍 **Fully Responsive**
- Media elements scale perfectly to fit any window size, ensuring a seamless experience on desktop and mobile.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI Framework
- **Vite** - Next Generation Frontend Tooling
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Premium icon pack

### Backend
- **Node.js** & **Express** - High-performance server
- **MongoDB** - Database for storing media buffers (Images, Videos, Audio)
- **Mongoose** - Elegant MongoDB object modeling

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB instance running

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ramjianonmyous/Tribute-GodFather.git
   cd Tribute-GodFather
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   FRONTEND_URL=http://localhost:5173
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running Locally

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

Visit `http://localhost:5173` to experience the site!

---

## 🌹 Credits

- **Made by:** [Ram Kaithwas](https://github.com/Ramjianonmyous)
- **Design:** Styled with passion for classic cinema.
- **Tribute:** Dedicated to the legendary Godfather saga.

---
*Note: This project is a non-commercial fan tribute created for educational and demonstration purposes.*
