import prisma from "@/utils/prisma";

export async function POST(req) {

  try {
    const dataArray = await req.json();

    const createdCPL = await prisma.CPL.createMany({
      data: dataArray.CPL.map((data) => ({
        kode: data.kode,
        deskripsi: data.deskripsi,
        keterangan: data.keterangan
      })),
      skipDuplicates: true, 
    });

    return new Response(JSON.stringify({
      status: 200,
      message: "Berhasil buat data!",
      data: createdCPL,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ status: 400, message: "Something went wrong!" }), { headers: { 'Content-Type': 'application/json' } });
  }
}