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

  // Get kode from params.id
  const { id: kode } = params;
  
  try {
    const data = await req.json();

    // Update the old Kaprodi's role to "Dosen"
    await prisma.account.update({
      where: {
        id: data.oldKaprodi,
      },
      data: {
        role: "Dosen",
      },
    });

    // Update the Prodi with the new Kaprodi
    const prodi = await prisma.prodi.update({
      where: {
        kode,
      },
      data: {
        kaprodi: {
          connect: {
            id: data.kaprodi,
          },
        },
      },
    });

    // Update the new Kaprodi's role to "Kaprodi"
    await prisma.account.update({
      where: {
        id: data.kaprodi,
      },
      data: {
        role: "Kaprodi",
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: prodi,
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
