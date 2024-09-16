import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { CachedMeme, Meme } from "../types";
import { MemeGrid } from "../components/MemeGrid";
import Toast from "react-native-toast-message";
import * as MemeCache from "../MemeCache";

export default function FavoritesScreen() {
  const [recentlyUsedMemes, setRecentlyUsedMemes] = useState<CachedMeme[]>([]);

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
    <View style={styles.container}>
      <MemeGrid
        memes={recentlyUsedMemes || []}
        onMemePressed={async (meme: Meme) => {
          await MemeCache.addMemeToCache(meme); // this updates the last used time in the file
        }}
      ></MemeGrid>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingTop: 50,
  },
});
