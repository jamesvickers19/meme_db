import { Linking, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Meme } from "../types";

export const ImgFlipGeneralAttribution = () => {
  const handleLinkPress = () => {
    Linking.openURL("https://imgflip.com");
  };
  const color = useColorScheme() === "dark" ? "white" : "black";
  return (
    <View style={styles.imgflipAttributionContainer}>
      <Text style={{ color, fontSize: 16 }}>
        Memes powered by{" "}
        <Text
          style={{
            color: "blue",
            fontSize: 16,
            textDecorationLine: "underline",
          }}
          onPress={handleLinkPress}
        >
          imgflip.com
        </Text>
      </Text>
    </View>
  );
};

export const ImgFlipMemeTemplateAttribution = ({ meme }: { meme: Meme }) => {
  const handleLinkPress = () => {
    Linking.openURL(`https://imgflip.com${meme.href}`);
  };
  return (
    <View style={styles.imgflipAttributionContainer}>
      <Text
        style={{ color: "blue", fontSize: 16, textDecorationLine: "underline" }}
        onPress={handleLinkPress}
      >
        ImgFlip Meme Template
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  imgflipAttributionContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
});
