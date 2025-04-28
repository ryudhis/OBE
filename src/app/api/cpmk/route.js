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
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter
  const page = parseInt(searchParams.get("page")) || 1; // Default to page 1
  const limit = parseInt(searchParams.get("limit")) || 10; // Default to 10 items per page
  const search = searchParams.get("search") || ""; // Default to empty string

  // Validate prodi parameter if necessary
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Calculate total items
    const totalItems = await prisma.CPMK.count({
      where: {
        prodiId: prodi,
        OR: [
          { kode: { contains: search } },
          { deskripsi: { contains: search } },
        ],
      },
    });

    // Calculate total pages
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // Ensure the page number is within the valid range
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    // Fetch paginated data
    const CPMK = await prisma.CPMK.findMany({
      where: {
        prodiId: prodi,
        OR: [
          { kode: { contains: search } },
          { deskripsi: { contains: search } },
        ],
      },
      include: {
        CPL: {
          include: {
            PL: true,
            BK: true,
          },
        },
        MK: {
          include: {
            BK: true,
          },
        },
        penilaianCPMK: true,
        lulusCPMK: { include: { tahunAjaran: true } },
      },
      take: limit,
      skip: (currentPage - 1) * limit,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: CPMK,
        meta: {
          currentPage,
          totalPages,
          totalItems,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GET CPMK Error: ", error); // More informative error logging
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
    const { prodiId, CPLId, ...restData } = data; // Extract prodiId from data

    // Check if the combination of kode and prodiId exists
    const existingCPL = await prisma.CPL.findUnique({
      where: {
        kode_prodiId: {
          kode: CPLId,
          prodiId: prodiId,
        },
      },
    });

    // Create the CPMK entry and connect it to the CPL and prodi

    const CPMK = await prisma.CPMK.create({
      data: {
        ...restData,
        CPL: {
          connect: {
            kode_prodiId: {
              kode: CPLId,
              prodiId: existingCPL ? prodiId : "0", // Use 0 if the combination is not found
            },
          },
        },
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
        data: CPMK,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("POST CPMK Error: ", error); // More informative error logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
