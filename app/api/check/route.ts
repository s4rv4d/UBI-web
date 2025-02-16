import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  try {
    // Forward the request to the external API
    const response = await fetch(
      `https://api.talentprotocol.com/api/v2/passports/${address}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.NEXT_PUBLIC_TP_API_KEY as string,
        },
      }
    );
    const data = await response.json();

    // Add CORS headers to the response
    const hders = new Headers();
    hders.set("Access-Control-Allow-Origin", "*"); // Allow all origins
    hders.set("Content-Type", "application/json");

    return new NextResponse(JSON.stringify(data), { headers: hders });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

/// list of users donated
