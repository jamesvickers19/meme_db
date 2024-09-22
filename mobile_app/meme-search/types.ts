export interface Meme {
  memeName: string;
  href: string;
  thumbUri: string;
}

export interface CachedMeme extends Meme {
  lastUsedEpochSeconds: number;
}
