import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const permissions = [
    'users:read', 'users:write', 'users:delete',
    'assets:read', 'assets:write', 'assets:delete',
    'maintenance:read', 'maintenance:write',
]

async function main() {
    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { name: p },
            update: {},
            create: { name: p, description: `Permission to ${p.split(':')[1]} ${p.split(':')[0]}` }
        })
    }
    console.log('Permissions seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
