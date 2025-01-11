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
  const prodi = searchParams.get("prodi") || "";
  const dosenId = parseInt(searchParams.get("dosen")) || null;
  const tahunAjaranId = parseInt(searchParams.get("tahunAjaran")) || null;
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
    let whereCondition;

    if (dosenId) {
      const account = await prisma.account.findUnique({
        where: { id: dosenId },
        include: { kelas: true },
      });

      const kelasArray = (account?.kelas || []).filter(
        (kelas) => kelas.tahunAjaranId === tahunAjaranId
      );

      // Extract MKId from kelasArray and remove duplicates
      const MKidArray = [...new Set(kelasArray.map((kelas) => kelas.MKId))];

      // Set the where condition based on the found MKidArray
      whereCondition = {
        kode: { in: MKidArray },
        OR: [
          { kode: { contains: search } },
          { deskripsi: { contains: search } },
          { deskripsiInggris: { contains: search } },
        ],
      };
    } else {
      // Set the where condition to filter by prodiId
      whereCondition = {
        prodiId: prodi,
        OR: [
          { kode: { contains: search } },
          { deskripsi: { contains: search } },
          { deskripsiInggris: { contains: search } },
        ],
      };
    }

    // Calculate total items
    const totalItems = await prisma.MK.count({ where: whereCondition });

    // Calculate total pages
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // Ensure the page number is within the valid range
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const MK = await prisma.MK.findMany({
      where: whereCondition,
      include: {
        BK: true,
        CPMK: { include: { CPL: true } },
        kelas: { include: { mahasiswa: true, tahunAjaran: true } },
        penilaianCPMK: { include: { CPMK: true } },
        lulusMK: true,
        lulusMK_CPMK: true,
      },
      take: limit,
      skip: (currentPage - 1) * limit,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: MK,
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
    const { prodiId, KK, prerequisitesMK, ...restData } = data;

    const payload = {
      ...restData,
      prodi: {
        connect: {
          kode: prodiId,
        },
      },
      KK: {
        connect: {
          id: parseInt(KK),
        },
      },
    };

    if (data.prerequisitesMK.length !== 0) {
      payload.prerequisitesMK = {
        connect: data.prerequisitesMK.map((MKId) => ({
          kode: MKId,
        })),
      };
    }

    const MK = await prisma.MK.create({
      data: payload,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: MK,
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
