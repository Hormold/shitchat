import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { ThemeProvider } from 'react-native-elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';

import './config/firebase';
import {useAuth} from './hooks/useAuth';
import WelcomeScreen from './screens/Welcome';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const AuthStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator id="AuthStack">
        <Stack.Screen name="ShitGPT" component={WelcomeScreen} />
        <Stack.Screen name="Sign In" component={SignInScreen} />
        <Stack.Screen name="Sign Up" component={SignUpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 

const UserStack = () => {
  return (
    <NavigationContainer>
        <Tab.Navigator id="UserStack">
          <Tab.Screen name="Home" component={HomeScreen} options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" color={color} size={size} />
            ),
          }}/>
          <Tab.Screen name="Settings" component={SettingsScreen} options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="cog" color={color} size={size} />
            ),
          }}/>
        </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const { user } = useAuth();

  const auth =  user ? <UserStack /> : <AuthStack />;

  return <ThemeProvider>
    {auth}
  </ThemeProvider>;
}

