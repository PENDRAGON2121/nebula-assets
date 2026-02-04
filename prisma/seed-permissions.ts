import { PrismaClient } from '@prisma/client'

// Manually define permissions here to avoid ts-node import issues with aliases/extensions
const PERMISSIONS = {
  USERS: {
    READ: 'users:read',
    WRITE: 'users:write',
    DELETE: 'users:delete',
  },
  ASSETS: {
    READ: 'assets:read',
    WRITE: 'assets:write',
    DELETE: 'assets:delete',
  },
  PEOPLE: {
    READ: 'people:read',
    WRITE: 'people:write',
    DELETE: 'people:delete',
  },
  MAINTENANCE: {
    READ: 'maintenance:read',
    WRITE: 'maintenance:write',
  },
  ASSIGNMENTS: {
    READ: 'assignments:read',
    WRITE: 'assignments:write',
  }
} as const;

const ALL_PERMISSIONS = [
  ...Object.values(PERMISSIONS.USERS),
  ...Object.values(PERMISSIONS.ASSETS),
  ...Object.values(PERMISSIONS.PEOPLE),
  ...Object.values(PERMISSIONS.MAINTENANCE),
  ...Object.values(PERMISSIONS.ASSIGNMENTS),
];

const prisma = new PrismaClient()

async function main() {
    for (const p of ALL_PERMISSIONS) {
        const [module, action] = p.split(':');
        await prisma.permission.upsert({
            where: { name: p },
            update: {},
            create: { name: p, description: `Permission to ${action} ${module}` }
        })
    }
    console.log('Permissions seeded from config')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
