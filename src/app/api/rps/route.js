import prisma from "@/utils/prisma";

export async function POST(req) {
  try {
    const data = await req.json();
    const { MKId, ...restData } = data;

    const PL = await prisma.rps.upsert({
      where: {
        MKId: parseInt(MKId),
      },
      update: { ...restData },
      create: {
        ...restData,
        MK: {
          connect: {
            id: parseInt(MKId),
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: PL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
