import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const token = Cookies.get("token");
    const decodedToken = jwtDecode<CustomJwtPayload>(token);
    const userId = decodedToken.id;
    
    const account = await prisma.account.findUnique({
        where: {
          id: parseInt(userId),
        },
      });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: account,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}