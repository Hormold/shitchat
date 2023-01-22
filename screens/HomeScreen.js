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
   <NavigationContainer independent={true}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="ShitGPT" component={ChatListScreen} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        </Stack.Navigator>
    </NavigationContainer>
  );
};


export default HomeScreen;
