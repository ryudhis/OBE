import prisma from "@/utils/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const data = await req.json();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const account = await prisma.account.create({
      data: {
        email: data.email,
        nama: data.nama,
        role: data.role,
        password: hashedPassword,
        prodi: {
          connect: {
            kode: data.prodiId,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat akun!",
        data: account,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}
