import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function GET(req) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || "";

  // Validate prodi parameter if necessary
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const dataCounts = await Promise.all([
      {
        name: "PL",
        count: await prisma.PL.count({ where: { prodiId: prodi } }),
      },
      {
        name: "CPL",
        count: await prisma.CPL.count({ where: { prodiId: prodi } }),
      },
      {
        name: "BK",
        count: await prisma.BK.count({ where: { prodiId: prodi } }),
      },
      {
        name: "CPMK",
        count: await prisma.CPMK.count({ where: { prodiId: prodi } }),
      },
      {
        name: "MK",
        count: await prisma.MK.count({ where: { prodiId: prodi } }),
      },
      {
        name: "PCPMK",
        count: await prisma.penilaianCPMK.count({ where: { prodiId: prodi } }),
      },
      {
        name: "Mahasiswa",
        count: await prisma.mahasiswa.count({ where: { prodiId: prodi } }),
      },
    ]);

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: dataCounts,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GET data count Error: ", error); // More informative error logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
