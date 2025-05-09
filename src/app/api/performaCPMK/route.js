import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function GET(req) {
  // Validate token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return NextResponse.json(
      { status: 401, message: tokenValidation.message },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || "";

  if (!prodi) {
    return NextResponse.json(
      { status: 400, message: "Missing prodi parameter" },
      { status: 400 }
    );
  }

  try {
    // Get all MK with their classes and CPMK data
    const MK = await prisma.MK.findMany({
      where: {
        prodiId: prodi
      },
      include: {
        kelas: {
          include: {
            mahasiswa: true,
            tahunAjaran: true,
          },
        },
        CPMK: {
          include: {
            CPL: true,
          },
        },
      },
    });

    // Transform the data to include performance metrics
    const transformedData = MK.map((mk) => ({
      id: mk.id,
      kode: mk.kode,
      kelas: mk.kelas.map((kelas) => ({
        id: kelas.id,
        nama: kelas.nama,
        tahunAjaranId: kelas.tahunAjaranId,
        mahasiswaCount: kelas.mahasiswa.length,
        dataCPMK: (kelas.dataCPMK || []).map((data) => ({
          id: data.id,
          cpmk: data.cpmk,
          cpl: data.cpl,
          nilaiMinimal: data.nilaiMinimal,
          nilaiMasuk: data.nilaiMasuk,
          jumlahLulus: data.jumlahLulus,
          persenLulus: data.persenLulus,
          rataNilai: data.rataNilai,
        })),
      })),
    }));

    return Response.json({
      status: 200,
      message: "Berhasil ambil data performa CPMK!",
      data: transformedData,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { status: 500, message: "Something went wrong!" },
      { status: 500 }
    );
  }
}
