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

  const id = parseInt(params.id); 

  try {
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.findUnique({
      where: {
        id: id,
      },
    });

    if (!rencanaPembelajaran) {
      return new Response(
        JSON.stringify({ status: 404, message: "Data not found!" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
        data: rencanaPembelajaran,
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

  const id = parseInt(params.id); 

  try {
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.delete({
      where: {
        id: id,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: rencanaPembelajaran,
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

  const id = parseInt(params.id); 

  try {
    const data = await req.json();

    const rencanaPembelajaran = await prisma.rencanaPembelajaran.update({
      where: {
        id: id,
      },
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: rencanaPembelajaran,
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
