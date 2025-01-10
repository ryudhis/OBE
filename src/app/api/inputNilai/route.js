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
  const page = parseInt(searchParams.get("page")) || 1; // Default to page 1
  const limit = parseInt(searchParams.get("limit")) || 10; // Default to 10 items per page
  const MK = searchParams.get("MK") === "default" ? "" : searchParams.get("MK");

  // Validate prodi parameter
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const where = {
      prodiId: prodi,
      ...(MK && {
        penilaianCPMK: { MKkode: MK }, // Apply filter on related `kelas.MKId`
      }),
    };

    // Calculate total items
    const totalItems = await prisma.inputNilai.count({
      where,
    });

    // Calculate total pages
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // Ensure the page number is within the valid range
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    // Fetch paginated data
    const inputNilai = await prisma.inputNilai.findMany({
      where,
      orderBy: [{ penilaianCPMKId: "asc" }, { mahasiswaNim: "asc" }],
      include: { penilaianCPMK: true, mahasiswa: true },
      take: limit,
      skip: (currentPage - 1) * limit,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: inputNilai,
        meta: {
          currentPage,
          totalPages,
          totalItems,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GET inputNilai Error: ", error); // More informative logging
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

    const inputNilaiData = data.map((mahasiswa) => ({
      penilaianCPMKId: parseInt(mahasiswa.PCPMKId),
      mahasiswaNim: mahasiswa.MahasiswaId,
      kelasId: mahasiswa.kelasId,
      nilai: mahasiswa.nilai,
      prodiId: mahasiswa.prodiId,
    }));

    // Use createMany to insert all entries at once
    const inputNilai = await prisma.inputNilai.createMany({
      data: inputNilaiData,
      skipDuplicates: true,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: inputNilai,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("POST inputNilai Error: ", error); // More informative logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
