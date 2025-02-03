import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
  StatusBar,
} from "react-native";
import Toast from "react-native-toast-message";
import { copyMemeToClipboardAndCache, shareMemeAndCache } from "../ShareMeme";
import { Meme } from "../types";
import { useState } from "react";
import { highQualityImageUri } from "../MemeUtils";
import * as MemeCache from "../MemeCache";
import { ImgFlipMemeTemplateAttribution } from "../components/ImgFlipAttribution";
import * as Colors from "../Colors";

export interface OpenedMemeDisplayProps {
  meme: Meme;
  onClose: () => void;
  showDeleteButton: boolean;
}

export const OpenedMemeDisplay = ({
  meme,
  onClose,
  showDeleteButton,
}: OpenedMemeDisplayProps) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? Colors.dark : "color";
  const color = colorScheme === "dark" ? Colors.light : Colors.dark;
  const [imageError, setImageError] = useState(false);
  const onRemove = () => {
    Alert.alert("Confirm", "Remove this meme from recently used?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          await MemeCache.deleteCachedMeme(meme);
          onClose();
        },
      },
    ]);
  };

  const onCopy = async () => await copyMemeToClipboardAndCache(meme);

  const onShare = async () => await shareMemeAndCache(meme);

  return (
    <View style={[styles.openedMemeContainer, { backgroundColor }]}>
      <Text
        style={{
          marginTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight || 0,
          color: color,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 24,
        }}
      >
        {meme.memeName}
      </Text>
      <ImgFlipMemeTemplateAttribution meme={meme} />
      <View
        style={{ backgroundColor, flexShrink: 1, justifyContent: "center" }}
      >
        <Image
          onError={() => setImageError(true)}
          source={{
            // use full size image uri if available
            uri: imageError ? meme.thumbUri : highQualityImageUri(meme),
          }}
          style={styles.fullScreenImage}
          resizeMode="contain"
        />
      </View>
      <View
        style={{
          backgroundColor,
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <TouchableOpacity style={{ marginLeft: 7 }} onPress={() => onClose()}>
          <AntDesign name="leftcircle" size={32} color={color} />
        </TouchableOpacity>
        {showDeleteButton && (
          <TouchableOpacity onPress={() => onRemove()}>
            <AntDesign name="delete" size={32} color="red" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={onShare}>
          <AntDesign name="upload" size={32} color={color} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginRight: 10 }} onPress={onCopy}>
          <Feather name="copy" size={32} color={color} />
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  openedMemeContainer: {
    flex: 1,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
