import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function GET(req) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const dataCounts = await Promise.all([
      {
        name: "Akun",
        count: await prisma.account.count(),
      },
      {
        name: "Prodi",
        count: await prisma.prodi.count(),
      },
      {
        name: "Tahun Ajaran",
        count: await prisma.tahunAjaran.count(),
      },
    ]);

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: dataCounts,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GET data count Error: ", error); // More informative error logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
