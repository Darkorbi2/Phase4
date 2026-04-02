import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type AppColors = typeof Colors.dark;

export default function StatRow({
	icon,
	iconColor,
	label,
	value,
	sub,
	c,
	isLast = false
}: {
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	label: string;
	value: string;
	sub: string;
	c: AppColors;
	isLast?: boolean;
}) {
	return (
		<View style={[styles.statRow, isLast && { marginBottom: 0 }]}>
			<View style={[styles.statIconWrap, { backgroundColor: iconColor + '22' }]}>
				<Ionicons name={icon} size={18} color={iconColor} />
			</View>
			<View style={styles.statText}>
				<Text style={[styles.statLabel, { color: c.muted }]}>{label}</Text>
				<Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
				<Text style={[styles.statSub, { color: c.muted }]}>{sub}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	statRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingVertical: 12
	},
	statDivider: {
		height: 1
	},
	statIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
		marginTop: 2
	},
	statText: {
		flex: 1
	},
	statLabel: {
		fontSize: 11,
		fontWeight: '600',
		letterSpacing: 0.6,
		marginBottom: 2
	},
	statValue: {
		fontSize: 15,
		fontWeight: '600'
	},
	statSub: {
		fontSize: 12,
		marginTop: 1
	}
});
