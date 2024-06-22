import prisma from "@/utils/prisma";

export async function GET(req, res) {
  try {
    const { searchParams } = new URL(req.url);
    const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter
  
    // Validate prodi parameter if necessary
    if (!prodi) {
      return res
        .status(400)
        .json({ status: 400, message: "Missing prodi parameter" });
    }

    const CPMK = await prisma.CPMK.findMany({
      where: {
        prodiId: prodi,
      },
      include: {
        CPL: {
          include: {
            PL: true,
            BK: true,
          },
        },
        MK: {
          include: {
            BK: true,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: CPMK,
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
    const CPMK = await prisma.CPMK.create({
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
      data: CPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}


