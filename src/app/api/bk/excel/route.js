import prisma from "@/utils/prisma";

export async function POST(req) {
  try {
    const dataArray = await req.json();

    const createdBK = await prisma.BK.createMany({
      data: dataArray.BK.map((data) => ({
        kode: data.kode,
        deskripsi: data.deskripsi,
        min: data.min,
        max: data.max,
      })),
      skipDuplicates: true, 
    });

    return new Response(JSON.stringify({
      status: 200,
      message: "Berhasil buat data!",
      data: createdBK,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ status: 400, message: "Something went wrong!" }), { headers: { 'Content-Type': 'application/json' } });
  }
}