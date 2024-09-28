export const imgflipV1 = "imgflip_v1" as const;

type MemeVersion = typeof imgflipV1;

export interface Meme {
  memeName: string;
  href: string;
  thumbUri: string;
  version: MemeVersion;
}

export interface CachedMeme extends Meme {
  lastUsedEpochSeconds: number;
}
