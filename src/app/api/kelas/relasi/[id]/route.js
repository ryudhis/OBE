import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const id = req.url.split("/relasi/")[1];
    const body = await req.json();

    console.log("Request body:", body);

    // Fetch the MKId of the current kelas
    const currentKelas = await prisma.kelas.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        MKId: true,
        mahasiswa: {
          select: {
            nim: true,
          },
        },
      },
    });

    if (!currentKelas) {
      return new Response(
        JSON.stringify({ status: 404, message: "Kelas not found!" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Current kelas MKId:", currentKelas.MKId);

    const existingMahasiswaNims = new Set(
      currentKelas.mahasiswa.map((m) => m.nim)
    );
    const newMahasiswaData = [];

    for (const mahasiswa of body.mahasiswa) {
      const nimString = String(mahasiswa.NIM);

      if (existingMahasiswaNims.has(nimString)) {
        console.log(
          `Mahasiswa with NIM ${nimString} is already in kelas, ignoring.`
        );
        continue;
      }

      // Verify that the mahasiswa exists
      const existingMahasiswa = await prisma.mahasiswa.findUnique({
        where: {
          nim: nimString,
        },
      });

      if (!existingMahasiswa) {
        return new Response(
          JSON.stringify({
            status: 404,
            message: `Mahasiswa with NIM ${nimString} not found!`,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const existingEnrollment = await prisma.kelas.findFirst({
        where: {
          MKId: currentKelas.MKId,
          mahasiswa: {
            some: {
              nim: nimString,
            },
          },
        },
      });

      if (existingEnrollment) {
        console.log(
          `Mahasiswa with NIM ${nimString} is already enrolled in another kelas for this MK, ignoring.`
        );
        continue;
      }

      newMahasiswaData.push({ nim: nimString });
    }

    if (newMahasiswaData.length === 0) {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "No new mahasiswa to add.",
          data: currentKelas,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Connecting new mahasiswa:", newMahasiswaData);

    // Connect all valid new mahasiswa
    const updatedKelas = await prisma.kelas.update({
      where: {
        id: parseInt(id),
      },
      data: {
        mahasiswa: {
          connect: newMahasiswaData,
        },
      },
    });

    console.log("Updated kelas:", updatedKelas);

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: updatedKelas,
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
