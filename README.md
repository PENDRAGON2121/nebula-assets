# Nebula Assets

**Nebula Assets** is a modern, full-stack IT Asset Management (ITAM) system designed to track hardware assets, assignments, maintenance records, and personnel. Built with performance and security in mind, it features a robust Role-Based Access Control (RBAC) system and a clean, responsive user interface.

## 🚀 Features

### Core Modules
- **Asset Management (`/activos`)**: Complete lifecycle tracking of hardware (Laptops, Monitors, etc.) with support for custom fields, status tracking (Available, Assigned, Maintenance, Retired), and barcode/serial number management.
- **Assignments (`/asignaciones`)**: Track who holds which asset. Support for check-in/check-out workflows and historical assignment logs.
- **People (`/personas`)**: Directory of employees or departments to whom assets can be assigned.
- **Maintenance (`/mantenimientos`)**: Record repairs, upgrades, and routine maintenance with cost tracking and status updates.

### System & Security
- **RBAC (Role-Based Access Control)**: Granular permission system (Read/Write/Delete) for every module.
- **User Management**: Admin interface to manage system users and assign roles.
- **Dynamic Role Editor**: Create custom roles (e.g., "Finance Manager") and toggle specific permissions via a UI matrix.
- **Secure Authentication**: Powered by NextAuth v5 with secure session management.
- **Audit Ready**: History of asset movements and system changes.

### Technical Highlights
- **Modern Stack**: Next.js 15 (App Router), React 19, Server Actions.
- **Database**: PostgreSQL with Prisma ORM.
- **UI/UX**: Tailwind CSS, Shadcn UI, Dark Mode support, and responsive design.
- **Infrastructure**: Dockerized database and application support.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/)
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js (v5)](https://authjs.dev/)
- **Styling:** Tailwind CSS & Shadcn UI
- **Validation:** Zod & React Hook Form
- **Containerization:** Docker & Docker Compose

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for the database)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/nebula-assets.git
cd nebula-assets
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. You can use the example below:

```env
# Database (Docker default)
DATABASE_URL="postgresql://nebula:nebula_password@localhost:5432/nebula_assets?schema=public"

# If using connection pooling (optional, for deployment)
# POSTGRES_PRISMA_URL="..."
# POSTGRES_URL_NON_POOLING="..."

# NextAuth
AUTH_SECRET="your-super-secret-key-at-least-32-chars"
AUTH_URL="http://localhost:3000"

# Public App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Start the Database
Use Docker Compose to spin up the PostgreSQL instance:

```bash
docker-compose up -d db
```

### 5. Database Setup (Migrations & Seeding)
Initialize the database schema and load default roles/permissions:

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed the database (Default Roles & Permissions)
npx prisma db seed
# Also run the permissions seeder specifically if needed
npx ts-node prisma/seed-permissions.ts
```

### 6. Run the Application
Start the development server:

```bash
npm run dev
```
Access the app at `http://localhost:3000`.

---

## 🐳 Running with Docker (Full Stack)

To run the entire application (App + Database) in containers:

```bash
docker-compose up -d
```
The application will be available at `http://localhost:3000` (or the port defined in `docker-compose.yml`).

---

## 🛡️ Default Roles

The system comes with a dynamic permission engine.
- **ADMIN**: Has full access to all modules and system configuration.
- **USER**: Default role with limited read access (customizable).
- **Custom Roles**: Can be created in `/usuarios/roles` to fit specific business needs (e.g., "Auditor", "Technician").

---

## 📄 License

This project is proprietary software. All rights reserved.
