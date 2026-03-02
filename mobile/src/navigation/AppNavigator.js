import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import LoginScreen from '../screens/LoginScreen';
import TimelineScreen from '../screens/TimelineScreen';
import TranscriptScreen from '../screens/TranscriptScreen';
import NotesScreen from '../screens/NotesScreen';
import CallDetailScreen from '../screens/CallDetailScreen';
import { isAuthenticated as hasAuthToken, getUser } from '../utils/secureStorage.js';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

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

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#6c757d',
        tabBarIndicatorStyle: {
          backgroundColor: '#007AFF',
          height: 2
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e9ecef'
        },
        tabBarLabelStyle: {
          textTransform: 'none',
          fontSize: 14,
          fontWeight: '600'
        }
      }}
    >
      <Tab.Screen 
        name="Transcript" 
        component={TranscriptStack}
        options={{
          tabBarLabel: 'Transcripts'
        }}
      />
      <Tab.Screen 
        name="Notes" 
        component={NotesStack}
        options={{
          tabBarLabel: 'Notes'
        }}
      />
    </Tab.Navigator>
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
            component={AppTabs}
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
