import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.kunci.create({
      data: {
        nilai: false,
        data: false,
      },
    });

    await prisma.prodi.create({
      data: {
        kode: "0",
        nama: "admin",
      },
    });

    await prisma.prodi.create({
      data: {
        kode: "IF",
        nama: "Teknik Informatika",
      },
    });

    await prisma.account.create({
      data: {
        email: "admin@itera.ac.id",
        nama: "Super Admin",
        role: "Super Admin",
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

    await prisma.account.create({
      data: {
        email: "kaprodi@itera.ac.id",
        nama: "Kaprodi",
        role: "Kaprodi",
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

    await prisma.account.create({
      data: {
        email: "dosen@itera.ac.id",
        nama: "Dosen",
        role: "Dosen",
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

    await prisma.account.create({
      data: {
        email: "andika@if.itera.ac.id",
        nama: "Andika Setiawan, S.Kom., M.Cs.",
        role: "Kaprodi",
        //123456
        password:
          "$2a$12$rYT6BJWBuJ28u6POeWjnJ.SlnVv/8yswsQye58OFherUlHiN04AmG",
        prodi: {
          connect: {
            kode: "IF",
          },
        },
      },
    });

    await prisma.account.create({
      data: {
        email: "dosenIF1@itera.ac.id",
        nama: "DosenIF1",
        role: "Dosen",
        //123456
        password:
          "$2a$12$rYT6BJWBuJ28u6POeWjnJ.SlnVv/8yswsQye58OFherUlHiN04AmG",
        prodi: {
          connect: {
            kode: "IF",
          },
        },
      },
    });

    await prisma.account.create({
      data: {
        email: "adminIF@itera.ac.id",
        nama: "AdminIF1",
        role: "Admin",
        //123456
        password:
          "$2a$12$rYT6BJWBuJ28u6POeWjnJ.SlnVv/8yswsQye58OFherUlHiN04AmG",
        prodi: {
          connect: {
            kode: "IF",
          },
        },
      },
    });
  } catch (e) {
    console.error("Error during seeding:", e);
    throw e;
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
