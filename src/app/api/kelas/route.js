import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Ensure this path is correct

// GET all kelas
export async function GET(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const kelas = await prisma.kelas.findMany({
      include: {
        MK: true, // Include the associated MK records
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: kelas,
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

// POST new kelas
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
    const jumlahKelas = Math.max(1, Math.min(data.jumlahKelas, 4)); // Limit between 1 and 4
    const namaBase = "R"; // Base name for kelas

    const templateId = await prisma.templatePenilaianCPMK.findFirst({
      where: {
        MKId: data.MKId,
        active: true,
      },
    });

    // Create multiple kelas
    for (let i = 0; i < jumlahKelas; i++) {
      const nama =
        jumlahKelas === 1
          ? namaBase
          : `${namaBase}${String.fromCharCode(65 + i)}`;
      await prisma.kelas.create({
        data: {
          nama: nama,
          jumlahLulus: 0,
          mahasiswaLulus: [], // Assuming this is a list of student IDs
          MK: {
            connect: {
              kode: data.MKId,
            },
          },
          templatePenilaianCPMK: {
            connect: {
              id: templateId.id,
            },
          },
          tahunAjaran: {
            connect: {
              id: data.tahunAjaranId,
            },
          },
        },
      });
    }

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: null,
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

// DELETE kelas by MKId
export async function DELETE(req) {
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

    const result = await prisma.kelas.deleteMany({
      where: {
        MKId: data.MKId, // Delete kelas associated with the given MKId
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil menghapus data!",
        data: result,
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
