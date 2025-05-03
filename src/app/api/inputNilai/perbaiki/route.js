import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function PATCH(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const updates = await req.json();

    if (!Array.isArray(updates)) {
      return new Response(
        JSON.stringify({ status: 400, message: "Payload must be an array" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updatePromises = updates.map((item) =>
      prisma.inputNilai.update({
        where: { id: parseInt(item.cpmkId) },
        data: { nilai: item.nilai },
      })
    );

    const results = await Promise.allSettled(updatePromises);

    const hasError = results.some(result => result.status === "rejected");

    return new Response(
      JSON.stringify({
        status: hasError ? 400 : 200,
        message: hasError ? "Beberapa nilai gagal diperbarui" : "Semua nilai berhasil diperbarui",
        data: results,
      }),
      { status: hasError ? 400 : 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("PATCH inputNilai Error:", error);
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}