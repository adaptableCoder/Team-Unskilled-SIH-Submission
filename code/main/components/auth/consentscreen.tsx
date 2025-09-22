import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, useWindowDimensions, Platform } from 'react-native';
import Logo from '../../assets/images/logo.svg';

export default function ConsentScreen({ onConsent }: { onConsent: () => void }) {
	const [checked, setChecked] = useState(false);
	const { width, height } = useWindowDimensions();
	const isSmallScreen = width < 400;

	return (
		<View style={[styles.container, { paddingHorizontal: isSmallScreen ? 8 : 16 }]}> 
			<ScrollView
				contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
				showsVerticalScrollIndicator={false}
			>
				<Logo width={Math.min(120, width * 0.4)} height={Math.min(120, width * 0.4)} style={styles.logo} />
				<View style={[styles.card, {
					width: isSmallScreen ? '98%' : '100%',
					maxWidth: isSmallScreen ? 350 : 400,
					padding: isSmallScreen ? 14 : 20,
				}]}
				>
					<Text style={[styles.heading, { fontSize: isSmallScreen ? 18 : 22 }]}>Terms and Conditions</Text>
					<Text style={[styles.text, { fontSize: isSmallScreen ? 13 : 15 }]}>By using this application, you agree to provide the app with access to the following features and data:
						{'\n'}1. GPS Location: The app may collect and use your real-time location to provide location-based services and improve user experience.
						{'\n'}2. Camera (Photo & Video): The app may access your camera for capturing images and recording videos within the app.
						{'\n'}3. Microphone: The app may use your microphone for voice input, audio recording, or communication features.
						{'\n'}4. System Speaker Access: The app may access your device’s speakers for audio playback, notifications, and communication.
						{'\n'}5. Personal Contacts: The app may access your contacts to enable communication, sharing, and social features.
						{'\n'}By checking the box and clicking "I Agree," you confirm that:
					</Text>
					<Text style={[styles.bullet, { fontSize: isSmallScreen ? 13 : 15 }]}>• You voluntarily consent to share the above information and grant access to your device’s features.</Text>
					<Text style={[styles.bullet, { fontSize: isSmallScreen ? 13 : 15 }]}>• You understand that this information will be used only for providing app services and improving functionality.</Text>
					<Text style={[styles.bullet, { fontSize: isSmallScreen ? 13 : 15 }]}>• You may revoke consent at any time by disabling permissions in your device settings or uninstalling the app.</Text>

					<TouchableOpacity style={styles.checkboxRow} onPress={() => setChecked(!checked)}>
						<View style={[styles.checkbox, checked && styles.checkboxChecked]}>
							{checked && <Text style={styles.checkmark}>✓</Text>}
						</View>
						<Text style={[styles.checkboxLabel, { fontSize: isSmallScreen ? 13 : 15 }]}>I Agree to the Terms and Conditions</Text>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					style={[styles.button, { width: isSmallScreen ? '98%' : 300 }, !checked && { opacity: 0.5 }]}
					disabled={!checked}
					onPress={onConsent}
				>
					<Text style={styles.buttonText}>Continue</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	logo: {
		marginBottom: 16,
		alignSelf: 'center',
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 16,
		marginBottom: 24,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	heading: {
		fontWeight: 'bold',
		marginBottom: 12,
		textAlign: 'left',
	},
	text: {
		color: '#222',
		marginBottom: 10,
	},
	bullet: {
		color: '#222',
		marginLeft: 8,
		marginBottom: 2,
	},
	checkboxRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 16,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: '#1976D2',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
		backgroundColor: '#fff',
	},
	checkboxChecked: {
		backgroundColor: '#1976D2',
		borderColor: '#1976D2',
	},
	checkmark: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
	checkboxLabel: {
		color: '#222',
	},
	button: {
		height: 48,
		backgroundColor: '#6C63FF',
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 8,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 18,
	},
});
