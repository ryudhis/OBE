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
        CPMK: {
          disconnect: data.removedCPMKId.map((cpmkId) => ({
            kode_prodiId: {
              kode: cpmkId,
              prodiId: data.prodiId,
            },
          })),
          connect: data.addedCPMKId.map((cpmkId) => ({
            kode_prodiId: {
              kode: cpmkId,
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
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Gagal ubah data!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
