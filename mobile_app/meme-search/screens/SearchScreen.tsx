import { useEffect, useState } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import axios from "axios";
import cheerio from "react-native-cheerio";
import ClearableTextInput from "../ClearableTextInput";
import Toast from "react-native-toast-message";
import { imgflipV1, Meme } from "../types";
import { MemeGrid } from "../components/MemeGrid";
import * as MemeCache from "../MemeCache";
import { copyMemeToClipboardAndCache } from "../ShareMeme";
import { OpenedMemeDisplay } from "./OpenedMeme";
import { ImgFlipGeneralAttribution } from "../components/ImgFlipAttribution";
import { AntDesign } from "@expo/vector-icons";
import * as Colors from "../Colors";
import * as RNIap from "react-native-iap";

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
  const color = useColorScheme() === "dark" ? Colors.light : Colors.dark;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 80, color: color }}>☝️</Text>
      <Text style={[styles.noSearchQueryText, { color }]}>
        Use the search bar to find memes, then long press on them to copy to
        clipboard!
      </Text>
    </View>
  );
};

const RecentlyUsedMemesDisplay = ({
  recentlyUsedMemes,
  onMemePress,
  onRemoveAll,
}: {
  recentlyUsedMemes: Meme[];
  onMemePress: (meme: Meme) => void;
  onRemoveAll: () => void;
}) => {
  const color = useColorScheme() === "dark" ? Colors.light : Colors.dark;
  return (
    <>
      <View
        style={{
          marginTop: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          position: "relative",
        }}
      >
        <Text
          style={{
            color: color,
            fontWeight: "bold",
            fontSize: 18,
            textAlign: "center",
          }}
        >
          Recently Used
        </Text>
        <TouchableOpacity
          style={{ position: "absolute", right: 10 }}
          onPress={() => {
            Alert.alert("Confirm", "Remove all memes from recently used?", [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "OK",
                onPress: async () => {
                  await MemeCache.deleteAllCachedMemes();
                  onRemoveAll();
                },
              },
            ]);
          }}
        >
          <AntDesign name="delete" size={24} color="red" />
        </TouchableOpacity>
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
  const color = useColorScheme() === "dark" ? Colors.light : Colors.dark;
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
      }}
    >
      <Text style={{ color: color, fontWeight: "bold", fontSize: 24 }}>
        No results found
      </Text>
    </View>
  );
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mainContent, setMainContent] = useState<React.ReactElement>(<View />);
  const [openedMeme, setOpenedMeme] = useState<Meme | null>(null);
  const onMemeGridPress = (meme: Meme) => setOpenedMeme(meme);
  const colorScheme = useColorScheme();

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
          onRemoveAll={async () => await showRecentlyUsedMemesOrHelpInfo()}
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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorScheme === "dark" ? Colors.dark : Colors.light,
        },
      ]}
    >
      <StatusBar translucent={true}></StatusBar>
      <ClearableTextInput
        text={searchQuery}
        setText={setSearchQuery}
        placeholder="Search for memes"
      />
      <ImgFlipGeneralAttribution />
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
  noSearchQueryText: {
    fontSize: 28,
    fontWeight: "bold",
    margin: 10,
  },
});
