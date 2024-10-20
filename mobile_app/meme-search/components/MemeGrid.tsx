import { Meme } from "../types";
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
  noResultsComponent?: React.ReactElement;
  onMemePress: (meme: Meme) => void;
  onMemeLongPress: (meme: Meme) => void;
};

export function MemeGrid({
  memes,
  noResultsComponent,
  onMemePress,
  onMemeLongPress,
}: MemeGridProps) {
  const renderMeme = ({ item }: { item: Meme }) => {
    return (
      <TouchableOpacity
        onLongPress={() => onMemeLongPress(item)}
        onPress={() => onMemePress?.(item)}
        style={styles.memeGridContainer}
      >
        <Text style={styles.memeTitle}>{item.memeName}</Text>
        <Image source={{ uri: item.thumbUri }} style={styles.image} />
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
      ListEmptyComponent={noResultsComponent}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 10,
  },
  memeGridContainer: {
    flex: 1,
    margin: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "blue",
    backgroundColor: "black",
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
    color: "white",
    marginTop: 5,
    fontSize: 16,
    textAlign: "center",
  },
});
