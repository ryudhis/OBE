import prisma from "@/utils/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mk = searchParams.get("mk") || ""; // Access prodi query parameter

  // Validate prodi parameter if necessary
  if (!mk) {
    return Response.json({ status: 400, message: "Missing mk parameter" });
  }

  try {
    // Fetch MK data filtered by prodiId
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.findMany({
      where: {
        MKId: mk,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: rencanaPembelajaran,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { MKId, ...restData } = data;

    console.log(data);

    // Create the PL entry and connect it to the prodi
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.create({
      data: {
        ...restData,
        MK: {
          connect: {
            kode: MKId,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: rencanaPembelajaran,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
