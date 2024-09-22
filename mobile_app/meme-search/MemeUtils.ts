import { Meme } from "./types";

const hashCode = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char; // hash * 31 + char
    hash |= 0; // Convert to 32-bit integer
  }
  // Convert negative hash values to positive by using unsigned right shift (>>> 0)
  return hash >>> 0;
};

export function hashMeme(meme: Meme): string {
  return (hashCode(meme.thumbUri) + hashCode(meme.href)).toString();
}
