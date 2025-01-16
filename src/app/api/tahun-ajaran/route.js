import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function GET(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1; // Default to page 1
  const limit = parseInt(searchParams.get("limit")) || 10; // Default to 10 items per page
  const search = searchParams.get("search") || ""; // Default to empty string

  try {
    // Calculate total items
    const totalItems = await prisma.tahunAjaran.count({
      where: {
        tahun: {
          contains: search,
        },
      },
    });

    // Calculate total pages
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // Ensure the page number is within the valid range
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const tahunAjaran = await prisma.tahunAjaran.findMany({
      where: {
        tahun: {
          contains: search,
        },
      },
      take: limit,
      skip: (currentPage - 1) * limit,
      orderBy: {
        id: "desc", // Ordering by ID in descending order
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: tahunAjaran,
        meta: {
          currentPage,
          totalPages,
          totalItems,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
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

    const tahunAjaran = await prisma.tahunAjaran.create({
      data,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: tahunAjaran,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
