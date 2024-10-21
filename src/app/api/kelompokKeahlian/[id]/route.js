import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Ensure the path to your validateToken utility is correct

// GET kelompokKeahlian by ID
export async function GET(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { id } = params; // Get the id from params
    const KK = await prisma.kelompokKeahlian.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!KK) {
      return new Response(
        JSON.stringify({ status: 404, message: "Kelompok Keahlian not found!" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
        data: KK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE kelompokKeahlian by ID
export async function DELETE(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { id } = params; // Get the id from params
    const KK = await prisma.kelompokKeahlian.delete({
      where: {
        id: parseInt(id),
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: KK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PATCH kelompokKeahlian by ID
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
    const { id } = params; // Get the id from params
    const data = await req.json();

    if (data.ketua) {
      data.ketua = {
        connect: {
          id: data.ketua,
        },
      };
    }

    const KK = await prisma.kelompokKeahlian.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: KK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
