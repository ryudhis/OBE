import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const id = req.url.split("/relasi/")[1];
    const body = await req.json();

    // Fetch the existing mahasiswa connections
    const existingKelas = await prisma.kelas.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        mahasiswa: {
          select: {
            nim: true,
          },
        },
      },
    });

    const existingMahasiswaNIMs = existingKelas.mahasiswa.map((mahasiswa) => mahasiswa.nim);

    // Filter out mahasiswa NIMs that are already connected
    const newMahasiswaData = body.mahasiswa.filter(
      (mahasiswa) => !existingMahasiswaNIMs.includes(String(mahasiswa.nim))
    );

    // Connect all valid mahasiswa
    const kelas = await prisma.kelas.update({
      where: {
        id: parseInt(id),
      },
      data: {
        mahasiswa: {
          connect: newMahasiswaData.map((mahasiswa) => ({ nim: String(mahasiswa.nim) })),
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: kelas,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
