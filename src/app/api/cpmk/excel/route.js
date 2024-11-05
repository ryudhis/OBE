import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import the token validation function

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
    const dataArray = await req.json();

    // Step 1: Fetch the CPL IDs as before
    const CPLIds = await prisma.CPL.findMany({
      where: {
        kode: { in: dataArray.CPMK.map((data) => data.kodeCPL) },
        prodiId: dataArray.prodiId,
      },
      select: {
        id: true,
        kode: true,
      },
    });

    // Step 2: Map CPLKode to the correct CPL ID or filter out if it’s null
    const updatedDataArray = dataArray.CPMK.map((data) => {
      const relatedCPL = CPLIds.find((cpl) => cpl.kode === data.kodeCPL);
      return relatedCPL
        ? {
            kode: data.kode,
            deskripsi: data.deskripsi,
            CPLKode: relatedCPL.id, // Use CPL primary key ID
            prodiId: dataArray.prodiId,
          }
        : null; // Mark as null if no related CPL found
    }).filter((data) => data !== null); // Filter out any records where CPLKode was null

    // Step 3: Use createMany with only valid data
    const createdCPMK = await prisma.CPMK.createMany({
      data: updatedDataArray,
      skipDuplicates: true,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: createdCPMK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
