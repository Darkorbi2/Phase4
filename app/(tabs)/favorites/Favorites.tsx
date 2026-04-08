import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STORAGE_KEY = 'favorites_storage';

type Song = {
	id: string;
	title: string;
	artist: string;
	duration: string;
	accent: string;
};

export default function Favorites() {
	const [favorites, setFavorites] = useState<Song[]>([]);

	useEffect(() => {
		loadFavorites();
	}, []);

	const loadFavorites = async () => {
		try {
			const saved = await AsyncStorage.getItem(STORAGE_KEY);
			if (saved) setFavorites(JSON.parse(saved));
		} catch (err) {
			console.log('Error loading favorites', err);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* HEADER */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.iconButton}>
					<Ionicons name='chevron-back' size={18} color='#fff' />
				</TouchableOpacity>

				<Text style={styles.headerTitle}>FAVORITES</Text>

				<TouchableOpacity style={styles.iconButton}>
					<Ionicons name='ellipsis-horizontal' size={18} color='#fff' />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{favorites.length === 0 ? (
					<Text style={styles.emptyText}>No favorite songs yet.</Text>
				) : (
					favorites.map((song) => (
						<View key={song.id} style={styles.songCard}>
							<View style={[styles.accentBar, { backgroundColor: song.accent }]} />

							<View style={{ flex: 1 }}>
								<Text style={styles.songTitle}>{song.title}</Text>
								<Text style={styles.songMeta}>{song.artist}</Text>
							</View>

							<Text style={styles.duration}>{song.duration}</Text>
						</View>
					))
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#07111B',
		paddingHorizontal: 16,
		paddingTop: 18
	},

	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 18
	},

	iconButton: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: '#0B1622',
		alignItems: 'center',
		justifyContent: 'center'
	},

	headerTitle: {
		color: '#fff',
		fontWeight: '700',
		letterSpacing: 1,
		fontSize: 12
	},

	emptyText: {
		color: '#7D8A97',
		marginTop: 20,
		textAlign: 'center'
	},

	songCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#0C1824',
		padding: 12,
		borderRadius: 12,
		marginBottom: 10
	},

	accentBar: {
		width: 10,
		height: 40,
		borderRadius: 4,
		marginRight: 12
	},

	songTitle: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 14
	},

	songMeta: {
		color: '#7D8A97',
		fontSize: 12,
		marginTop: 2
	},

	duration: {
		color: '#8FA0B2',
		fontSize: 12
	}
});
