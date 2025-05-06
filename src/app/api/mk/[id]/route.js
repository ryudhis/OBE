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

  try {
    const { id: kode } = params;
    const MK = await prisma.MK.findUnique({
      where: { kode: kode },
      include: {
        templatePenilaianCPMK: {
          include: {
            penilaianCPMK: {
              include: {
                CPMK: true,
              },
            },
          },
        },
        BK: { include: { CPL: true } },
        CPMK: { include: { CPL: true } },
        kelas: {
          include: {
            MK: true,
            mahasiswa: true,
            tahunAjaran: true,
            lulusCPMK: true,
            dosen: true,
          },
        },
        rencanaPembelajaran: {
          orderBy: { minggu: "asc" },
        },
        lulusMK_CPMK: true,
        KK: {
          include: {
            ketua: {
              select: {
                nama: true,
              },
            },
          },
        },
        prodi: { include: { kaprodi: true } },
        prerequisitesMK: true,
        isPrerequisiteFor: true,
        rps: { include: { pengembang: true } },
      },
    });

    if (!MK) {
      return new Response(
        JSON.stringify({ status: 404, message: "MK not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data!",
        data: MK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        status: 400,
        message: error.message || "Something went wrong!",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
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

  try {
    const { id: kode } = params;
    const MK = await prisma.MK.delete({
      where: { kode: kode },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: MK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        status: 400,
        message: error.message || "Something went wrong!",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PATCH(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { id: kode } = params;
    const data = await req.json();

    // Extract and remove `addedPrerequisiteId` and `removedPrerequisiteId` from `data`
    const {
      addedPrerequisiteId = [],
      removedPrerequisiteId = [],
      ...updateData
    } = data;

    const MK = await prisma.MK.update({
      where: { kode: kode },
      data: {
        ...updateData, // Only include relevant data
        prerequisitesMK: {
          connect: addedPrerequisiteId.map((id) => ({ kode: id })),
          disconnect: removedPrerequisiteId.map((id) => ({ kode: id })),
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: MK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        status: 400,
        message: error.message || "Something went wrong!",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
