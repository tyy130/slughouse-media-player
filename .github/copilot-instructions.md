# Slughouse Media Player AI Instructions

## Architecture & Data Flow
- **Full-Stack**: React frontend in [client/](client/), Node.js/Express backend in [server/](server/).
- **Persistence**: MySQL via `mysql2/promise`. See [schema.sql](schema.sql) for table definitions (`tracks`, `admin_users`).
- **Storage**: Media files are stored in [uploads/tracks/](uploads/tracks/) and [uploads/artwork/](uploads/artwork/).
- **Static Assets**: Backend serves `uploads/` via `app.use('/uploads', express.static(...))`.
- **API Endpoint**: Frontend uses `apiUrl` (default: `http://localhost:3001`).

## Tech Stack & Patterns
- **Backend**:
  - Use `async/await` with `db.query()` from [server/db.js](server/db.js).
  - Protect sensitive routes with `authMiddleware` (JWT Bearer tokens).
  - Rate limiting applies to all `/api/` routes; stricter on `/api/admin/login` and track uploads.
  - File handling via `multer` in [server/index.js](server/index.js).
- **Frontend**:
  - React (Hooks: `useState`, `useEffect`, `useRef`).
  - No global state (Redux/Zustand); uses prop drilling from [App.js](client/src/App.js).
  - Audio playback uses `HTML5 Audio API` via `audioRef`.

## Critical Workflows
- **Start Dev Environment**: `npm run dev` in root starts both server and client.
- **Dependency Install**: `npm install` in root AND [client/](client/).
- **Database Init**: `mysql -u root -p < schema.sql`.
- **Admin Access**: Default creds are `admin` / `admin123`.

## Coding Conventions
- **Design System**: Dark theme with Pink accents. Brand color: `#e94560`.
- **API Responses**: Consistency is key; always return JSON with descriptive error messages when failing.
- **File Management**: When deleting or updating tracks, ensure old files are removed from [uploads/](uploads/) to prevent orphaned assets.

## Integration Reference
- **Admin API**: Routes prefixed with `/api/admin/` require `Authorization: Bearer <token>`.
- **Track Metadata**: Includes `title`, `artist`, `album`, `file_path`, `artwork_path`, and `track_order`.
- **Environment & Persistence**: 
  - Backend requires `.env` (MySQL credentials, `JWT_SECRET`). 
  - **CRITICAL**: Do NOT overwrite `.env` with local defaults. External databases (e.g., Hostinger) are used.
  - Always use `process.env` in code. Never hardcode credentials.
  - Assume the existence of external configuration; do not "fix" connection strings to `localhost` unless explicitly asked.
- **Environment**: Client optionally uses `client/.env` for `REACT_APP_API_URL`.
