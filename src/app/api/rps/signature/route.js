import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function PATCH(req) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    const body = await req.json();
    const { MKId, role, signature } = body;

    if (!MKId || !role || !signature) {
      return new Response(
        JSON.stringify({ status: 400, message: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    const data = {};
    if (role === "Pengembang") {
      data.signaturePengembang = signature;
    } else if (role === "GKMP") {
      data.signatureGKMP = signature;
    } else if (role === "KK") {
      data.signatureKetuaKK = signature;
    } else if (role === "Kaprodi") {
      data.signatureKaprodi = signature;
    } 

    const updateRPS = await prisma.rps.update({
      where: { MKId },
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Signature updated successfully",
        data: updateRPS,
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
