import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function PATCH(req, { params }) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = parseInt(params.id);

  try {
    // Find the template to be updated
    const currentTemplate = await prisma.templatePenilaianCPMK.findUnique({
      where: { id },
    });

    if (!currentTemplate) {
      return new Response(
        JSON.stringify({ status: 404, message: "Template not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the currently active template for the same MK (if any)
    const existingActive = await prisma.templatePenilaianCPMK.findFirst({
      where: {
        mataKuliahId: currentTemplate.mataKuliahId,
        active: true,
        NOT: { id },
      },
    });

    // Deactivate the currently active template if it's different
    if (existingActive) {
      await prisma.templatePenilaianCPMK.update({
        where: { id: existingActive.id },
        data: { active: false },
      });
    }

    // Activate the selected template (with any additional data)
    const updatedTemplate = await prisma.templatePenilaianCPMK.update({
      where: { id },
      data: {
        active: true,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
        data: updatedTemplate,
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
