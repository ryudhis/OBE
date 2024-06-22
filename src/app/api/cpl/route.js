import prisma from "@/utils/prisma";

export async function GET() {
  
  try {
    const CPL = await prisma.CPL.findMany({
      include: { PL: true, 
        BK : {
          include : {
            MK : true
          }
        }, 
        CPMK: {
          include : {
            MK : true
          }
        } },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: CPL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { prodiId, ...restData } = data; // Extract prodiId from data

    // Create the PL entry and connect it to the prodi
    const CPL = await prisma.CPL.create({
      data: {
        ...restData,
        prodi: {
          connect: {
            kode: prodiId,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: CPL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}