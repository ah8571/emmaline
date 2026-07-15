import React from 'react';
import { registerRootComponent } from 'expo';
import { registerGlobals } from 'react-native-webrtc';
import App from './src/App';

registerGlobals();
registerRootComponent(App);
