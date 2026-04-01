import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function GetSongs() {
  type Song = {
    id: string;
    filename: string;
    uri: string;
    duration?: number;
    title?: string;
    artist?: string;
    album?: string;
    artwork?: string | null;
  };
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [mediaAssets, setMediaAssets] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("checking...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      setError(null);
      console.log("Starting permission request...");

      const available = await MediaLibrary.isAvailableAsync();
      console.log("Media library available:", available);

      if (!available) {
        setHasPermission(false);
        setPermissionStatus("unavailable");
        setError("Media library is not available on this device.");
        return;
      }

      const existing = await MediaLibrary.getPermissionsAsync();
      console.log("Existing permission:", existing);

      if (existing.status === "granted") {
        setHasPermission(true);
        setPermissionStatus(existing.status);
        return;
      }

      let result;

      if (Platform.OS === "android") {
        result = await MediaLibrary.requestPermissionsAsync(false, ["audio"]);
      } else {
        result = await MediaLibrary.requestPermissionsAsync();
      }

      console.log("Permission result:", result);

      setPermissionStatus(result.status);
      setHasPermission(result.status === "granted");

      if (result.status !== "granted") {
        setError("Permission was denied.");
      }
    } catch (err: any) {
      console.error("Permission request failed:", err);
      setHasPermission(false);
      setPermissionStatus("error");
      setError(err?.message ?? "Unknown error requesting permissions");
    }
  };

  const getAllMedia = async () => {
    if (!hasPermission) return;

    try {
      setLoading(true);
      setError(null);

      let allAssets: MediaLibrary.Asset[] = [];
      let after: string | undefined = undefined;
      let hasNextPage = true;

      while (hasNextPage) {
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: ["audio"],
          first: 100,
          after,
          sortBy: [["creationTime", false]],
        });

        allAssets = allAssets.concat(media.assets);
        after = media.endCursor;
        hasNextPage = media.hasNextPage;
      }

      const songs: Song[] = allAssets.map((asset) => ({
        id: asset.id,
        filename: asset.filename,
        uri: asset.uri,
        duration: asset.duration,
        title: asset.filename.replace(/\.[^/.]+$/, ""), // temporary fallback
        artist: "Unknown Artist",
        album: "Unknown Album",
        artwork: null,
      }));

      setMediaAssets(songs);
    } catch (err: any) {
      console.error("Failed to load songs:", err);
      setError(err?.message ?? "Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Checking permissions...</Text>
        <Text style={styles.debug}>Status: {permissionStatus}</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>No access to media library</Text>
        <Text style={styles.debug}>Status: {permissionStatus}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Try Again" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        title={loading ? "Loading..." : "Load All Songs"}
        onPress={getAllMedia}
        disabled={loading}
      />

      <FlatList
        data={mediaAssets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 20 }}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              marginBottom: 10,
              backgroundColor: "#f3f3f3",
              borderRadius: 12,
            }}
          >
            <Image
              source={
                item.artwork
                  ? { uri: item.artwork }
                  : require("@/assets/images/react-logo.png")
              }
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                marginRight: 12,
              }}
            />

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {item.title ?? item.filename}
              </Text>
              <Text style={{ fontSize: 13, color: "#666" }}>
                {item.artist ?? "Unknown Artist"}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  songCard: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "#f3f3f3",
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  songInfo: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  debug: {
    marginTop: 10,
    fontSize: 12,
    color: "#666",
  },
  error: {
    marginTop: 10,
    color: "red",
    textAlign: "center",
  },
});
