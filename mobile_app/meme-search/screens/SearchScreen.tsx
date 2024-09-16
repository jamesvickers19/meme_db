import { useEffect, useState } from "react";
import { View } from "react-native";
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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);

  useEffect(() => {
    const doSearch = async () => {
      const results = await useMemeSearch(searchQuery);
      setSearchResults(results);
    };
    doSearch();
  }, [searchQuery]);

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
        placeholder="Search for memes..."
      />
      <MemeGrid
        memes={searchResults || []}
        onMemePressed={async (meme: Meme) =>
          await MemeCache.addMemeToCache(meme)
        }
      ></MemeGrid>
      <Toast />
    </View>
  );
}
