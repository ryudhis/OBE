export async function PATCH(req) {
  try {
    const id = req.url.split("/ketuaKK/")[1];
    const data = await req.json();

    const KK = await prisma.KK.update({
      where: {
        id: parseInt(id),
      },
      data: {
        ketuaKK: {
          connect: {
            id: data.ketuaKK,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: KK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
