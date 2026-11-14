# SRM Market

An early full-stack prototype for a campus marketplace. The React client is a Vite starter, and the Express server exposes a status endpoint and uses Mongoose to connect to MongoDB. For the working marketplace, see [CampusKArt](https://github.com/nayakmanasij-stack/CampusKArt).

## Run locally

Use Node.js 20.19 or newer in the Node.js 20 line, or Node.js 22.13 or newer. Start a local MongoDB instance or use a development database you can access.

1. Inside `server`, copy `.env.example` to `.env` and set `MONGO_URI` to your development database.
2. Still inside `server`, run `npm ci` and then `node index.js`.
3. In a separate terminal, enter `client`, run `npm ci`, then run `npm run dev`. Open the address Vite prints.

The server's status endpoint is at [localhost:5000](http://localhost:5000) by default. A response from that endpoint confirms Express is running. Check the server console for MongoDB connection status.

## Project structure

| Directory | Purpose |
| --- | --- |
| `client/` | React frontend and Vite configuration |
| `server/` | Express API, Mongoose connection, and example environment settings |

Run `npm run build` and `npm run lint` inside `client` to check the frontend. Keep the local `.env` and installed dependencies out of Git.
