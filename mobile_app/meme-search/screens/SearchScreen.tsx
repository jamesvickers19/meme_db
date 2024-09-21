import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import axios from "axios";
import cheerio from "react-native-cheerio";
import ClearableTextInput from "../ClearableTextInput";
import Toast from "react-native-toast-message";
import { Meme } from "../types";
import { MemeGrid } from "../components/MemeGrid";
import * as MemeCache from "../MemeCache";

async function useMemeSearch(query: string): Promise<Meme[]> {
  try {
    const { data: html } = await axios.get(
      `https://imgflip.com/memesearch?q=${encodeURIComponent(query)}`
    );

    // TODO use full size image?
    // <a> with title has href like: /meme/Hide-the-Pain-Harold
    // Combine with https://imgflip.com to make:
    // https://imgflip.com/meme/Hide-the-Pain-Harold
    // Full image might be at:
    //https://imgflip.com/s{href}.jpg

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
}: {
  recentlyUsedMemes: Meme[];
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
        onMemePressed={async (meme: Meme) => {
          await MemeCache.addMemeToCache(meme); // this updates the last used time in the file
        }}
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

  const doSearch = async () => {
    setIsSearching(true);
    const results = await useMemeSearch(searchQuery);
    setIsSearching(false);
    setMainContent(
      <MemeGrid
        memes={results || []}
        noResultsComponent={isSearching ? <View /> : <NoSearchResultsDisplay />}
        onMemePressed={async (meme: Meme) =>
          await MemeCache.addMemeToCache(meme)
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
        <RecentlyUsedMemesDisplay recentlyUsedMemes={recentlyUsedMemes} />
      );
    setMainContent(component);
  };

  useEffect(() => {
    // single letter doesn't make a lot of sense, and on some API's returns nothing.
    if (searchQuery.length > 1) {
      doSearch();
    } else {
      showRecentlyUsedMemesOrHelpInfo();
    }
  }, [searchQuery]);

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
    backgroundColor: "#fff",
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
