import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LoginScreen from '../screens/LoginScreen';
import TranscriptScreen from '../screens/TranscriptScreen';
import NotesScreen from '../screens/NotesScreen';
import CreateNoteScreen from '../screens/CreateNoteScreen';
import CallDetailScreen from '../screens/CallDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UpgradeScreen from '../screens/UpgradeScreen';
import { isAuthenticated as hasAuthToken, getUser } from '../utils/secureStorage.js';
import { useAppTheme } from '../theme/appTheme.js';
import { designTokens } from '../theme/designSystem.js';
import { logoutUser } from '../services/api.js';

const Stack = createStackNavigator();

const TranscriptStack = ({ onAppHeaderScroll }) => {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface, borderBottomColor: colors.border, shadowColor: 'transparent' },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen 
        name="TranscriptList" 
        options={{ headerShown: false }}
      >
        {(screenProps) => <TranscriptScreen {...screenProps} onAppHeaderScroll={onAppHeaderScroll} />}
      </Stack.Screen>
      <Stack.Screen 
        name="CallDetail" 
        options={{ title: 'Call Details', headerStatusBarHeight: 0 }}
      >
        {(screenProps) => <CallDetailScreen {...screenProps} onAppHeaderScroll={onAppHeaderScroll} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const NotesStack = ({ onAppHeaderScroll, notesResetToken }) => {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface, borderBottomColor: colors.border, shadowColor: 'transparent' },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen 
        name="NotesList" 
        options={{ headerShown: false }}
      >
        {(screenProps) => <NotesScreen {...screenProps} onAppHeaderScroll={onAppHeaderScroll} notesResetToken={notesResetToken} />}
      </Stack.Screen>
      <Stack.Screen
        name="CreateNote"
        options={{ headerShown: false }}
      >
        {(screenProps) => <CreateNoteScreen {...screenProps} onAppHeaderScroll={onAppHeaderScroll} notesResetToken={notesResetToken} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const AppHome = ({ onLogout }) => {
  const [uiState, setUiState] = useState({
    activeScreen: 'transcripts',
    menuOpen: false,
    transcriptStackVersion: 0,
    notesStackVersion: 0,
    notesResetToken: 0,
    headerScrollOffset: new Animated.Value(0)
  });
  const { colors, isDarkMode, toggleTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const lastScrollYRef = useRef(0);
  const headerHiddenOffsetRef = useRef(0);
  const topInset = Math.max(insets.top, 10);
  const headerMaxHeight = 64 + topInset;
  const headerCollapseRange = headerMaxHeight;
  const { activeScreen, menuOpen, transcriptStackVersion, notesStackVersion, notesResetToken } = uiState;
  const headerScrollOffset = uiState.headerScrollOffset && typeof uiState.headerScrollOffset.interpolate === 'function'
    ? uiState.headerScrollOffset
    : new Animated.Value(0);
  const headerTranslateY = headerScrollOffset.interpolate({
    inputRange: [0, headerCollapseRange],
    outputRange: [0, -headerCollapseRange],
    extrapolate: 'clamp'
  });

  const resetHeaderPosition = useCallback((animated = false) => {
    lastScrollYRef.current = 0;
    headerHiddenOffsetRef.current = 0;

    if (animated) {
      Animated.timing(headerScrollOffset, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false
      }).start();
      return;
    }

    headerScrollOffset.stopAnimation();
    headerScrollOffset.setValue(0);
  }, [headerScrollOffset]);

  const handleAppHeaderScroll = useCallback((offsetY = 0) => {
    const normalizedOffset = Number.isFinite(Number(offsetY)) ? Math.max(0, Number(offsetY)) : 0;
    const previousScrollY = lastScrollYRef.current;
    const deltaY = normalizedOffset - previousScrollY;
    const nextHiddenOffset = normalizedOffset <= 0
      ? 0
      : Math.max(0, Math.min(headerCollapseRange, headerHiddenOffsetRef.current + deltaY));

    lastScrollYRef.current = normalizedOffset;
    headerHiddenOffsetRef.current = nextHiddenOffset;
    headerScrollOffset.setValue(nextHiddenOffset);

    if (normalizedOffset <= 0) {
      return;
    }

    setUiState((currentState) => {
      if (!currentState.menuOpen) {
        return currentState;
      }

      return {
        ...currentState,
        headerScrollOffset: currentState.headerScrollOffset || headerScrollOffset,
        menuOpen: false
      };
    });
  }, [headerCollapseRange, headerScrollOffset]);

  const openScreen = (screen) => {
    resetHeaderPosition();
    setUiState((currentState) => ({
      ...currentState,
      headerScrollOffset: currentState.headerScrollOffset || headerScrollOffset,
      activeScreen: screen,
      menuOpen: false,
      transcriptStackVersion: screen === 'transcripts' ? currentState.transcriptStackVersion + 1 : currentState.transcriptStackVersion,
      notesStackVersion: screen === 'notes' ? currentState.notesStackVersion + 1 : currentState.notesStackVersion,
      notesResetToken: screen === 'notes' ? currentState.notesResetToken + 1 : currentState.notesResetToken
    }));
  };

  const handleLogoutPress = () => {
    resetHeaderPosition();
    setUiState((currentState) => ({
      ...currentState,
      headerScrollOffset: currentState.headerScrollOffset || headerScrollOffset,
      menuOpen: false
    }));
    Alert.alert(
      'Log out',
      'Log out of Emmaline on this device?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => onLogout?.()
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            height: headerMaxHeight,
            paddingTop: topInset + designTokens.spacing.sm,
            paddingBottom: designTokens.chrome.shellBottomPadding,
            borderBottomWidth: 1,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            resetHeaderPosition(true);
            setUiState((currentState) => ({
              ...currentState,
              headerScrollOffset: currentState.headerScrollOffset || headerScrollOffset,
              menuOpen: !currentState.menuOpen
            }));
          }}
          activeOpacity={0.8}
        >
          <View style={styles.menuIconBars}>
            <View style={[styles.menuIconBar, { backgroundColor: colors.text }]} />
            <View style={[styles.menuIconBar, { backgroundColor: colors.text }]} />
            <View style={[styles.menuIconBar, { backgroundColor: colors.text }]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.themeToggle}
          onPress={toggleTheme}
          activeOpacity={0.85}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text
            style={[
              styles.themeToggleText,
              isDarkMode ? styles.themeToggleTextSun : styles.themeToggleTextMoon,
              { color: colors.text }
            ]}
          >
            {isDarkMode ? '☼' : '☾'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {menuOpen ? (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBackdrop}
            onPress={() => {
              resetHeaderPosition(true);
              setUiState((currentState) => ({
                ...currentState,
                headerScrollOffset: currentState.headerScrollOffset || headerScrollOffset,
                menuOpen: false
              }));
            }}
            activeOpacity={1}
          />
          <View style={[styles.sideMenu, { backgroundColor: colors.surface, borderRightColor: colors.border, top: headerMaxHeight }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => openScreen('transcripts')}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>Transcripts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => openScreen('notes')}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => openScreen('upgrade')}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>Upgrade</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => openScreen('settings')}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast, { borderTopColor: colors.border }]}
              onPress={handleLogoutPress}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuItemDangerText, { color: colors.text }]}>Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: colors.background,
            paddingTop: headerMaxHeight
          }
        ]}
      >
        {activeScreen === 'transcripts'
          ? <TranscriptStack key={`transcripts-${transcriptStackVersion}`} onAppHeaderScroll={handleAppHeaderScroll} />
          : activeScreen === 'notes'
            ? <NotesStack key={`notes-${notesStackVersion}`} onAppHeaderScroll={handleAppHeaderScroll} notesResetToken={notesResetToken} />
            : activeScreen === 'upgrade'
              ? <UpgradeScreen />
              : <SettingsScreen onLogout={onLogout} onOpenUpgrade={() => openScreen('upgrade')} />}
      </Animated.View>
    </View>
  );
};

const AppNavigator = ({ onAuthStateChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const { colors, isDarkMode } = useAppTheme();

  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.accent
    },
    fonts: undefined
  };

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

  const handleLogout = async () => {
    const response = await logoutUser();

    if (!response.success) {
      Alert.alert('Logout failed', response.error || 'Unable to log out right now.');
      return;
    }

    setUser(null);
    setIsAuthenticated(false);
    onAuthStateChange?.(false);
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {!isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
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
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen 
            name="App" 
            options={{
              animationEnabled: false
            }}
          >
            {() => <AppHome onLogout={handleLogout} />}
          </Stack.Screen>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: designTokens.chrome.shellHorizontalPadding,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between'
  },
  menuButton: {
    width: designTokens.chrome.menuButtonSize,
    height: designTokens.chrome.menuButtonSize,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 0
  },
  themeToggle: {
    minWidth: designTokens.chrome.themeToggleSize,
    height: designTokens.chrome.themeToggleSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0
  },
  themeToggleText: {
    fontSize: designTokens.typography.shellIcon,
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: designTokens.typography.shellIcon
  },
  themeToggleTextMoon: {
    fontSize: 27,
    lineHeight: 27,
    transform: [{ translateY: -1 }]
  },
  themeToggleTextSun: {
    fontSize: 29,
    lineHeight: 29,
    transform: [{ translateY: -1 }]
  },
  menuIconBars: {
    width: designTokens.chrome.menuIconWidth,
    gap: designTokens.chrome.menuIconGap
  },
  menuIconBar: {
    height: designTokens.chrome.menuBarHeight,
    borderRadius: designTokens.radius.pill,
    backgroundColor: '#212529'
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
    bottom: 0,
    width: designTokens.chrome.sideMenuWidth,
    paddingTop: 18,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef'
  },
  menuItem: {
    paddingHorizontal: 18,
    paddingVertical: designTokens.spacing.lg
  },
  menuItemLast: {
    marginTop: designTokens.spacing.xs,
    borderTopWidth: 1
  },
  menuItemText: {
    fontSize: 15,
    color: '#212529'
  },
  menuItemDangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529'
  },
  content: {
    flex: 1
  }
});
