import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function POST(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const id = params.id; // Get the kelas ID from the route parameters
    if (!id) {
      throw new Error("Kelas ID is missing");
    }

    const data = await req.json();
    const { CPMKId, ...restData } = data;

    const evaluasiCPMK = await prisma.evaluasiCPMKKelas.upsert({
      where: {
        kelasId_CPMKId: {
          kelasId: parseInt(id),
          CPMKId: parseInt(CPMKId),
        },
      },
      update: {
        ...restData,
      },
      create: {
        ...restData,
        kelas: {
          connect: {
            id: parseInt(id),
          },
        },
        CPMK: {
          connect: {
            id: parseInt(CPMKId),
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: evaluasiCPMK,
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
