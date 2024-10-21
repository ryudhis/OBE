import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Adjust the import according to your token validation utility

export async function GET(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const prodi = await prisma.prodi.findMany();

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: prodi,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const data = await req.json();

    // Create the prodi entry
    const prodi = await prisma.prodi.create({
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: prodi,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
