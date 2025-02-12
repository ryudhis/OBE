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
    const id = params.id; // Get the kelas ID from the route parameters
    const kelas = await prisma.kelas.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        MK: {
          include: {
            CPMK: true,
            penilaianCPMK: {
              include: { inputNilai: true, CPMK: true, CPL: true },
            },
          },
        },
        mahasiswa: {
          include: {
            kelas: true,
            inputNilai: {
              include: {
                penilaianCPMK: true,
              },
            },
          },
        },
        evaluasiCPMK: true,
        evaluasiCPL: true,
        dosen: true,
        tahunAjaran: true,
      },
    });

    if (!kelas) {
      return new Response(
        JSON.stringify({ status: 404, message: "Kelas not found!" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
        data: kelas,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error); // Improved error logging
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}

export async function DELETE(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = params.id; // Get the kelas ID from the route parameters
    const kelas = await prisma.kelas.delete({
      where: {
        id: parseInt(id),
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: kelas,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error); // Improved error logging
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}

export async function PATCH(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = params.id; // Get the kelas ID from the route parameters
    const data = await req.json();

    const kelas = await prisma.kelas.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: kelas,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error); // Improved error logging
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}
