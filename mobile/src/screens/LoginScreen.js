import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { loginUser, registerUser } from '../services/api.js';

/**
 * LoginScreen
 * Initial authentication screen for users
 */
const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const response = isLogin
        ? await loginUser(email.trim().toLowerCase(), password)
        : await registerUser(email.trim().toLowerCase(), password);

      if (!response.success) {
        setError(response.error || 'Authentication failed');
        return;
      }

      onLoginSuccess(response.user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Emmaline</Text>
          <Text style={styles.subtitle}>AI Phone Assistant</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8f98a3"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8f98a3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#050607" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={loading}
          >
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Hands-free AI assistant for multitasking
          </Text>
          <Text style={styles.footerSubtext}>
            Call, talk, and organize your thoughts
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050607'
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  header: {
    alignItems: 'center',
    marginTop: 20
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f5f7fa',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#b0b7c0'
  },
  form: {
    marginVertical: 32
  },
  input: {
    backgroundColor: '#050607',
    borderWidth: 1,
    borderColor: '#f5f7fa',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 14,
    color: '#f5f7fa'
  },
  errorText: {
    color: '#ff9aa8',
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '500'
  },
  button: {
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#050607',
    fontSize: 16,
    fontWeight: '600'
  },
  toggleText: {
    color: '#f5f7fa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12
  },
  footer: {
    alignItems: 'center'
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f7fa',
    marginBottom: 4
  },
  footerSubtext: {
    fontSize: 12,
    color: '#b0b7c0'
  }
});

export default LoginScreen;
