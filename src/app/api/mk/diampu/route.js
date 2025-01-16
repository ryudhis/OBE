import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function GET(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const dosenId = parseInt(searchParams.get("dosen")) || null;
  const tahunAjaranId = parseInt(searchParams.get("tahunAjaran")) || null;

  try {
    let whereCondition;

    const account = await prisma.account.findUnique({
      where: { id: dosenId },
      include: { kelas: true },
    });

    const kelasArray = (account?.kelas || []).filter(
      (kelas) => kelas.tahunAjaranId === tahunAjaranId
    );

    // Extract MKId from kelasArray and remove duplicates
    const MKidArray = [...new Set(kelasArray.map((kelas) => kelas.MKId))];

    // Set the where condition based on the found MKidArray
    whereCondition = {
      kode: { in: MKidArray },
    };

    const MK = await prisma.MK.findMany({
      where: whereCondition,
      include: {
        kelas: { include: { mahasiswa: true, tahunAjaran: true } },
        lulusMK: true,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: MK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
