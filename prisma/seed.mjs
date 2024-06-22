import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.prodi.create({
      data: {
        kode: "0",
        nama: "admin",
      },
    });

    await prisma.account.create({
      data: {
        email: "admin@itera.ac.id",
        nama: "admin",
        role: "Admin",
        //123456
        password:
          "$2a$12$rYT6BJWBuJ28u6POeWjnJ.SlnVv/8yswsQye58OFherUlHiN04AmG",
        prodi: {
          connect: {
            kode: "0",
          },
        },
      },
    });
  } catch (e) {
    console.error("Error during seeding:", e);
    throw e; // Rethrow the error to be caught in the main error handler
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
