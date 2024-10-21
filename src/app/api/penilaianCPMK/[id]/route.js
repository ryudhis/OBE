import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function GET(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = parseInt(params.id); // Directly get id from params

  try {
    const penilaianCPMK = await prisma.penilaianCPMK.findUnique({
      where: {
        id,
      },
      include: { inputNilai: true },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
        data: penilaianCPMK,
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

export async function DELETE(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = parseInt(params.id); // Directly get id from params

  try {
    const penilaianCPMK = await prisma.penilaianCPMK.delete({
      where: {
        id,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: penilaianCPMK,
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

export async function PATCH(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = parseInt(params.id); // Directly get id from params
  const data = await req.json(); // Get the updated data

  try {
    const penilaianCPMK = await prisma.penilaianCPMK.update({
      where: {
        id,
      },
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: penilaianCPMK,
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
