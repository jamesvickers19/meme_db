import { Meme } from "./types";
import { showMsg } from "./Utils";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import { highQualityImageUri } from "./MemeUtils";
import * as MemeCache from "./MemeCache";
import * as Sharing from "expo-sharing";

export async function copyMemeToClipboardAndCache(meme: Meme) {
  if (await copyMemeToClipboard(meme)) {
    await MemeCache.addMemeToCache(meme);
  }
}

export async function shareMemeAndCache(meme: Meme) {
  const downloadedImagePath = await downloadMeme(meme);
  if (!downloadedImagePath) {
    showMsg("error", `Could not share meme`);
    return;
  }
  try {
    if (!(await Sharing.isAvailableAsync())) {
      showMsg("error", "Sharing is not available on this device");
      return;
    } else {
      await Sharing.shareAsync(downloadedImagePath);
      await MemeCache.addMemeToCache(meme);
    }
  } catch (error: any) {}

  await FileSystem.deleteAsync(downloadedImagePath);
}

export async function downloadMeme(meme: Meme) {
  // try to get better image quality if possible by going to full source image
  // not always findable, so fall back to thumbUri if needed.
  const possibleUris = [highQualityImageUri(meme), meme.thumbUri];
  for (const imgUri of possibleUris) {
    try {
      const localUri =
        FileSystem.documentDirectory + `meme_search${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(imgUri, localUri);
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        if (downloadResult.status === 200) {
          return localUri;
        } else {
          // file download was from a bad status code like a 404, don't return and try to delete the file.
          try {
            await FileSystem.deleteAsync(localUri);
          } catch (error: any) {}
        }
      }
    } catch (error: any) {}
  }

  return null;
}

async function copyMemeToClipboard(meme: Meme) {
  const downloadedImgPath = await downloadMeme(meme);
  if (downloadedImgPath) {
    try {
      const base64 = await FileSystem.readAsStringAsync(downloadedImgPath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Clipboard.setImageAsync(base64);
      showMsg("success", `Meme copied to clipboard!`);
      return true;
    } catch (error: any) {
    } finally {
      await FileSystem.deleteAsync(downloadedImgPath);
    }
  }

  showMsg("error", `Could not copy meme to clipboard!`);
  return false;
}
