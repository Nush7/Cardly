# Smart Learning SaaS Backend

This is a Node.js + Express + TypeScript backend for a smart learning SaaS application. It features JWT authentication, REST API, CORS, LLM integration, and a modular, scalable structure.

## Features
- User authentication (JWT)
- Quiz generation via LLM
- Quiz sharing and attempts
- Stats and analytics
- MongoDB (Mongoose) integration
- TypeScript for type safety

## Project Structure
```
src/
  controllers/
  services/
  routes/
  models/
  middlewares/
  utils/
  config/
  index.ts
```

## Getting Started
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in your secrets
3. Run in dev mode: `npm run dev`
4. Build for production: `npm run build`
5. Start: `npm start`

## API Endpoints
See the project documentation for full API details.

---

For Copilot: See `.github/copilot-instructions.md` for workspace-specific instructions.
