# Node Backend Starter Kit

Interactive CLI tool to quickly generate production-ready Node.js + TypeScript backend projects.

Choose your preferred ORM/Database combo and get a clean, modern, layered architecture setup in seconds.

## Features

- Interactive setup (project name, ORM + DB choice)
- Layered architecture (controllers, routes, services, middlewares, validators, utils, config)
- Express.js server
- TypeScript + ESM ready
- Joi validation
- Environment variables support (.env)
- Automatic dependency installation
- ORM-specific setup:
  - Sequelize + MySQL
  - Sequelize + PostgreSQL
  - Prisma + PostgreSQL
  - Drizzle ORM + PostgreSQL
- Ready for development (tsx watch) and production (tsc build)

## Installation

### Via npx (recommended – no global install needed)

```bash
npx backend-starter

### Global install
npm install -g backend-starter-kit
backend-starter

## Usage
1. Run the CLI: npx backend-starter

2. Follow the prompts:
Project name (e.g. my-api)
Choose ORM + Database (Sequelize MySQL, Prisma PG, etc.)

3. The CLI will:
Create the project folder
Copy the template structure
Update package.json with your project name and ORM dependencies
Generate .env with DB connection example
Run npm install

4. Go into the project and start:
cd  into the project folder
npm run dev