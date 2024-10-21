import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import the token validation function

export async function PATCH(req) {
  const tokenValidation = validateToken(req);
  
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = req.url.split("/relasi/")[1];
    const body = await req.json();

    const BK = await prisma.BK.update({
      where: {
        id: parseInt(id),
      },
      data: {
        id: body.id,
        deskripsi: body.deskripsi,
        min: body.min,
        max: body.max,
        MK: {
          disconnect: body.removedMKId.map((mkId) => ({ kode: mkId })),
          connect: body.addedMKId.map((mkId) => ({ kode: mkId })),
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: BK,
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
