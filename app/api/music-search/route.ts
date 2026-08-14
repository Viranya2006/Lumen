import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        query.trim()
      )}&media=music&entity=song&limit=6`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error(`iTunes API responded with status ${res.status}`);
    }

    const data = await res.json();

    const formattedResults = (data.results || []).map((item: any) => ({
      id: item.trackId,
      trackName: item.trackName,
      artistName: item.artistName,
      collectionName: item.collectionName,
      // Upgrade artwork to 600x600 high-res
      artworkUrl: item.artworkUrl100
        ? item.artworkUrl100.replace("100x100bb", "600x600bb")
        : item.artworkUrl100,
      previewUrl: item.previewUrl,
      genre: item.primaryGenreName,
    }));

    return NextResponse.json({ results: formattedResults });
  } catch (error: any) {
    console.error("Music search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch music tracks" },
      { status: 500 }
    );
  }
}
