import { View } from "react-native";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { CachedMeme, Meme } from "../types";
import { MemeGrid } from "../components/MemeGrid";
import Toast from "react-native-toast-message";
import * as MemeCache from "../MemeCache";
import ClearableTextInput from "../ClearableTextInput";

export default function FavoritesScreen() {
  const [recentlyUsedMemes, setRecentlyUsedMemes] = useState<CachedMeme[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecentlyUsedMemes, setFilteredRecentlyUsedMemes] = useState<
    CachedMeme[]
  >([]);

  useEffect(() => {
    const doSearch = async () => {
      setFilteredRecentlyUsedMemes(
        searchQuery
          ? recentlyUsedMemes.filter((m) =>
              m.memeName.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : recentlyUsedMemes
      );
    };
    doSearch();
  }, [recentlyUsedMemes, searchQuery]);

  const loadRecentlyUsedMemes = async () => {
    setRecentlyUsedMemes(await MemeCache.getCachedMemes());
  };
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadRecentlyUsedMemes();
    }
  }, [isFocused]);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        justifyContent: "center",
      }}
    >
      <ClearableTextInput
        text={searchQuery}
        setText={setSearchQuery}
        placeholder="Search in recently used memes..."
      />
      <MemeGrid
        memes={filteredRecentlyUsedMemes}
        noResultsText="No recently used memes here...yet :) Go to the search tab and use some to see them here!"
        onMemePressed={async (meme: Meme) => {
          await MemeCache.addMemeToCache(meme); // this updates the last used time in the file
        }}
      ></MemeGrid>
      <Toast />
    </View>
  );
}
