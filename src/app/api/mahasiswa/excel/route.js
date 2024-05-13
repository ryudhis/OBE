import prisma from "@/utils/prisma";

export async function POST(req) {
  try {
    const dataArray = await req.json();

    const dataMahasiswa = await prisma.mahasiswa.findMany();
    const existingNIM = dataMahasiswa.map((mahasiswa) => mahasiswa.nim);

    // Filter dataArray to include only the objects with NIMs that are not in existingNIMs
    const filteredDataMahasiswa = dataArray.mahasiswa.filter(
      (data) => !existingNIM.includes(String(data.NIM))
    );

    // Use Array.map() to create an array of Promises for creating mahasiswa objects

    // Throw an error if filteredDataMahasiswa is empty
    if (filteredDataMahasiswa.length === 0) {
      throw new Error("No new data to create");
    }

    const createPromises = filteredDataMahasiswa.map((data) =>
      prisma.mahasiswa.create({
        data: {
          nama: data.Nama,
          nim: String(data.NIM),
        },
      })
    );

    // Execute all promises concurrently using Promise.all()
    const createdMahasiswas = await Promise.all(createPromises);

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: createdMahasiswas,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
