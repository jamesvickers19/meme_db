import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import cheerio from "react-native-cheerio";
import ClearableTextInput from "./ClearableTextInput";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const memeGridNumColumns = 3;
// Calculate item width to make images approximately 1 inch wide
const imageWidth = width / memeGridNumColumns - 20; // Adjust based on margins

interface Meme {
  memeName: string;
  imgUri: string;
}

async function useMemeSearch(query: string): Promise<Meme[]> {
  try {
    const { data: html } = await axios.get(
      `https://imgflip.com/memesearch?q=${encodeURIComponent(query)}`
    );

    const $ = cheerio.load(html);
    const memeDivs = $("div.mt-img-wrap")
      .map((_index: any, element: any) => {
        const link = $(element).find("a");
        const memeName = link.attr("title");
        const imgElem = $(link).find("img");
        const imgUri = "https:" + imgElem.attr("src");
        const result = { memeName, imgUri };
        return result;
      })
      .get() as Meme[];

    return memeDivs;
  } catch (error) {
    console.error("Error searching memes:", error);
    return [];
  }
}

const showMsg = (type: "success" | "error", msg: string) => {
  Toast.show({
    type,
    text1: msg,
    topOffset: 80,
    text1Style: {
      fontSize: 16,
    },
  });
};

const MemeGrid = ({ memes }: { memes: Meme[] }) => {
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
      //keyExtractor={(item) => item.imgUri} // TODO maybe not a good key
      numColumns={memeGridNumColumns}
      contentContainerStyle={styles.grid}
    />
  );
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);

  // TODO debounce, only run search when user has stopped typing for a second
  useEffect(() => {
    const doSearch = async () => {
      const results = await useMemeSearch(searchQuery);
      setSearchResults(results);
    };
    doSearch();
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <ClearableTextInput
        text={searchQuery}
        setText={setSearchQuery}
        placeholder="Search for memes..."
      />
      <MemeGrid memes={searchResults || []}></MemeGrid>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    justifyContent: "center",
  },
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
  searchBar: {
    alignSelf: "flex-start",
    height: 40,
    width: "95%",
    borderColor: "#CED0CE",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 60,
    marginBottom: 10,
    marginHorizontal: 10,
  },
});
