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

    const createdBK = await prisma.BK.createMany({
      data: dataArray.BK.map((data) => ({
        kode: data.kode,
        deskripsi: data.deskripsi,
        min: data.min,
        max: data.max,
        prodiId: dataArray.prodiId,
      })),
      skipDuplicates: true,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: createdBK,
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
