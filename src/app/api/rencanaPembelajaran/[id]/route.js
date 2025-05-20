import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function GET(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = parseInt(params.id);

  try {
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.findUnique({
      where: {
        id: id,
      },
    });

    if (!rencanaPembelajaran) {
      return new Response(
        JSON.stringify({ status: 404, message: "Data not found!" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
        data: rencanaPembelajaran,
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

export async function DELETE(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = parseInt(params.id);

  try {
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.delete({
      where: {
        id: id,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: rencanaPembelajaran,
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

export async function PATCH(req, { params }) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = Number(params.id); // rencanaPembelajaran ID

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
      penilaian,
    } = data;

    //
    const existingChildren = await prisma.penilaianRP.findMany({
      where: { rencanaPembelajaranId: id },
      select: { id: true },
    });
    const existingIds = new Set(existingChildren.map((c) => c.id));

    const toUpdate = penilaian.filter((p) => p.id);
    const toCreate = penilaian.filter((p) => !p.id);

    const payloadIds = new Set(toUpdate.map((p) => p.id));
    const toDelete = [...existingIds].filter((eid) => !payloadIds.has(eid));

    const rencanaPembelajaran = await prisma.$transaction(async (tx) => {
      /* --- parent update --- */
      const parent = await tx.rencanaPembelajaran.update({
        where: { id },
        data: {
          minggu,
          bahanKajian: materi,
          bentuk,
          metode,
          sumber,
          waktu,
          pengalaman,
        },
      });

      /* --- upsert children --- */
      // updates
      for (const p of toUpdate) {
        await tx.penilaianRP.update({
          where: { id: p.id },
          data: {
            kriteria: p.kriteria,
            indikator: p.indikator,
            bobot: p.bobot,
          },
        });
      }
      // creates
      if (toCreate.length) {
        await tx.penilaianRP.createMany({
          data: toCreate.map((p) => ({
            kriteria: p.kriteria,
            indikator: p.indikator,
            bobot: p.bobot,
            rencanaPembelajaranId: id,
          })),
        });
      }
      // deletes
      if (toDelete.length) {
        await tx.penilaianRP.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      return tx.rencanaPembelajaran.findUnique({
        where: { id },
        include: { penilaianRP: true },
      });
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: rencanaPembelajaran,
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
