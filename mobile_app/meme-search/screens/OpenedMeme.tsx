import { AntDesign } from "@expo/vector-icons";
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
import { copyMemeToClipboardAndCache, downloadMeme } from "../CopyMeme";
import { Meme } from "../types";
import { useState } from "react";
import { highQualityImageUri } from "../MemeUtils";
import * as MemeCache from "../MemeCache";
import { ImgFlipMemeTemplateAttribution } from "../components/ImgFlipAttribution";
import * as Colors from "../Colors";
import Share from "react-native-share";
import { showMsg } from "../Utils";

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
  const onShare = async () => {
    const downloadedMemePath = await downloadMeme(meme);
    if (!downloadedMemePath) {
      showMsg("error", `Could not share meme`);
      return;
    }
    await Share.open({
      url: `file://${downloadedMemePath}`,
      type: "image/png",
    });
  };
  return (
    <View style={[styles.openedMemeContainer, { backgroundColor }]}>
      <View style={[styles.controlsContainer, { backgroundColor }]}>
        <TouchableOpacity style={{ marginLeft: 7 }} onPress={() => onClose()}>
          <AntDesign name="leftcircle" size={32} color={color} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...(showDeleteButton ? {} : { opacity: 0, height: 0 }),
            marginRight: 7,
          }}
          onPress={() => onRemove()}
        >
          <AntDesign name="delete" size={32} color="red" />
        </TouchableOpacity>
      </View>
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
      <TouchableOpacity style={{ marginLeft: 7 }} onPress={() => onShare()}>
        <AntDesign name="upload" size={32} color={color} />
      </TouchableOpacity>
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
    marginTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight || 0,
  },
  fullScreenImage: {
    width: "100%",
    height: "90%",
  },
});
