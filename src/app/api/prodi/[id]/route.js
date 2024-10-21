import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Adjust the import according to your token validation utility

export async function GET(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Get kode from params.id (assuming you are using a dynamic route [id].js)
  const { id: kode } = params;

  try {
    const prodi = await prisma.prodi.findUnique({
      where: {
        kode,
      },
      include: {
        tendik: true,
        mahasiswa: true,
        MK: true,
        KK: {
          include: {
            ketua: true,
            MK: true,
          },
        },
        kaprodi: true,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
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

export async function DELETE(req, { params }) {
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
    const prodi = await prisma.prodi.delete({
      where: {
        kode,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
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
  const data = await req.json();

  try {
    const prodi = await prisma.prodi.update({
      where: {
        kode,
      },
      data,
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
