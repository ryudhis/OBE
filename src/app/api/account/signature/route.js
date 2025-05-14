import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function POST(req) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    const body = await req.json();
    const { accountId, svg } = body;

    if (!accountId || !svg) {
      return new Response(
        JSON.stringify({ status: 400, message: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { signature: svg },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Signature updated successfully",
        data: updatedAccount,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return new Response(
      JSON.stringify({ status: 500, message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
