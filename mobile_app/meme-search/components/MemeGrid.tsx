import { Meme } from "../types";
import { showMsg } from "../Utils";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { hashMeme } from "../MemeUtils";

const { width } = Dimensions.get("window");
const memeGridNumColumns = 3;
// Calculate item width to make images approximately 1 inch wide
const imageWidth = width / memeGridNumColumns - 20; // Adjust based on margins

export type MemeGridProps = {
  memes: Meme[];
  onMemePressed?: (meme: Meme) => void;
};

export function MemeGrid({ memes, onMemePressed }: MemeGridProps) {
  const handlePress = async (meme: Meme) => {
    // TODO use full size image?
    // <a> with title has href like: /meme/Hide-the-Pain-Harold
    // Combine with https://imgflip.com to make:
    // https://imgflip.com/meme/Hide-the-Pain-Harold
    // Full image might be at:
    //https://imgflip.com/s{href}.jpg

    const showError = () =>
      showMsg("error", `Could not copy meme to clipboard!`);

    try {
      const localUri =
        FileSystem.documentDirectory + `meme_search${Date.now()}.jpg`;
      await FileSystem.downloadAsync(meme.imgUri, localUri);

      // Read the file and convert it to Base64
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        const base64 = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Clipboard.setImageAsync(base64);
        await FileSystem.deleteAsync(localUri);
        showMsg("success", `Meme copied to clipboard!`);
        onMemePressed?.(meme);
      } else {
        showError();
      }
    } catch (error: any) {
      showError();
      console.log("Error: ", error.message);
    }
  };

  const renderMeme = ({ item }: { item: Meme }) => {
    return (
      <TouchableOpacity
        onLongPress={() => handlePress(item)}
        style={styles.memeGridContainer}
      >
        <Text style={styles.memeTitle}>{item.memeName}</Text>
        <Image source={{ uri: item.imgUri }} style={styles.image} />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={memes}
      renderItem={renderMeme}
      keyExtractor={hashMeme}
      numColumns={memeGridNumColumns}
      contentContainerStyle={styles.grid}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 10,
  },
  memeGridContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 3, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: imageWidth, // Set the image width to approximately 1 inch
    height: imageWidth, // Make the image square
    borderRadius: 5,
  },
  memeTitle: {
    marginTop: 5,
    fontSize: 16,
    textAlign: "center",
  },
});