-- Rename existing Enum to avoid name conflict with new Table
ALTER TYPE "Role" RENAME TO "Role_Old";

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DATA MIGRATION

-- 1. Insert Default Roles
INSERT INTO "Role" ("id", "name", "description", "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 'ADMIN', 'Administrator with full access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'USER', 'Standard user with limited access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Add roleId column
ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

-- 3. Update roleId based on existing role enum
-- We cast to text. Postgres renaming the type should keep data intact.
UPDATE "User"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "name" = "User"."role"::text);

-- 4. Add FK constraint
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Drop old column and enum
ALTER TABLE "User" DROP COLUMN "role";
DROP TYPE "Role_Old";
