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

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || "";

  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400 }
    );
  }

  try {
    const BK = await prisma.BK.findMany({
      where: {
        prodiId: prodi,
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
        message: "Berhasil ambil semua data!",
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

export async function POST(req) {
  const tokenValidation = validateToken(req);
  
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  try {
    const data = await req.json();
    const { prodiId, ...restData } = data;

    const BK = await prisma.BK.create({
      data: {
        ...restData,
        prodi: {
          connect: {
            kode: prodiId,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
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
