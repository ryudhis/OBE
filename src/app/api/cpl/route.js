import prisma from "@/utils/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter

  // Validate prodi parameter if necessary
  if (!prodi) {
    return Response.json({ status: 400, message: "Missing prodi parameter" });
  }

  try {
    const CPL = await prisma.CPL.findMany({
      where: {
        prodiId: prodi,
      },
      include: {
        PL: true,
        BK: {
          include: {
            MK: true,
          },
        },
        CPMK: {
          include: {
            MK: true,
          },
        },
        performaCPL: { include: { tahunAjaran: true } },
      },
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
