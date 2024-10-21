import bcrypt from "bcrypt";
import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import the token validation function

export async function PATCH(req) {
  const tokenValidation = validateToken(req);

  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  try {
    const data = await req.json();
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    const updatedAccount = await prisma.account.update({
      where: {
        id: parseInt(data.id),
      },
      data: {
        password: hashedPassword,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Account data successfully updated!",
        data: updatedAccount,
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
