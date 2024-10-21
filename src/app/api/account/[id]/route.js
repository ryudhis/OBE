import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Import the token validation function

export async function GET(req) {
  const tokenValidation = validateToken(req);
  
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  try {
    const id = req.url.split("/account/")[1]; // Extract the id from the URL
    const account = await prisma.account.findUnique({
      where: {
        id: parseInt(id), // Ensure id is an integer
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: account,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  const tokenValidation = validateToken(req);
  
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  try {
    const id = req.url.split("/account/")[1]; // Extract the id from the URL
    const account = await prisma.account.delete({
      where: {
        id: parseInt(id), // Ensure id is an integer
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: account,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  const tokenValidation = validateToken(req);
  
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  try {
    const id = req.url.split("/account/")[1]; // Extract the id from the URL
    const data = await req.json();

    const account = await prisma.account.update({
      where: {
        id: parseInt(id), // Ensure id is an integer
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: account,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
