import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function GET(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = params.id
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return new Response(
        JSON.stringify({ status: 400, message: "Invalid ID parameter" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const inputNilai = await prisma.inputNilai.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        penilaianCPMK: {
          include: {
            MK: true,
            CPMK: true,
            CPL: true,
          },
        },
        mahasiswa: true,
        kelas: true,
      },
    });

    if (!inputNilai) {
      return new Response(
        JSON.stringify({ status: 404, message: "Data not found!" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
        data: inputNilai,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("GET inputNilai Error: ", error); // More informative error logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(req, { params } ) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = params.id;

    console.log(id);

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return new Response(
        JSON.stringify({ status: 400, message: "Invalid ID parameter" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const inputNilai = await prisma.inputNilai.delete({
      where: {
        id: parseInt(id),
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: inputNilai,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("DELETE inputNilai Error: ", error); // More informative error logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(req, { params } ) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = params.id;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return new Response(
        JSON.stringify({ status: 400, message: "Invalid ID parameter" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await req.json();

    const inputNilai = await prisma.inputNilai.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: inputNilai,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("PATCH inputNilai Error: ", error); // More informative error logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
