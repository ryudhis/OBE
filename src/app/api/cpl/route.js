import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import the token validation function

export async function GET(req) {
  const tokenValidation = validateToken(req);

  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || "";
  const page = parseInt(searchParams.get("page")) || 1; // Default to page 1
  const limit = parseInt(searchParams.get("limit")) || 10; // Default to 10 items per page

  if (!prodi) {
    return Response.json({ status: 400, message: "Missing prodi parameter" });
  }

  try {
    // Calculate total items
    const totalItems = await prisma.CPL.count({
      where: {
        prodiId: prodi,
      },
    });

    // Calculate total pages
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // Ensure the page number is within the valid range
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    // Fetch paginated data
    const CPL = await prisma.CPL.findMany({
      where: {
        prodiId: prodi,
      },
      include: {
        PL: true,
        BK: {
          include: {
            MK: true,
          },
        },
        CPMK: {
          include: {
            MK: true,
            lulusCPMK: true,
            lulusMK_CPMK: true,
          },
        },
        performaCPL: { include: { tahunAjaran: true } },
      },
      take: limit,
      skip: (currentPage - 1) * limit,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: CPL,
      meta: {
        currentPage,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 500, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  const tokenValidation = validateToken(req);

  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = await req.json();
    const { prodiId, ...restData } = data;

    const CPL = await prisma.CPL.create({
      data: {
        ...restData,
        prodi: {
          connect: {
            kode: prodiId,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: CPL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
