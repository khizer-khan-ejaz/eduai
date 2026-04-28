# Math Learning App (React Components)

This directory contains the new React components designed to run alongside your existing Flask application. 
They fulfill the requirement of completely decoupled front-end architecture.

## Folder Structure

```
math-app/
├── package.json
└── src/
    └── components/
        ├── admin/
        │   └── EnquiryList.jsx
        ├── dashboard/
        │   └── StudentProgress.jsx
        ├── practice/
        │   └── QuizEngine.jsx
        └── simulations/
            └── CoordinateGeometrySim.jsx
```

## How to integrate with your specific stack

Since you are using raw HTML templates mapped via `app.py`, you have two main paths:

### 1. Build & Serve via Flask (Recommended for current setup)
1. Initialize a real React/Tailwind build system in this folder (e.g., `npm create vite@latest . -- --template react`).
2. Build the output using `npm run build`.
3. Move the compiled `.js` and `.css` files into your `static/js/` and `static/css/` directory.
4. Add a placeholder div inside your `templates/` files (e.g. `<div id="react-simulation-root"></div>`).
5. Include the built JS in that template.

### 2. Standalone Frontend (Next level)
Keep these files in a completely separate Next.js or Create React App environment and talk to your `app.py` via HTTP APIs (which would require you to add REST endpoints in `app.py`).