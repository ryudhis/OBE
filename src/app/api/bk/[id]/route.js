import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import the token validation function

export async function GET(req) {
  const tokenValidation = validateToken(req);
  
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  try {
    const id = req.url.split("/bk/")[1];
    const BK = await prisma.BK.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        CPL: {
          include: {
            PL: true,
            CPMK: true,
          },
        },
        MK: {
          include: {
            CPMK: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
        data: BK,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}

export async function DELETE(req) {
  const tokenValidation = validateToken(req);
  
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  try {
    const id = req.url.split("/bk/")[1];
    const BK = await prisma.BK.delete({
      where: {
        id: parseInt(id),
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: BK,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}

export async function PATCH(req) {
  const tokenValidation = validateToken(req);
  
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  try {
    const id = req.url.split("/bk/")[1];
    const data = await req.json();

    const BK = await prisma.BK.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: BK,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}
