import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function PATCH(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { id: kode } = params; 
    const data = await req.json();

    const MK = await prisma.MK.update({
      where: {
        kode,
      },
      data: {
        BK: {
          disconnect: data.removedBKId.map((bkId) => ({
            kode_prodiId: {
              kode: bkId,
              prodiId: data.prodiId,
            },
          })),
          connect: data.addedBKId.map((bkId) => ({
            kode_prodiId: {
              kode: bkId,
              prodiId: data.prodiId,
            },
          })),
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: MK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Gagal ubah data!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
