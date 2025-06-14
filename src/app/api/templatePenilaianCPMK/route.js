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
  const prodi = searchParams.get("prodi") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const MK = searchParams.get("MK") === "default" ? "" : searchParams.get("MK");
  const search = searchParams.get("search") || "";

  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const where = {
      active: true,
      MK: {
        prodiId: prodi,
        ...(MK ? { kode: MK } : {}),
        ...(search
          ? {
              kode: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
    };

    const totalItems = await prisma.templatePenilaianCPMK.count({ where });

    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const templates = await prisma.templatePenilaianCPMK.findMany({
      where,
      include: {
        penilaianCPMK: { include: { CPL: true, CPMK: true } },
        MK: true,
      },
      take: limit,
      skip: (currentPage - 1) * limit,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data template aktif!",
        data: templates,
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

    // Check if MK already has a related template
    const existingTemplates = await prisma.templatePenilaianCPMK.findMany({
      where: {
        MK: {
          kode: data.mkId,
        },
      },
    });

    const isFirstTemplate = existingTemplates.length === 0;

    const templatePenilaianCPMK = await prisma.templatePenilaianCPMK.create({
      data: {
        active: isFirstTemplate,
        template: data.template,
        MK: {
          connect: {
            kode: data.mkId,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: templatePenilaianCPMK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error.message);
    return new Response(
      JSON.stringify({
        status: 400,
        message: error.message || "Something went wrong!",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
