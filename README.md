<div align="center">
  <img src="https://img.icons8.com/color/96/spotify--v1.png" alt="Music Platform Logo" width="80"/>
  
  <h1>🎵 Music Streaming Platform</h1>
  <p>
    <b>A modern, full-stack music streaming app inspired by Spotify.</b><br>
    Built with React, TypeScript, Material-UI, Express.js, and Firebase.<br>
    Powered by the <a href="https://saavn.dev/">Saavn.dev</a> public API.
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/React-18-blue?logo=react"/>
    <img src="https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript"/>
    <img src="https://img.shields.io/badge/Express.js-4.18-green?logo=express"/>
    <img src="https://img.shields.io/badge/Firebase-yellow?logo=firebase"/>
    <img src="https://img.shields.io/badge/Material--UI-5-blue?logo=mui"/>
    <img src="https://img.shields.io/badge/Deployed-Localhost-brightgreen"/>
  </p>
  
  <hr/>
</div>

## 🚀 Features

- 🎧 Modern, Spotify-like user interface
- 🔍 Search for songs and artists
- 📚 Library management (create playlists, like songs)
- 👤 User authentication (Firebase)
- 📈 Featured & trending playlists
- 💻 Responsive design (desktop & mobile)
- 🎼 High-quality music playback

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React, TypeScript, Material-UI, Tailwind CSS, Howler.js, Axios, React Router |
| Backend    | Node.js, Express.js, TypeScript, Axios, dotenv, CORS, Firebase, ts-node      |
| Database   | Firebase Firestore                      |
| Music API  | Saavn.dev                               |
| Dev Tools  | Concurrently, Nodemon, React Scripts    |

---

## ⚡ Quickstart

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd music-streaming-platform
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
yarn install
   ```
3. **Setup environment variables:**
   - Copy `.env.example` to `.env` in the project root and edit as needed:
     ```env
     PORT=3001
     REACT_APP_API_URL=http://localhost:3001/api
     MUSIC_API_BASE_URL=https://saavn.dev/api
     # Add your Firebase credentials as needed
     ```
4. **Start the backend & frontend (dev mode):**
   ```bash
   npm run dev
   # or
yarn dev
   ```
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

---

## 📁 Project Structure

```
├── src
│   ├── components/    # Reusable UI components
│   ├── pages/         # Pages (Home, Search, Library, Login, etc.)
│   ├── contexts/      # React context providers (Player, Playlist, Auth)
│   ├── services/      # API/business logic (musicService, ytMusicService, ...)
│   ├── server.ts      # Express.js server entry point
│   └── server/routes/ # API route handlers
├── public/            # Static assets
└── ...
```

---

## 🎤 API Integration

- Uses [Saavn.dev](https://saavn.dev/) for music search, song details, and streaming URLs.
- Backend can be configured to use any compatible music API by changing `MUSIC_API_BASE_URL` in `.env`.
- User authentication and playlists are managed via Firebase.

---

## 🧩 Troubleshooting

- **Songs not loading?**
  - Check backend logs for errors.
  - Ensure `MUSIC_API_BASE_URL` is correct and reachable.
  - Make sure both frontend and backend are running and environment variables are set.
- **CORS issues?**
  - CORS is enabled for all origins in the backend by default.
- **API rate limits or downtime?**
  - If Saavn.dev is down or rate-limited, try again later or switch to another API.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## 📄 License

MIT
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 