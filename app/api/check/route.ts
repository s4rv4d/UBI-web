import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  try {
    // Forward the request to the external API
    const response = await fetch(`${address}`);
    const data = await response.json();

    // Add CORS headers to the response
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
    headers.set("Content-Type", "application/json");

    return new NextResponse(JSON.stringify(data), { headers });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
