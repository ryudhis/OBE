import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function GET(req) {
  const tokenValidation = validateToken(req);

  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401 }
    );
  }

  // Check if the decoded role is not "Super Admin"
  const userRole = tokenValidation.decoded.role;
  if (userRole !== "Super Admin") {
    return new Response(
      JSON.stringify({
        status: 403,
        message: "Access forbidden: insufficient permissions.",
      }),
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1; // Default to page 1
  const limit = parseInt(searchParams.get("limit")) || 10; // Default to 10 items per page
  const search = searchParams.get("search") || ""; // Default to empty string

  try {
    // Calculate total items
    const totalItems = await prisma.account.count({
      where: {
        nama: {
          contains: search,
        },
      },
    });

    // Calculate total pages
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // Ensure the page number is within the valid range
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const account = await prisma.account.findMany({
      where: {
        nama: {
          contains: search,
        },
      },
      take: limit,
      skip: (currentPage - 1) * limit,
      include: {
        prodi: {
          select: {
            nama: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: account,
        meta: {
          currentPage,
          totalPages,
          totalItems,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500 }
    );
  }
}
