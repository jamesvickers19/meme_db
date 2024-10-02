import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import axios from "axios";
import cheerio from "react-native-cheerio";
import ClearableTextInput from "../ClearableTextInput";
import Toast from "react-native-toast-message";
import { imgflipV1, Meme } from "../types";
import { MemeGrid } from "../components/MemeGrid";
import * as MemeCache from "../MemeCache";
import { copyMemeToClipboardAndCache } from "../CopyMeme";
import { OpenedMemeDisplay } from "./OpenedMeme";

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
        const thumbUri = "https:" + imgElem.attr("src");
        const href = link.attr("href");
        const result = { memeName, href, thumbUri, version: imgflipV1 };
        return result;
      })
      .get() as Meme[];

    return memeDivs;
  } catch (error) {
    console.error("Error searching memes:", error);
    return [];
  }
}

const AppHelpDisplay = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 80 }}>☝️</Text>
      <Text style={styles.noSearchQueryText}>
        Use the search bar to find memes, then long press on them to copy to
        clipboard!
      </Text>
    </View>
  );
};

const RecentlyUsedMemesDisplay = ({
  recentlyUsedMemes,
  onMemePress,
}: {
  recentlyUsedMemes: Meme[];
  onMemePress: (meme: Meme) => void;
}) => {
  return (
    <>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Recently Used</Text>
      </View>
      <MemeGrid
        memes={recentlyUsedMemes}
        onMemeLongPress={async (meme) =>
          await copyMemeToClipboardAndCache(meme)
        }
        onMemePress={onMemePress}
      ></MemeGrid>
    </>
  );
};

const NoSearchResultsDisplay = () => {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 24 }}>No results found</Text>
    </View>
  );
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mainContent, setMainContent] = useState<React.ReactElement>(<View />);
  const [openedMeme, setOpenedMeme] = useState<Meme | null>(null);
  const onMemeGridPress = (meme: Meme) => setOpenedMeme(meme);

  const doSearch = async () => {
    setIsSearching(true);
    const results = await useMemeSearch(searchQuery);
    setIsSearching(false);
    setMainContent(
      <MemeGrid
        memes={results || []}
        noResultsComponent={isSearching ? <View /> : <NoSearchResultsDisplay />}
        onMemePress={onMemeGridPress}
        onMemeLongPress={async (meme) =>
          await copyMemeToClipboardAndCache(meme)
        }
      ></MemeGrid>
    );
  };

  const showRecentlyUsedMemesOrHelpInfo = async () => {
    const recentlyUsedMemes = await MemeCache.getCachedMemes();
    const component =
      recentlyUsedMemes.length === 0 ? (
        <AppHelpDisplay />
      ) : (
        <RecentlyUsedMemesDisplay
          recentlyUsedMemes={recentlyUsedMemes}
          onMemePress={onMemeGridPress}
        />
      );
    setMainContent(component);
  };

  const searchingActive = searchQuery.length > 1;

  useEffect(() => {
    // single letter doesn't make a lot of sense, and on some API's returns nothing.
    if (searchingActive) {
      doSearch();
    } else {
      showRecentlyUsedMemesOrHelpInfo();
    }
  }, [searchQuery]);

  if (openedMeme) {
    return (
      <OpenedMemeDisplay
        meme={openedMeme}
        onClose={() => {
          setOpenedMeme(null);
          if (!searchingActive) {
            // update recently used list if being displayed
            showRecentlyUsedMemesOrHelpInfo();
          }
        }}
        showDeleteButton={!searchingActive}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ClearableTextInput
        text={searchQuery}
        setText={setSearchQuery}
        placeholder="Search for memes"
      />
      {mainContent}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    flex: 1,
  },
  noSearchQueryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSearchQueryText: {
    fontSize: 28,
    fontWeight: "bold",
    margin: 10,
  },
});
