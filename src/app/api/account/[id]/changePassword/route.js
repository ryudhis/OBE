import bcrypt from "bcrypt";
import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function PATCH(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Get the id directly from params
    const { id } = params; 

    if (!id || isNaN(id)) {
      return new Response(
        JSON.stringify({ status: 400, message: "Invalid account ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await req.json();
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update the account's password
    const updatedAccount = await prisma.account.update({
      where: {
        id: parseInt(id), // Use the ID extracted from params
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
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
