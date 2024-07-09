import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const body = await req.json();

    // Iterate over each entry in the payload
    for (const entry of body) {
      const { cplId, cpmkIds } = entry;

      // Fetch the existing relationships for the current CPL
      const prevCPL = await prisma.CPL.findUnique({
        where: {
          id: parseInt(cplId),
        },
        include: {
          CPMK: true,
        },
      });

      // Get existing CPMK ids
      const existingCPMKIds = prevCPL.CPMK.map((cpmk) => cpmk.id);

      // Determine which CPMKs to disconnect, connect, or ignore
      const cpmkIdsToDisconnect = existingCPMKIds.filter(
        (id) => !cpmkIds.includes(id)
      );
      const cpmkIdsToConnect = cpmkIds.filter(
        (id) => !existingCPMKIds.includes(id)
      );

      // Perform the update
      await prisma.CPL.update({
        where: {
          id: parseInt(cplId),
        },
        data: {
          CPMK: {
            disconnect: cpmkIdsToDisconnect.map((cpmkId) => ({
              id: cpmkId,
            })),
            connect: cpmkIdsToConnect.map((cpmkId) => ({
              id: cpmkId,
            })),
          },
        },
      });
    }

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ubah data!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Gagal ubah data!" }),
      { status: 400 }
    );
  }
}
