import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function POST(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const data = await req.json();
    const { MKId, dosenId, ...restData } = data;

    const PL = await prisma.rps.upsert({
      where: {
        MKId: MKId,
      },
      update: {
        ...restData,
        pengembang: {
          connect: {
            id: parseInt(dosenId),
          },
        },
      },
      create: {
        ...restData,
        MK: {
          connect: {
            kode: MKId,
          },
        },
        pengembang: {
          connect: {
            id: parseInt(dosenId),
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: PL,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error); // Changed from console.log to console.error for better error visibility
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
