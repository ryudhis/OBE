import bcrypt from "bcrypt";

export async function PATCH(req) {
  try {
    const data = await req.json();

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    const updatedAccount = await prisma.account.update({
      where: {
        id: parseInt(id),
      },
      data: {
        password: hashedPassword,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Account data successfully updated!",
        data: updatedAccount,
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
