import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function GET(req) {
  try {
    const tokenValidation = validateToken(req);

    if (!tokenValidation.valid) {
      return new Response(
        JSON.stringify({ status: 401, message: tokenValidation.message }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = tokenValidation.decoded.id;

    if (!userId) {
      return new Response(
        JSON.stringify({
          status: 401,
          message: "User ID not found in token!",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const account = await prisma.account.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        ...Object.fromEntries(
          Object.keys(prisma.account.fields).map((field) => [field, true])
        ),
        kelas: {
          include: {
            tahunAjaran: true,
          },
        },
        password: false, 
      },
    });

    if (!account) {
      return new Response(
        JSON.stringify({ status: 404, message: "Account not found!" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Successfully retrieved data!",
        data: account,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
