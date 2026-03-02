import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import TimelineScreen from '../screens/TimelineScreen';
import TranscriptScreen from '../screens/TranscriptScreen';
import NotesScreen from '../screens/NotesScreen';
import CallDetailScreen from '../screens/CallDetailScreen';
import { isAuthenticated as hasAuthToken, getUser } from '../utils/secureStorage.js';

const Stack = createStackNavigator();

const TranscriptStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TranscriptList" 
      component={TranscriptScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CallDetail" 
      component={CallDetailScreen}
      options={{ title: 'Call Details' }}
    />
  </Stack.Navigator>
);

const NotesStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="NotesList" 
      component={NotesScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const AppHome = () => {
  const [activeScreen, setActiveScreen] = useState('transcripts');
  const [menuOpen, setMenuOpen] = useState(false);

  const openScreen = (screen) => {
    setActiveScreen(screen);
    setMenuOpen(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuOpen((open) => !open)}
          activeOpacity={0.8}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {menuOpen ? (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBackdrop}
            onPress={() => setMenuOpen(false)}
            activeOpacity={1}
          />
          <View style={styles.sideMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => openScreen('transcripts')}
              activeOpacity={0.8}
            >
              <Text style={styles.menuItemText}>Transcripts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => openScreen('notes')}
              activeOpacity={0.8}
            >
              <Text style={styles.menuItemText}>Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.content}>
        {activeScreen === 'transcripts' ? <TranscriptStack /> : <NotesStack />}
      </View>
    </View>
  );
};

const AppNavigator = ({ onAuthStateChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await hasAuthToken();

        if (!authenticated) {
          setIsAuthenticated(false);
          setUser(null);
          onAuthStateChange?.(false);
          return;
        }

        const storedUser = await getUser();
        setUser(storedUser);
        setIsAuthenticated(true);
        onAuthStateChange?.(true);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        onAuthStateChange?.(false);
      }
    };

    checkAuthStatus();
  }, [onAuthStateChange]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    onAuthStateChange?.(true);
  };

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen 
            name="Login"
            options={{
              animationEnabled: false
            }}
          >
            {() => <LoginScreen onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen 
            name="App" 
            component={AppHome}
            options={{
              animationEnabled: false
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    height: 72,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#ffffff'
  },
  menuButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '25%',
    marginTop: 10
  },
  menuIcon: {
    fontSize: 16,
    color: '#212529'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    flexDirection: 'row'
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  sideMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 220,
    backgroundColor: '#ffffff'
  },
  menuItem: {
    paddingHorizontal: 18,
    paddingVertical: 14
  },
  menuItemText: {
    fontSize: 15,
    color: '#212529'
  },
  content: {
    flex: 1
  }
});
