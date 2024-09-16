export interface Meme {
  memeName: string;
  imgUri: string;
}

export interface CachedMeme extends Meme {
  lastUsedEpochSeconds: number;
}
