import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import the token validation function

export async function POST(req) {
  const tokenValidation = validateToken(req);

  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const dataArray = await req.json();

    const createdCPL = await prisma.CPL.createMany({
      data: dataArray.CPL.map((data) => ({
        kode: data.kode,
        deskripsi: data.deskripsi,
        keterangan: data.keterangan,
        prodiId: dataArray.prodiId,
      })),
      skipDuplicates: true, 
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: createdCPL,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
