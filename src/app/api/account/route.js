import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const account = await prisma.account.findMany();

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: account,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}


