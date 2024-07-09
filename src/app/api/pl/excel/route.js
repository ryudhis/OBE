import prisma from "@/utils/prisma";

export async function POST(req) {
  try {
    const dataArray = await req.json();

    const createdPL = await prisma.PL.createMany({
      data: dataArray.PL.map((data) => ({
        kode: data.kode,
        deskripsi: data.deskripsi,
        prodiId: dataArray.prodiId,
      })),
      skipDuplicates: true, 
    });

    return new Response(JSON.stringify({
      status: 200,
      message: "Berhasil buat data!",
      data: createdPL,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ status: 400, message: "Something went wrong!" }), { headers: { 'Content-Type': 'application/json' } });
  }
}