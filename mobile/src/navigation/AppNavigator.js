import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import TimelineScreen from '../screens/TimelineScreen';
import TranscriptScreen from '../screens/TranscriptScreen';
import NotesScreen from '../screens/NotesScreen';
import CallDetailScreen from '../screens/CallDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        tabBarInactiveTintColor: '#adb5bd',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          height: 60,
          paddingBottom: 8
        }
      }}
    >
      <Tab.Screen 
        name="Transcript" 
        component={TranscriptStack}
        options={{
          tabBarLabel: 'Transcripts',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🎙️</Text>
          )
        }}
      />
      <Tab.Screen 
        name="Notes" 
        component={NotesStack}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📝</Text>
          )
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // TODO: Check if user is already logged in (from secure storage)
  useEffect(() => {
    // checkAuthStatus();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // TODO: Store JWT token securely
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
