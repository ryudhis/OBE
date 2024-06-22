import prisma from "@/utils/prisma";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

export async function GET() {
  try {
    const token = Cookies.get("token");
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;

    const account = await prisma.account.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!account) {
      return Response.json({ status: 404, message: "Account not found!" });
    }

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
