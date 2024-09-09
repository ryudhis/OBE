import prisma from "@/utils/prisma";

export async function POST(req) {
  try {
    const data = await req.json();
    const { MKId, dosenId, ...restData } = data;

    const PL = await prisma.rps.upsert({
      where: {
        MKId: MKId,
      },
      update: {
        ...restData,
        pengembang: {
          connect: {
            id: parseInt(dosenId),
          },
        },
      },
      create: {
        ...restData,
        MK: {
          connect: {
            kode: MKId,
          },
        },
        pengembang: {
          connect: {
            id: parseInt(dosenId),
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
