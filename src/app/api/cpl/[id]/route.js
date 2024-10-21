import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import the token validation function

export async function GET(req) {
  const tokenValidation = validateToken(req);
  
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = req.url.split("/cpl/")[1];
    const CPL = await prisma.CPL.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        PL: true,
        BK: {
          include: {
            MK: true
          }
        },
        CPMK: {
          include: {
            MK: true
          }
        }
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
        data: CPL,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(req) {
  const tokenValidation = validateToken(req);

  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = req.url.split("/cpl/")[1];
    const CPL = await prisma.CPL.delete({
      where: {
        id: parseInt(id),
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: CPL,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(req) {
  const tokenValidation = validateToken(req);

  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = req.url.split("/cpl/")[1];
    const data = await req.json();

    const CPL = await prisma.CPL.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: CPL,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
