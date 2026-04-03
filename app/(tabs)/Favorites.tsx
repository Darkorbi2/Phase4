import { Song } from "@/components/useSongs";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const [favoriteSongs, setSongs] = useState<Song[]>([]);

export default function Favorites() {
  return <View></View>;
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
});
