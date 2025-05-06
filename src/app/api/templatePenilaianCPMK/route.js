import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

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
