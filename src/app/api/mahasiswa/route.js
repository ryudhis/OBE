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

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter
  const page = parseInt(searchParams.get("page")) || 1; // Default to page 1
  const limit = parseInt(searchParams.get("limit")) || 10; // Default to 10 items per page
  const search = searchParams.get("search") || ""; // Default to empty string

  console.log(search);

  // Validate prodi parameter
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Calculate total items
    const totalItems = await prisma.mahasiswa.count({
      where: {
        prodiId: prodi,
        OR: [
          { nim: { contains: search } },
          { nama: { contains: search } },
        ],
      },
    });

    // Calculate total pages
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // Ensure the page number is within the valid range
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    // Fetch paginated data
    const mahasiswa = await prisma.mahasiswa.findMany({
      orderBy: { nim: "asc" },
      where: {
        prodiId: prodi,
        OR: [
          { nim: { contains: search } },
          { nama: { contains: search } },
        ],
      },
      take: limit,
      skip: (currentPage - 1) * limit,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: mahasiswa,
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
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const data = await req.json();
    
    // Validate that necessary fields are present
    if (!data.prodiId) {
      return new Response(
        JSON.stringify({ status: 400, message: "Missing prodiId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!data.nama || !data.nim) {
      return new Response(
        JSON.stringify({ status: 400, message: "Missing nama or nim in data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the mahasiswa entry
    const mahasiswa = await prisma.mahasiswa.create({
      data: {
        ...data,
        prodi: {
          connect: {
            kode: data.prodiId, // Use the correct identifier based on your model
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: mahasiswa,
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
