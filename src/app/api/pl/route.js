import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import your token validation utility

export async function GET(req, res) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return res
      .status(401)
      .json({ status: 401, message: tokenValidation.message });
  }

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter

  // Validate prodi parameter if necessary
  if (!prodi) {
    return res
      .status(400)
      .json({ status: 400, message: "Missing prodi parameter" });
  }

  try {
    const PL = await prisma.PL.findMany({
      where: {
        prodiId: prodi,
      },
      include: {
        CPL: {
          include: {
            BK: true,
            CPMK: true,
          },
        },
      },
    });

    return res.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: PL,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: 400, message: "Something went wrong!" });
  }
}

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
    const { prodiId, ...restData } = data; // Extract prodiId from data

    // Create the PL entry and connect it to the prodi
    const PL = await prisma.PL.create({
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
        data: PL,
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
