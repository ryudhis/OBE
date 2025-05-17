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
    console.log(data);

    if (data.oldGKMP) {
      // Update the old Kaprodi's role to "Dosen" if it exists
      await prisma.account.update({
        where: {
          id: data.oldGKMP,
        },
        data: {
          role: "Dosen",
        },
      });
    }

    // Update the Prodi with the new Kaprodi
    const prodi = await prisma.prodi.update({
      where: {
        kode,
      },
      data: {
        GKMP: {
          connect: {
            id: data.GKMP,
          },
        },
      },
    });

    // Update the new Kaprodi's role to "Kaprodi"
    await prisma.account.update({
      where: {
        id: data.GKMP,
      },
      data: {
        role: "GKMP",
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
