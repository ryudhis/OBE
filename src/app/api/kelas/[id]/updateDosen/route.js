import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function PATCH(req, { params }) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const id = params.id; // Get the kelas ID from the route parameters
    if (!id) {
      throw new Error("Kelas ID is missing");
    }

    const data = await req.json();
    const { dosen: incomingDosenIds } = data; 

    // Fetch current kelas data including dosen connections
    const kelas = await prisma.kelas.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        dosen: true, // Include all associated dosen
      },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    // Extract current dosen IDs from the fetched kelas data
    const currentDosenIds = kelas.dosen.map((dosen) => dosen.id);

    // Identify dosen IDs to add (connect) and remove (disconnect)
    const dosenIdsToAdd = incomingDosenIds.filter((dosenId) => !currentDosenIds.includes(dosenId));
    const dosenIdsToRemove = currentDosenIds.filter((dosenId) => !incomingDosenIds.includes(dosenId));

    // Update the kelas with the new dosen connections
    const updateDosenConnections = {
      connect: dosenIdsToAdd.map((dosenId) => ({ id: dosenId })),
      disconnect: dosenIdsToRemove.map((dosenId) => ({ id: dosenId })),
    };

    const updatedKelas = await prisma.kelas.update({
      where: {
        id: parseInt(id),
      },
      data: {
        dosen: updateDosenConnections,
      },
      include: {
        dosen: true, // Include the updated dosen connections in the response
      },
    });

    return new Response(JSON.stringify({
      status: 200,
      message: "Berhasil ubah data!",
      data: updatedKelas,
    }), { status: 200 });
  } catch (error) {
    console.error(error); // Improved logging for errors
    return new Response(JSON.stringify({ status: 400, message: "Something went wrong!" }), { status: 400 });
  }
}
