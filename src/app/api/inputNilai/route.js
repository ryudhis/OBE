import prisma from "@/utils/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter

  // Validate prodi parameter if necessary
  if (!prodi) {
    return Response.json({ status: 400, message: "Missing prodi parameter" });
  }
  
  try {
    const inputNilai = await prisma.inputNilai.findMany({
      where: {
        prodiId: prodi,
      },
      orderBy: [{ penilaianCPMKId: "asc" }, { mahasiswaNim: "asc" }],
      include: { penilaianCPMK: true, mahasiswa: true },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: inputNilai,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    const inputNilaiData = data.map((mahasiswa) => ({
      penilaianCPMKId: mahasiswa.PCPMKId, // Assuming PCPMKId is the ID for penilaianCPMK
      mahasiswaNim: mahasiswa.MahasiswaId, // Assuming MahasiswaId is the NIM for mahasiswa
      kelasId: mahasiswa.kelasId, // Assuming kelasId is the ID for kelas
      nilai: mahasiswa.nilai,
      prodiId: mahasiswa.prodiId,
    }));

    // Use createMany to insert all entries at once
    const inputNilai = await prisma.inputNilai.createMany({
      data: inputNilaiData,
      skipDuplicates: true, // Optional: skips duplicates if any
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: inputNilai,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}
