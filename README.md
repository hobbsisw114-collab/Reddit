# AetherScroll - Reddit Media Scroller

An immersive Reddit media scroller with vertical stream, Pinterest-style masonry, uniform card grid, and ambient cinema slideshow modes.

---

## Running in GitHub Codespaces

### 1. Launch Codespaces
- On GitHub, click the green **Code** button on your repository.
- Switch to the **Codespaces** tab and click **Create codespace on main**.
- Codespaces will automatically detect `.devcontainer/devcontainer.json`, configure Node.js 20, install all dependencies, and prepare port 3000.

### 2. Start Development Server
In the integrated Codespaces terminal, run:

```bash
npm run dev
```

- When the server starts, Codespaces will show a notification popup: **"Your application running on port 3000 is available"**.
- Click **Open in Browser** (or navigate to the **Ports** tab in VS Code and click the globe icon next to Port 3000).

---

## Building for Production in Codespaces

To build the client bundle for production:

```bash
npm run build
```

The compiled assets will be output to the `dist/` directory.

To test the production build with the server:

```bash
NODE_ENV=production npm start
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite middleware on `http://0.0.0.0:3000` |
| `npm run build` | Compiles and minifies the React SPA into the `dist/` folder |
| `npm run start` | Runs the server (`server.ts`) |
| `npm run lint` | Type-checks the codebase using TypeScript (`tsc --noEmit`) |
| `npm run preview` | Previews the built `dist` folder |

---

## Features

- **Stream Mode**: Vertical infinite feed with video playback, gallery carousels, and keyboard shortcuts (`J`/`K`).
- **Masonry Mode**: Responsive dynamic-height grid preserving natural image proportions.
- **Grid Mode**: Uniform card view with video badges and quick counters.
- **Cinema Mode**: Ambient darkroom auto-advancing slideshow with customizable speed (3s, 5s, 8s, 12s) and backlight halo.
- **Saved Collection**: Locally stored bookmarks with JSON and link export.
- **Subreddit Switcher**: Browse curated categories or type any subreddit / multi-reddit (e.g. `EarthPorn+spaceporn`).
- **Reddit Comments Drawer**: Live discussion comments loaded directly via the backend proxy.
