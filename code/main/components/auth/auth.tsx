
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Logo from '@/assets/images/logo.svg';
import ConsentScreen from './consentscreen';

const CONSENT_KEY = 'consent_accepted';
const API_URL = 'https://yatra-backend-cb67.onrender.com';

// Short unique id generator: timestamp + 6 chars base36 random
function generateShortId() {
	const ts = Date.now().toString(36);
	const rnd = Math.random().toString(36).slice(2, 8);
	return `${ts}${rnd}`;
}

export default function AuthScreen({ onLoginSuccess }: { onLoginSuccess?: () => void } = {}) {
	const [isLogin, setIsLogin] = useState(true);
	const [showConsent, setShowConsent] = useState(false);
	const [form, setForm] = useState({
		username: '',
		password: '',
		firstName: '',
		lastName: '',
		email: '',
		contact: '',
	});
	const [loading, setLoading] = useState(false);

	// On mount, check if consent is already accepted
		useEffect(() => {
			(async () => {
				const consent = await AsyncStorage.getItem(CONSENT_KEY);
				if (consent === 'true') {
					setShowConsent(false);
				} else {
					setShowConsent(true);
				}
			})();
		}, []);

	const handleChange = (key: keyof typeof form, value: string) => {
		setForm({ ...form, [key]: value });
	};



	const handleLogin = async () => {
		setLoading(true);
		try {
			const formBody = `username=${encodeURIComponent(form.username.trim())}&password=${encodeURIComponent(form.password.trim())}`;
			const res = await fetch(`${API_URL}/auth/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: formBody,
			});
			const data = await res.json();
			if (res.ok && data.access_token) {
				await AsyncStorage.setItem('jwt', data.access_token);
				// Fetch user profile immediately and store firstName locally
				try {
					const profileRes = await fetch(`${API_URL}/auth/auth/profile`, {
						method: 'GET',
						headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.access_token}` },
					});
					if (profileRes.ok) {
						const profile = await profileRes.json();
						if (profile?.firstName) {
							await AsyncStorage.setItem('firstName', profile.firstName);
							// Log saved name and verify by reading it back
							console.log('Saved firstName to AsyncStorage:', profile.firstName);
							try {
								const verify = await AsyncStorage.getItem('firstName');
								console.log('Verified firstName from AsyncStorage:', verify);
							} catch (e) {
								console.warn('Failed to verify firstName from AsyncStorage', e);
							}
						}
					}
				} catch (err) {
					console.warn('Profile fetch failed (non-fatal):', err);
					// Fallback: try to decode firstName from JWT payload if available
					try {
						const token = data.access_token;
						if (token) {
							const parts = token.split('.')
							if (parts.length === 3) {
								const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
								let payloadStr: string | null = null;
								if (typeof (global as any).atob === 'function') {
									payloadStr = (global as any).atob(payloadB64);
								} else if (typeof Buffer !== 'undefined') {
									payloadStr = Buffer.from(payloadB64, 'base64').toString('utf8');
								}
								if (payloadStr) {
									try {
										const payload = JSON.parse(payloadStr);
										const nameFromToken = payload?.firstName || payload?.given_name || payload?.name || payload?.preferred_username;
										if (nameFromToken) {
											await AsyncStorage.setItem('firstName', String(nameFromToken));
											console.log('Saved firstName from token payload (fallback):', nameFromToken);
										}
									} catch (e) {
										console.warn('Failed to parse token payload', e);
									}
								}
							}
						}
					} catch (e) {
						console.warn('JWT fallback failed', e);
					}
				}
				// Ensure we have a display name saved for the home screen.
				try {
					const existing = await AsyncStorage.getItem('firstName');
					if (!existing) {
						// Prefer per-user stored profile first
						const profileStr = await AsyncStorage.getItem(`user_profile:${form.username}`);
						let fallbackName: string | null = null;
						if (profileStr) {
							try {
								const up = JSON.parse(profileStr);
								fallbackName = up?.firstName || up?.username || null;
							} catch (e) {
								// ignore
							}
						}
						if (!fallbackName) fallbackName = form.firstName || form.username || null;
						if (fallbackName) {
							await AsyncStorage.setItem('firstName', fallbackName);
							console.log('Saved fallback firstName after login:', fallbackName);
						}
					}
					// Mark this username as current active user
					try {
						await AsyncStorage.setItem('current_user', form.username);
					} catch (e) {
						// ignore
					}
				} catch (e) {
					console.warn('Failed to ensure fallback firstName', e);
				}
				if (onLoginSuccess) {
					onLoginSuccess();
				} else {
					Alert.alert('Login successful');
				}
			} else {
				Alert.alert('Login failed', data.detail || 'Invalid credentials');
			}


		} catch (e) {
			Alert.alert('Login failed', 'Network error');
		}
		setLoading(false);
	};



	const handleRegister = async () => {
		setLoading(true);
		try {
			const clientId = generateShortId();
			const res = await fetch(`${API_URL}/auth/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: form.username.trim(),
					password: form.password.trim(),
					firstName: form.firstName.trim(),
					lastName: form.lastName.trim(),
					email: form.email.trim(),
					contact: form.contact.trim(),
					clientId,
				}),
			});
			const data = await res.json();
			if (res.ok) {
				// Show consent screen after registration
				setShowConsent(true);
				// Save full user details locally (so Home can show name even if backend/profile is unavailable)
				const userProfile = {
					clientId,
					username: form.username,
					firstName: form.firstName,
					lastName: form.lastName,
					email: form.email,
					contact: form.contact,
					registeredAt: new Date().toISOString(),
					backendResponse: data,
				};
				try {
					// Save under a per-user key so multiple users don't overwrite each other
					await AsyncStorage.setItem(`user_profile:${form.username}`, JSON.stringify(userProfile));
					// Keep firstName for compatibility with existing code
					if (form.firstName) {
						await AsyncStorage.setItem('firstName', form.firstName);
					}
					console.log('Saved user_profile after registration:', userProfile);
				} catch (e) {
					console.warn('Failed to save user_profile after registration', e);
				}
			} else {
				Alert.alert('Registration failed', data.message || 'Error');
			}
		} catch (e) {
			Alert.alert('Registration failed', 'Network error');
		}
		setLoading(false);
	};

	if (!isLogin) {
		if (showConsent) {
			return <ConsentScreen onConsent={async () => {
				await AsyncStorage.setItem(CONSENT_KEY, 'true');
				setShowConsent(false);
				setIsLogin(true); // After consent, go to login
			}} />;
		}
		return (
			<View style={styles.container}>
				<Logo width={200} height={200} style={styles.logo} />
				<Text style={styles.title}>Let{"'"}s Get Started!</Text>
				<Text style={styles.subtitle}>Create an Account on YATRA</Text>
				<TextInput style={[styles.input, loading && styles.inputDisabled]} placeholder="Username" placeholderTextColor="#222" value={form.username} onChangeText={t => handleChange('username', t)} editable={!loading} />
				<TextInput style={[styles.input, loading && styles.inputDisabled]} placeholder="First Name" placeholderTextColor="#222" value={form.firstName} onChangeText={t => handleChange('firstName', t)} editable={!loading} />
				<TextInput style={[styles.input, loading && styles.inputDisabled]} placeholder="Last Name" placeholderTextColor="#222" value={form.lastName} onChangeText={t => handleChange('lastName', t)} editable={!loading} />
				<TextInput style={[styles.input, loading && styles.inputDisabled]} placeholder="Email" placeholderTextColor="#222" value={form.email} onChangeText={t => handleChange('email', t)} editable={!loading} />
				<TextInput style={[styles.input, loading && styles.inputDisabled]} placeholder="Contact number" placeholderTextColor="#222" value={form.contact} onChangeText={t => handleChange('contact', t)} editable={!loading} />
				<TextInput style={[styles.input, loading && styles.inputDisabled]} placeholder="Password" placeholderTextColor="#222" value={form.password} onChangeText={t => handleChange('password', t)} secureTextEntry editable={!loading} />
				<TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="small" color="#fff" style={styles.loadingSpinner} />
							<Text style={styles.buttonText}>Creating Account ......</Text>
						</View>
					) : (
						<Text style={styles.buttonText}>Create</Text>
					)}
				</TouchableOpacity>
				<Text style={styles.bottomText}>Already have an account? <Text style={styles.link} onPress={() => setIsLogin(true)}>Login</Text></Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Logo width={200} height={200} style={styles.logo} />
			<Text style={styles.title}>Login to your YATRA Account</Text>
			<TextInput style={[styles.input, loading && styles.inputDisabled]} placeholder="Username" placeholderTextColor="#222" value={form.username} onChangeText={t => handleChange('username', t)} editable={!loading} />
			<TextInput style={[styles.input, loading && styles.inputDisabled]} placeholder="Password" placeholderTextColor="#222" value={form.password} onChangeText={t => handleChange('password', t)} secureTextEntry editable={!loading} />
			<TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
				{loading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="small" color="#fff" style={styles.loadingSpinner} />
						<Text style={styles.buttonText}>Signing In ......</Text>
					</View>
				) : (
					<Text style={styles.buttonText}>Login</Text>
				)}
			</TouchableOpacity>
			<Text style={{ marginVertical: 12, textAlign: 'center' }}>Or sign up using</Text>
			<View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
			</View>
			<Text style={styles.bottomText}>Don{"'"}t have an account? <Text style={styles.link} onPress={() => setIsLogin(false)}>Sign Up</Text></Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 16 },
	logo: { fontSize: 40, fontWeight: 'bold', color: '#F77B7B', marginBottom: 24 },
	title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
	subtitle: { fontSize: 14, color: '#444', marginBottom: 16, textAlign: 'center' },
	input: { width: 280, height: 44, borderWidth: 1, borderColor: '#ddd', borderRadius: 22, paddingHorizontal: 16, marginBottom: 12, backgroundColor: '#ffffff', color: '#000000' },
	inputDisabled: { backgroundColor: '#f5f5f5', borderColor: '#e0e0e0', color: '#999' },
	button: { width: 200, height: 44, backgroundColor: '#6C63FF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginVertical: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
	buttonDisabled: { backgroundColor: '#a0a0a0', shadowOpacity: 0.05 },
	buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
	loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
	loadingSpinner: { marginRight: 8 },
	forgot: { color: '#6C63FF', alignSelf: 'flex-end', marginRight: 32, marginBottom: 8 },
	link: { color: '#000', fontWeight: 'bold' },
	bottomText: { marginTop: 16, fontSize: 14 },
});
