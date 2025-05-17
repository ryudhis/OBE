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

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || "";

  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400 }
    );
  }

  try {
    const account = await prisma.account.findMany({
      where: {
        prodiId: prodi,
        role: {
          in: ["Dosen", "Kaprodi", "GKMP"],
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
