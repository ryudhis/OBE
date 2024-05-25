import prisma from "@/utils/prisma";

export async function POST(req) {
  try {
    const dataArray = await req.json();

    const createdMahasiswa = await prisma.mahasiswa.createMany({
      data: dataArray.mahasiswa.map((data) => ({
        nama: data.Nama,
        nim: String(data.NIM),
      })),
      skipDuplicates: true,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: createdMahasiswa,
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
