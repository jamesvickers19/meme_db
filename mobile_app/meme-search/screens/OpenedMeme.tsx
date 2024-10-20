import { AntDesign } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";
import { copyMemeToClipboardAndCache } from "../CopyMeme";
import { Meme } from "../types";
import { useState } from "react";
import { highQualityImageUri } from "../MemeUtils";
import * as MemeCache from "../MemeCache";
import { ImgFlipMemeTemplateAttribution } from "../components/ImgFlipAttribution";

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
  const backgroundColor = colorScheme === "dark" ? "black" : "color";
  const color = colorScheme === "dark" ? "white" : "black";
  const [imageError, setImageError] = useState(false);
  const onRemove = (meme: Meme) => {
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
  return (
    <View style={[styles.openedMemeContainer, { backgroundColor }]}>
      <View style={[styles.controlsContainer, { backgroundColor }]}>
        <TouchableOpacity style={{ marginLeft: 7 }} onPress={() => onClose()}>
          <AntDesign name="leftcircle" size={32} color={color} />
        </TouchableOpacity>
        <Text
          style={{
            color: color,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 24,
          }}
        >
          {meme.memeName}
        </Text>
        <TouchableOpacity
          style={{
            ...(showDeleteButton ? {} : { opacity: 0, height: 0 }),
            marginRight: 7,
          }}
          onPress={() => onRemove(meme)}
        >
          <AntDesign name="delete" size={32} color="red" />
        </TouchableOpacity>
      </View>
      <Text
        style={{
          color: color,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        (long press to copy to cliboard)
      </Text>
      <ImgFlipMemeTemplateAttribution meme={meme} />
      <View style={{ backgroundColor, justifyContent: "center" }}>
        <TouchableOpacity
          onLongPress={async () => await copyMemeToClipboardAndCache(meme)}
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
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 60,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
