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
import { copyMemeToClipboardAndCache, downloadMeme } from "../CopyMeme";
import { Meme } from "../types";
import { useState } from "react";
import { highQualityImageUri } from "../MemeUtils";
import * as MemeCache from "../MemeCache";
import { ImgFlipMemeTemplateAttribution } from "../components/ImgFlipAttribution";
import * as Colors from "../Colors";
import { showMsg } from "../Utils";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

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

  const onShare = async () => {
    const downloadedImagePath = await downloadMeme(meme);
    if (!downloadedImagePath) {
      showMsg("error", `Could not share meme`);
      return;
    }
    try {
      if (!(await Sharing.isAvailableAsync())) {
        showMsg("error", "Sharing is not available on this device");
        return;
      } else {
        await Sharing.shareAsync(downloadedImagePath);
      }
    } catch (error: any) {}

    await FileSystem.deleteAsync(downloadedImagePath);
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
      <ImgFlipMemeTemplateAttribution meme={meme} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity style={{ marginLeft: 7 }} onPress={onShare}>
          <AntDesign name="upload" size={32} color={color} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginRight: 7 }} onPress={onCopy}>
          <Feather name="copy" size={32} color={color} />
        </TouchableOpacity>
      </View>
      {/* TODO make this be above the buttons instead; maybe all 3 controls at bottom, then back button still top left; or all controls at bottom */}
      <View style={{ backgroundColor, justifyContent: "center" }}>
        <TouchableOpacity onLongPress={onCopy}>
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
