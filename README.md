# MySQL Database Manager

A web-based MySQL database management application built with Next.js.

## Features

- User authentication with role-based access control (admin/read-only)
- MySQL database connection management
- Database creation, deletion and listing
- Table management (create, delete, view structure)
- Record management (CRUD operations)
- SQL query editor with history
- Responsive design

## Watch a Demo
[Watch Demo](https://github.com/Rajatbisht12/sql-Manager/blob/main/assets/video.mp4)


## Production Deployment

### Prerequisites

- Node.js 18 or newer
- MySQL server accessible from your deployment environment

### Configuration

Create a `.env.local` file in the root of the project with the following environment variables:

```
# NextAuth configuration
NEXTAUTH_SECRET=your-secure-random-string
NEXTAUTH_URL=https://your-domain.com

# Default database connection (optional)
DEFAULT_DB_HOST=your-mysql-host
DEFAULT_DB_PORT=3306
DEFAULT_DB_USER=default_user
DEFAULT_DB_PASSWORD=
DEFAULT_DB_NAME=

# Connection timeout in milliseconds
DB_CONNECTION_TIMEOUT=10000
DB_CONNECTION_RETRIES=3
```

For production, make sure to:
1. Generate a strong random string for `NEXTAUTH_SECRET`
2. Set `NEXTAUTH_URL` to your production domain
3. Update MySQL defaults if needed

### Deployment Options

#### Option 1: Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

#### Option 2: Traditional Node.js Hosting

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the application:
   ```bash
   npm start
   ```

#### Option 3: Docker Deployment

1. Create a Dockerfile:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY . .
   RUN npm install
   RUN npm run build
   CMD ["npm", "start"]
   ```

2. Build and run the Docker image:
   ```bash
   docker build -t mysql-manager .
   docker run -p 3000:3000 --env-file .env.local mysql-manager
   ```

### Security Considerations

This application includes the following security measures:

1. **Authentication**: Using NextAuth.js with credential provider
2. **Role-based access control**:
   - Admin users: Full access
   - Read-only users: Limited to viewing data

3. **Additional security recommendations for production**:
   - Set up HTTPS
   - Use a secure, randomly generated NEXTAUTH_SECRET
   - Store MySQL credentials securely
   - Configure proper network security for MySQL access
   - Implement IP whitelisting if possible

### Production User Management

By default, the application includes two demo users:
- Admin: admin@example.com / adminpassword
- Read-only: readonly@example.com / readonlypassword

For production:
1. Modify the users array in `app/api/auth/[...nextauth]/route.ts`
2. Implement a proper user database with hashed passwords

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## License

MIT
