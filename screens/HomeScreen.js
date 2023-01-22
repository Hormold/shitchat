// Welcome Screen

import React from 'react';
import {StyleSheet, Text, View, Button, Image} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ChatListScreen from './ChatListScreen';
import ChatRoomScreen from './ChatRoomScreen';

const Stack = createNativeStackNavigator();

const HomeScreen = () => {
  return (
        <Stack.Navigator id="HomeStack" screenOptions={{headerShown: false}}>
            <Stack.Screen name="ChatList" component={ChatListScreen}  />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        </Stack.Navigator>
  );
};


export default HomeScreen;
