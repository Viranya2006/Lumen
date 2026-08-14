/**
 * Music Metadata & Audio Encoding Helpers
 */

export interface MusicTrackResult {
  id: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl: string;
  previewUrl: string;
  genre: string;
}

/**
 * Embeds an optional audio stream preview URL into metadataURI using hash parameters
 */
export function encodeMetadataURI(imageUrl: string, audioUrl?: string): string {
  const cleanImage = imageUrl.trim();
  if (!audioUrl || !audioUrl.trim()) {
    return cleanImage;
  }
  // Append #audio=... to metadataURI
  return `${cleanImage}#audio=${encodeURIComponent(audioUrl.trim())}`;
}

/**
 * Parses metadataURI into image URL and audio preview URL
 */
export function parseMetadataURI(metadataURI?: string): {
  imageUrl: string;
  audioUrl?: string;
} {
  if (!metadataURI) return { imageUrl: "" };

  const hashIndex = metadataURI.indexOf("#audio=");
  if (hashIndex === -1) {
    return { imageUrl: metadataURI };
  }

  const imageUrl = metadataURI.substring(0, hashIndex);
  const rawAudio = metadataURI.substring(hashIndex + 7);

  try {
    const audioUrl = decodeURIComponent(rawAudio);
    return { imageUrl, audioUrl };
  } catch {
    return { imageUrl, audioUrl: rawAudio };
  }
}
