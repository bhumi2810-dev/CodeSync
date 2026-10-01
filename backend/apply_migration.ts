import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "defaultLanguage" TEXT DEFAULT 'javascript';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "code" TEXT;`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Room_code_key" ON "Room"("code");`);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
