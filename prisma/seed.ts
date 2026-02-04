import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Ensure roles exist
  const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN', description: 'Administrator' }
  })

  // Existing Default Admin
  const email = 'admin@nebula.com'
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
        role: { connect: { id: adminRole.id } }
    },
    create: {
      email,
      name: 'Admin Nebula',
      password: hashedPassword,
      role: { connect: { id: adminRole.id } },
    },
  })

  // New Admin User: mquiros@parquetempisque.com
  const newAdminEmail = 'mquiros@parquetempisque.com'
  const newAdminPassword = 'Pasante2026-+'
  const newAdminHashedPassword = await bcrypt.hash(newAdminPassword, 10)

  const newAdmin = await prisma.user.upsert({
    where: { email: newAdminEmail },
    update: {
      password: newAdminHashedPassword, // Ensure password is correct if user exists
      role: { connect: { id: adminRole.id } }
    },
    create: {
      email: newAdminEmail,
      name: 'M Quiros',
      password: newAdminHashedPassword,
      role: { connect: { id: adminRole.id } },
    },
  })

  console.log({ user, newAdmin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
