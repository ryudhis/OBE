import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const id = req.url.split("/relasi/")[1];
    const body = await req.json();

    // Fetch the MKId of the current kelas
    const currentKelas = await prisma.kelas.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        MKId: true,
      },
    });

    if (!currentKelas) {
      return new Response(
        JSON.stringify({ status: 404, message: "Kelas not found!" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Check each mahasiswa if they are already enrolled in another kelas for the same MK
    for (const mahasiswa of body.mahasiswa) {
      const existingEnrollment = await prisma.kelas.findFirst({
        where: {
          MKId: currentKelas.MKId,
          mahasiswa: {
            some: {
              nim: mahasiswa.nim,
            },
          },
        },
      });

      if (existingEnrollment) {
        return new Response(
          JSON.stringify({
            status: 400,
            message: `Mahasiswa with NIM ${mahasiswa.nim} is already enrolled in another kelas for this MK!`,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Connect all valid mahasiswa
    const kelas = await prisma.kelas.update({
      where: {
        id: parseInt(id),
      },
      data: {
        mahasiswa: {
          connect: body.mahasiswa.map((mahasiswa) => ({
            nim: String(mahasiswa.nim),
          })),
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: kelas,
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
