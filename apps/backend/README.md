# DevLaunch Backend Service

DevLaunch is a token launch platform for the Solana ecosystem. This repository contains the code for the backend API service.

## Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **TypeScript** - Typed JavaScript superset
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling tool
- **JWT** - JSON Web Token for authentication

## Project Structure

```
apps/backend/
├── config/                # Configuration files
├── src/                   # Source code directory
│   ├── controllers/       # Controllers - request handling logic
│   ├── middleware/        # Middleware - request interceptors
│   ├── models/            # Data models - MongoDB schema definitions
│   ├── routes/            # Route definitions
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── app.ts             # Application setup
│   └── server.ts          # Server entry point
├── tests/                 # Test files
├── .env.example           # Example environment variables
└── package.json           # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0.0 (or use Docker)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/devlaunch.git
cd devlaunch/apps/backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Start the development server
```bash
npm run dev
```

### Build and Run

```bash
# Build the application
npm run build

# Run in production mode
npm start
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Contributing

Please read the main repository's contributing guidelines.

## License

This project is licensed under the MIT License - see the main repository's LICENSE file for details. 