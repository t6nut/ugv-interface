# UGV Interface Prototype

This is a software engineering HMI homework project — a browser-based prototype UI for an Unmanned Ground Vehicle (UGV), built with Vue 3 + TypeScript and Leaflet.

---

## 🧰 Tech Stack

- [Vue 3 + Vite](https://vitejs.dev/)
- TypeScript
- [Leaflet](https://leafletjs.com/) (OpenStreetMap)
- [Vue Toastification](https://github.com/Maronato/vue-toastification) for UI feedback

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/t6nut/ugv-interface.git
cd ugv-interface
```

### 2. Install Dependencies

```bash
npm install
```

> If you run into issues with `vue-toastification`, make sure to install the correct Vue 3 version:
>
> ```bash
> npm install vue-toastification@^2.0.0
> ```

---

### 3. Run the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or similar port).

---

## ✨ Features

- 🚗 UGV engine start/stop control
- 🎮 Keyboard movement (arrow keys)
- 🗺️ Interactive map using Leaflet
- 📍 Waypoint management
- 🔔 Toast notifications instead of alerts
- ❌ Movement is disabled until engine is started

---

## 📸 Demo

> A screen-recorded video will be included here.

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── MapView.vue
│   ├── EngineButton.vue
│   └── UgvControls.vue
│   └── WaypointsView.vue
├── store/
│   └── ugv.ts
│   └── waypoints.ts
├── utils/
│   └── movementConstants.ts
│   └── driveToWaypoint.ts
└── App.vue
```

---

## 💬 Notes

- This is a prototype only — map movement and controls are mocked.
- UGV logic is simplified and client-side only.
- Long-press and waypoint features are in development.

---

## 🤖 AI Disclosure

Some parts of the code structure and documentation were assisted by AI (ChatGPT, Copilot), including modular breakdown, toast library integration, and suggestions on Vue 3 best practices.

---

## 📄 License

MIT