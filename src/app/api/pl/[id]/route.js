import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const kode = req.url.split("/pl/")[1];
    const PL = await prisma.PL.findUnique({
      where: {
        kode,
      },
      include: {
        CPL: {
          include: {
            BK: true,
            CPMK: true,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: PL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const kode = req.url.split("/pl/")[1];
    const PL = await prisma.PL.delete({
      where: {
        kode,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: PL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const kode = req.url.split("/pl/")[1];
    const body = await req.json();

    // IF ONLY UPDATE GENERAL INFO
    if (!body?.addedCPLId || !body?.removedCPLId) {
      data = {
        kode: body.kode,
        deskripsi: body.deskripsi,
      };
    }

    // IF THERE IS ADDED CPL
    else if (body?.addedCPLId && !body?.removedCPLId) {
      data = {
        kode: body.kode,
        deskripsi: body.deskripsi,
        CPL: {
          connect: body.addedCPLId.map((cplId) => ({ kode: cplId })),
        },
      };
    }

    // IF THERE IS REMOVED CPL
    else if (!body?.addedCPLId && body?.removedCPLId) {
      data = {
        kode: body.kode,
        deskripsi: body.deskripsi,
        CPL: {
          disconnect: body.removedCPLId.map((cplId) => ({ kode: cplId })),
        },
      };
    }

    // IF TEHRE IS ADDED AND REMOVED CPL
    else if (body?.addedCPLId && body?.removedCPLId) {
      data = {
        kode: body.kode,
        deskripsi: body.deskripsi,
        CPL: {
          disconnect: body.removedCPLId.map((cplId) => ({ kode: cplId })),
          connect: body.addedCPLId.map((cplId) => ({ kode: cplId })),
        },
      };
    }

    const PL = await prisma.PL.update({
      where: {
        kode,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      // data: PL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
