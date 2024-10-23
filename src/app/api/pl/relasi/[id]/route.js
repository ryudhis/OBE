import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import your token validation utility

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
    const id = params.id
    const body = await req.json();

    console.log(body);

    const PL = await prisma.PL.update({
      where: {
        id: parseInt(id),
      },
      data: {
        kode: body.kode,
        deskripsi: body.deskripsi,
        CPL: {
          disconnect: body.removedCPLId.map((cplId) => ({
            kode_prodiId: {
              kode: cplId,
              prodiId: body.prodiId,
            },
          })),
          connect: body.addedCPLId.map((cplId) => ({
            kode_prodiId: {
              kode: cplId,
              prodiId: body.prodiId,
            },
          })),
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: PL,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
