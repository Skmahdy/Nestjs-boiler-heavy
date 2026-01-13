# Backend Setup - README

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
Make sure PostgreSQL is running (confirmed ✅), then run:
```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 3. Run the Application
```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Troubleshooting IDE TypeScript Errors

If you see TypeScript errors in your IDE about Prisma types not being found (e.g., `Module '@prisma/client' has no exported member 'User'`), but the build succeeds, this is a **TypeScript language server cache issue**.

### Solution: Restart TypeScript Server

**VS Code:**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "TypeScript: Restart TS Server"
3. Press Enter
## API Documentation

Once the application is running, access the interactive API documentation at:
```
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token

### Users (Protected)
- `GET /users` - Get all users (Admin/Moderator only)
- `GET /users/:id` - Get user by ID (Own profile or Admin)
- `POST /users/admin` - Create user with role (Admin only)
- `PATCH /users/:id` - Update user profile (Own profile)
- `PATCH /users/:id/password` - Update password (Own password)
- `DELETE /users/:id` - Delete user (Own account or Admin)

### Health
- `GET /health` - Application health check

## Authentication Flow

1. **Register a new user**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

2. **Login to get JWT token**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

3. **Use the token for protected routes**
```bash
curl -X GET http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

The application uses the following models:
- **User** - User accounts with role-based permissions
- **Post** - Blog posts (example)
- **Tag** - Post tags (example)

All models support soft delete functionality.

## Project Structure

```
backend/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Custom decorators
│   │   ├── dto/             # Shared DTOs
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Authentication guards
│   │   └── interceptors/    # Response interceptors
│   ├── config/              # Configuration files
│   ├── health/              # Health check module
│   ├── modules/
│   │   ├── auth/            # Authentication module
│   │   └── users/           # Users module
│   ├── prisma/              # Prisma service
│   ├── app.module.ts        # Root module  
│   └── main.ts              # Application entry
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

## Security Features

### Password Security
- Passwords hashed with bcrypt (salt rounds: 10)
- Never exposed in API responses
- Current password required for updates

### Role-Based Access Control
- Three roles: USER, ADMIN, MODERATOR
- Endpoint-level permission checks
- User can only modify own data
- Admins have elevated privileges

### Input Validation
- All DTOs validated with class-validator
- Automatic type transformation
- Whitelist & forbid non-whitelisted properties

### Soft Delete
- Records marked as deleted, not removed
- Automatic filtering in queries
- Audit trail preservation

## Logging

The application uses Winston for structured logging:
- Console output in development
- File logging in production
  - `error.log` - Error level logs
  - `combined.log` - All logs
- JSON format for easy parsing

## Error Handling

Comprehensive error handling for:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Conflict errors (409)
- Database errors (Prisma-specific)
- Internal server errors (500)

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| DATABASE_URL | PostgreSQL connection string | Yes | - |
| JWT_SECRET | Secret key for JWT signing | Yes | - |
| JWT_EXPIRES_IN | Token expiration time | No | 24h |
| PORT | Application port | No | 3000 |
| NODE_ENV | Environment mode | No | development |
| ALLOWED_ORIGINS | CORS allowed origins (comma-separated) | No | http://localhost:3001 |
| LOG_LEVEL | Logging level | No | info |

## Development

### Running Prisma Studio
```bash
npx prisma studio
```

### Creating a Migration
```bash
npx prisma migrate dev --name migration_name
```

### Resetting Database
```bash
npx prisma migrate reset
```

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Production Deployment

1. Set environment variables in production
2. Ensure JWT_SECRET is strong and unique
3. Configure DATABASE_URL for production database
4. Set NODE_ENV=production
5. Configure ALLOWED_ORIGINS for your frontend domain
6. Run migrations: `npx prisma migrate deploy`
7. Build and start: `npm run build && npm run start:prod`

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
