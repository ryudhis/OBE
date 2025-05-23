import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Assuming you have a token validation function

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
  const MK = searchParams.get("MK") === "default" ? "" : searchParams.get("MK"); // Access MK query parameter
  const search = searchParams.get("search") || ""; // Default to empty string

  // Validate prodi parameter if necessary
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const where = {
      prodiId: prodi,
      ...(MK && { MKkode: MK }),
      kode: {
        contains: search,
      },
    };

    // Calculate total items
    const totalItems = await prisma.penilaianCPMK.count({
      where,
    });

    // Calculate total pages
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // Ensure the page number is within the valid range
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const penilaianCPMK = await prisma.penilaianCPMK.findMany({
      where,
      include: {
        CPMK: true,
        CPL: true,
        MK: true,
      },
      take: limit,
      skip: (currentPage - 1) * limit,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: penilaianCPMK,
        meta: {
          currentPage,
          totalPages,
          totalItems,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
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
    const { prodiId, ...restData } = data; // Extract prodiId from data

    const filteredPCPMK = await prisma.penilaianCPMK.findMany({
      where: {
        templatePenilaianCPMKId: data.templatePenilaianCPMK,
      },
    });

    let totalBobot = 0;

    filteredPCPMK.forEach((pcpmk) => {
      pcpmk.kriteria.forEach((kriteria) => {
        totalBobot += kriteria.bobot;
      });
    });

    let currentBobot = 0;

    data.kriteria.forEach((kriteria) => {
      currentBobot += kriteria.bobot;
    });

    if (totalBobot + currentBobot > 100) {
      throw new Error(
        `Bobot MK Melebihi 100, Bobot saat ini sudah ${totalBobot}`
      );
    }

    // Check if the combination of kode and prodiId exists
    const existingCPL = await prisma.CPL.findUnique({
      where: {
        kode_prodiId: {
          kode: data.CPL,
          prodiId: prodiId,
        },
      },
    });

    const penilaianCPMK = await prisma.penilaianCPMK.create({
      data: {
        ...restData,
        templatePenilaianCPMK: {
          connect: {
            id: data.templatePenilaianCPMK,
          },
        },
        MK: {
          connect: {
            kode: data.MK,
          },
        },
        CPMK: {
          connect: {
            kode_prodiId: {
              kode: data.CPMK,
              prodiId: prodiId,
            },
          },
        },
        CPL: {
          connect: {
            kode_prodiId: {
              kode: data.CPL,
              prodiId: existingCPL ? prodiId : "0", 
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
        data: penilaianCPMK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "CPMK sudah ada pada template ini!",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    console.log(error.message);
    return new Response(
      JSON.stringify({
        status: 400,
        message: error.message || "Something went wrong!",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
