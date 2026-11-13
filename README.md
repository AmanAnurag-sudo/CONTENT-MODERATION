# Content Review Platform

A content review platform for creating, submitting, reviewing, commenting on, and approving content.

## Technology

- React
- Vite
- Node.js
- Express.js
- PostgreSQL
- Docker

## Features

- Content dashboard
- Content search
- Filter by status
- Create new content
- Review content
- Approve content
- Reject content
- Request changes
- Add reviewer comments
- Review metrics
- PostgreSQL persistence
- Responsive UI

## Project Structure

```text
content-review-platform/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── migrate.js
│   │   │   ├── pool.js
│   │   │   ├── schema.sql
│   │   │   └── seed.js
│   │   └── server.js
│   └── package.json
├── .env.example
├── docker-compose.yml
└── package.json