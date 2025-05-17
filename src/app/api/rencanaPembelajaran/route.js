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
  const templateId = searchParams.get("templateId");

  if (!templateId) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing templateId parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.findMany({
      where: {
        templatePenilaianCPMKId: parseInt(templateId),
      },
      include: {
        penilaianRP: true,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: rencanaPembelajaran,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const data = await req.json();
    const {
      minggu,
      materi,
      bentuk,
      metode,
      sumber,
      waktu,
      pengalaman,
      templatePenilaianCPMKId,
      penilaianCPMKId,
      penilaian, // Array: [{ kriteria, indikator, bobot }]
    } = data;

    const created = await prisma.rencanaPembelajaran.create({
      data: {
        minggu,
        bahanKajian: materi,
        bentuk,
        metode,
        sumber,
        waktu,
        pengalaman,
        templatePenilaianCPMK: {
          connect: { id: templatePenilaianCPMKId },
        },
        penilaianCPMK: {
          connect: { id: penilaianCPMKId },
        },
        penilaianRP: {
          create: penilaian.map((p) => ({
            kriteria: p.kriteria,
            indikator: p.indikator,
            bobot: p.bobot,
          })),
        },
      },
      include: {
        penilaianRP: true,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: created,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(req) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { templatePenilaianCPMKId } = await req.json();

  if (!templatePenilaianCPMKId) {
    return new Response(
      JSON.stringify({
        status: 400,
        message: "Missing templatePenilaianCPMKId",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const deleted = await prisma.rencanaPembelajaran.deleteMany({
      where: {
        templatePenilaianCPMKId,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: deleted,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
