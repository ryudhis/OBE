import prisma from "@/utils/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameterz

  // Validate prodi parameter if necessary
  if (!prodi) {
    return Response.json({ status: 400, message: "Missing prodi parameter" });
  }

  try {
    // Fetch MK data filtered by prodiId
    const MK = await prisma.MK.findMany({
      where: {
        prodiId: prodi,
      },
      include: {
        BK: true,
        CPMK: { include: { CPL: true } },
        kelas: { include: { mahasiswa: true, tahunAjaran: true } },
        penilaianCPMK: { include: { CPMK: true } },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: MK,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { prodiId, ...restData } = data; // Extract prodiId from data

    // Create the PL entry and connect it to the prodi
    const MK = await prisma.MK.create({
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
      data: MK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
