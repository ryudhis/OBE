import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import the token validation function

export async function POST(req) {
  // Validate the token
  const tokenValidation = validateToken(req);

  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const dataArray = await req.json();

    const createdCPMK = await prisma.CPMK.createMany({
      data: dataArray.CPMK.map((data) => ({
        kode: data.kode,
        deskripsi: data.deskripsi,
        prodiId: dataArray.prodiId,
      })),
      skipDuplicates: true, 
    });

    return new Response(JSON.stringify({
      status: 200,
      message: "Berhasil buat data!",
      data: createdCPMK,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ status: 400, message: "Something went wrong!" }), { headers: { 'Content-Type': 'application/json' } });
  }
}
