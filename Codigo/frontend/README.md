# NextStep English — Frontend

React interface for the NextStep English platform.

## ⚙️ Requirements

- [Node.js](https://nodejs.org/) 18 or higher
- npm (comes with Node)

## 🚀 How to run

```bash
# 1. Enter the frontend folder
cd Codigo/frontend

# 2. Install dependencies (only once)
npm install

# 3. Start the development server
npm run dev
```

App will be available at: **http://localhost:5173**

## 🔌 Backend connection

The frontend communicates with the Spring Boot backend via Vite's proxy.

**Make sure the backend is running at `http://localhost:8080` before using login/signup features.**

To start the backend:
```bash
cd Codigo/backend
./mvnw spring-boot:run
```

## 📂 Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── HomePage.jsx        ← main page (Sprint 1 delivery)
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ui/                 ← base UI components
│   ├── contexts/
│   │   └── AuthContext.jsx     ← global auth state
│   ├── services/
│   │   └── api.js              ← backend API calls
│   └── lib/
│       └── utils.js
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🌐 Available routes

| Route    | Page     |
|----------|----------|
| `/`      | HomePage |
