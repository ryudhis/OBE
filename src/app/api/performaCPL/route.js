// app/api/cpl/rangkuman-performa/route.js
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

  if (!prodi) {
    return Response.json({ status: 400, message: "Missing prodi parameter" });
  }

  try {
    const CPL = await prisma.CPL.findMany({
      where: {
        prodiId: prodi,
      },
      include: {
        CPMK: {
          include: {
            lulusCPMK: true,
            lulusMK_CPMK: {
              include: {
                MK: true,
              },
            },
          },
        },
      },
    });

    const transformedData = CPL.map((cplItem) => {
      const cpmkData = cplItem.CPMK.map((cpmk) => {
        const lulusMKData = cpmk.lulusMK_CPMK.map((lulusMK) => ({
          id: lulusMK.id,
          MKId: lulusMK.MK.kode,
          jumlahLulus: lulusMK.jumlahLulus,
          tahunAjaranId: lulusMK.tahunAjaranId,
        }));

        const lulusCPMKData = cpmk.lulusCPMK.map((lulusCPMK) => ({
          id: lulusCPMK.id,
          jumlahLulus: lulusCPMK.jumlahLulus,
          tahunAjaranId: lulusCPMK.tahunAjaranId,
        }));

        return {
          id: cpmk.id,
          kode: cpmk.kode,
          lulusMK_CPMK: lulusMKData,
          lulusCPMK: lulusCPMKData,
        };
      });

      return {
        id: cplItem.id,
        kode: cplItem.kode,
        CPMK: cpmkData,
      };
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data rangkuman performa!",
      data: transformedData,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 500, message: "Something went wrong!" });
  }
}
