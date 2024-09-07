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

const { width } = Dimensions.get("window");
const numColumns = 3; // Number of columns in the grid
// Calculate item width to make images approximately 1 inch wide
const imageWidth = width / numColumns - 20; // Adjust based on margins

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

const MemeGrid = ({ memes }: { memes: Meme[] }) => {
  const handlePress = (meme: Meme) => {
    console.log("Clicked meme:", meme);
    // TODO copy to clipboard and show notification
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
      numColumns={numColumns}
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
      <ClearableTextInput text={searchQuery} setText={setSearchQuery} />
      <MemeGrid memes={searchResults || []}></MemeGrid>
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
