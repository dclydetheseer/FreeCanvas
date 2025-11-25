# 🌍 FreeCanvas (World Release)

A real-time multiplayer territory game inspired by "wplace.live", featuring freeform drawing on a real-world map.

## 🚀 Features

### 🎨 Core Drawing & Tools
*   **Infinite World Canvas**: Draw anywhere on a real-world map (powered by MapLibre).
*   **Multiplayer Sync**: See other users' cursors and strokes in real-time.
*   **Advanced Toolset**: Pen, Eraser, **Rainbow Brush** 🌈, Rectangle, Circle.
*   **Stickers**: Place emojis (🔥, 😎, etc.) directly on the map.
*   **Layers System**: Create, hide, and delete layers to organize artwork.
*   **Customization**: Full RGB color picker + Size slider.

### 💧 Ink Economy (Game Mechanics)
*   **Ink Tank**: A stamina system that limits how much you can draw at once.
*   **Real-World Cost**: Ink depletion is calculated based on the **actual meters** you draw on Earth.
*   **Regeneration**: Ink automatically refills over time when you stop drawing.

### 🚀 Performance & Tech
*   **Vector Optimization**: Uses the **Ramer-Douglas-Peucker** algorithm to compress strokes by ~90%, keeping the app fast.
*   **Viewport Culling**: Only renders what you can see, allowing for massive worlds.
*   **Deep Linking**: Share your exact map location with a URL (e.g., `?lat=...&lng=...`).
*   **Mobile Support**: Fully touch-compatible with mobile-specific UI adjustments.

### ✨ UI & UX
*   **Dark Mode UI**: Sleek, "Heavy" animated interface with glassmorphism.
*   **Room Activity**: See who is online in your area.
*   **Shortcuts**: Spacebar to Pan, Undo/Redo, "Move/Draw" toggle.

## 🔮 Roadmap

*   **🛡️ Factions & Territory**: Join a team (e.g., Red vs. Blue) and claim map regions.
*   **🔒 Server-Side Ink**: Move ink logic to the server.
*   **💬 Text Chat**: Real-time chat with other artists.
*   **🏆 User Profiles**: Track distance drawn and areas claimed.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS
*   **Map Engine**: MapLibre GL JS
*   **Backend**: Firebase (Firestore, Auth)
