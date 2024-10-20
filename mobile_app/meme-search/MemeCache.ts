import { hashMeme } from "./MemeUtils";
import { CachedMeme, Meme } from "./types";
import * as FileSystem from "expo-file-system";

async function getCacheFolder() {
  const folder = FileSystem.documentDirectory + "cached_memes/";
  if (!(await FileSystem.getInfoAsync(folder)).exists) {
    await FileSystem.makeDirectoryAsync(folder);
  }
  return folder;
}

async function getCacheFilename(filename: string) {
  return (await getCacheFolder()) + filename;
}

async function getCachedMemeFilename(meme: Meme) {
  return await getCacheFilename(hashMeme(meme) + ".json");
}

async function getCachedMemeFilenames() {
  return await FileSystem.readDirectoryAsync(await getCacheFolder());
}

export async function deleteCachedMeme(meme: Meme) {
  try {
    await FileSystem.deleteAsync(await getCachedMemeFilename(meme));
  } catch (error) {}
}

export async function deleteAllCachedMemes() {
  try {
    await FileSystem.deleteAsync(await getCacheFolder());
  } catch (error) {}
}

async function evictOldCacheEntries() {
  const cachedMemeFiles = await getCachedMemeFilenames();
  const cacheSize = 100;
  if (cachedMemeFiles.length >= cacheSize) {
    const cachedMemes = await getCachedMemes();
    cachedMemes
      .slice(cacheSize - 1)
      .map(async (m) => await deleteCachedMeme(m));
  }
}

export async function addMemeToCache(meme: Meme) {
  const filename = await getCachedMemeFilename(meme);
  // expo file system doesn't allow overwriting an existing file
  if ((await FileSystem.getInfoAsync(filename)).exists) {
    await FileSystem.deleteAsync(filename);
  } else {
    // only need to manage cache if not adding a new file
    await evictOldCacheEntries();
  }
  const contents: CachedMeme = {
    ...meme,
    lastUsedEpochSeconds: Date.now() / 1000,
  };
  await FileSystem.writeAsStringAsync(filename, JSON.stringify(contents));
}

export async function getCachedMemes() {
  const cachedMemeFiles = await getCachedMemeFilenames();
  const cachedMemes = await Promise.all(
    cachedMemeFiles.map(async (filename) => {
      const contents = await FileSystem.readAsStringAsync(
        await getCacheFilename(filename)
      );
      return JSON.parse(contents) as CachedMeme;
    })
  );
  // sort by last used time, descending.
  cachedMemes.sort((a, b) => b.lastUsedEpochSeconds - a.lastUsedEpochSeconds);
  return cachedMemes;
}
