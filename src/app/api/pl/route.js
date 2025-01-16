import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import your token validation utility

export async function GET(req, res) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 400, message: tokenValidation.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";

  // Validate prodi parameter if necessary
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Calculate total items
    const totalItems = await prisma.PL.count({
      where: {
        prodiId: prodi,
        kode: {
          contains: search,
        },
      },
    });

    // Calculate total pages
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // Ensure the page number is within the valid range
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    // Fetch paginated data
    const PL = await prisma.PL.findMany({
      where: {
        prodiId: prodi,
        kode: {
          contains: search,
        },
      },
      include: {
        CPL: {
          include: {
            BK: true,
            CPMK: true,
          },
        },
      },
      take: limit,
      skip: (currentPage - 1) * limit,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data",
        data: PL,
        meta: {
          currentPage,
          totalPages,
          totalItems,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong" }),
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
    const { prodiId, ...restData } = data; // Extract prodiId from data

    // Create the PL entry and connect it to the prodi
    const PL = await prisma.PL.create({
      data: {
        ...restData,
        prodi: {
          connect: {
            kode: prodiId,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: PL,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
