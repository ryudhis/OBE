import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function GET(req) {
  const tokenValidation = validateToken(req);

  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  // Check if the decoded role is not "Super Admin"
  const userRole = tokenValidation.decoded.role;
  if (userRole !== "Super Admin") {
    return new Response(
      JSON.stringify({
        status: 403,
        message: "Access forbidden: insufficient permissions.",
      }),
      { status: 403 }
    );
  }

  try {
    const account = await prisma.account.findMany({
      include: {
        prodi: {
          select: {
            nama: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: account,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}
