import { Meme } from "./types";
import { showMsg } from "./Utils";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import { highQualityImageUri } from "./MemeUtils";
import * as MemeCache from "./MemeCache";

export async function copyMemeToClipboardAndCache(meme: Meme) {
  if (await copyMemeToClipboard(meme)) {
    await MemeCache.addMemeToCache(meme);
  }
}

async function copyMemeToClipboard(meme: Meme) {
  // try to get better image quality if possible by going to full source image
  // not always findable, so fall back to thumbUri if needed.
  const possibleUris = [highQualityImageUri(meme), meme.thumbUri];
  for (const imgUri of possibleUris) {
    try {
      const localUri =
        FileSystem.documentDirectory + `meme_search${Date.now()}.jpg`;
      await FileSystem.downloadAsync(imgUri, localUri);
      // Read the file and convert it to Base64
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        const base64 = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Clipboard.setImageAsync(base64);
        await FileSystem.deleteAsync(localUri);
        showMsg("success", `Meme copied to clipboard!`);
        return true;
      }
    } catch (error: any) {}
  }

  showMsg("error", `Could not copy meme to clipboard!`);
  return false;
}
