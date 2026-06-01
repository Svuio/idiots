# Team Style Check — Netlify version

This package is prepared for Netlify deployment with shared result storage.

## What is included

- React/Vite frontend
- Netlify Function API: `/.netlify/functions/results`
- Netlify Blobs storage for shared submitted results
- Admin panel with password: `admin` / `colors2026`
- CSV export, delete result, clear all, color groups, team radar

## Deploy

1. Upload this project to Netlify as a new site.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Functions directory: `netlify/functions`

The default admin password is `colors2026`. For a slightly safer setup, set an environment variable in Netlify:

`ADMIN_PASSWORD=your-new-password`

Then update the frontend constant `ADMIN_PASSWORD` in `src/App.jsx` to match it.

## Notes

This is suitable for a team-building tool, not for sensitive HR assessment or confidential psychological profiling.
