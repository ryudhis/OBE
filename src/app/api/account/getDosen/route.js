import prisma from "@/utils/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter

  // Validate prodi parameter if necessary
  if (!prodi) {
    return Response.json({ status: 400, message: "Missing prodi parameter" });
  }

  try {
    const account = await prisma.account.findMany({
      where: {
        prodiId: prodi,
        role: {
          in: ["Dosen", "Kaprodi"],
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: account,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
