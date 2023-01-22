// Screen with edit openai api key and save to firebase
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Pressable
} from 'react-native';
import {firebase} from '../config/firebase';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc
} from '@firebase/firestore/lite';
import {getAuth} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [openaiKey,
    setOpenaiKey,
    userData,
    setUserData] = useState('');
  const firestore = getFirestore(firebase);
  const auth = getAuth();
  const user = auth.currentUser;

  const signOut = (auth) => {
    auth.signOut();
  };

  // get user data from /settings/{user.uid}
  const userSettings = doc(firestore, 'settings', user.uid);
  const getUserData = async() => {
    // Get user settings from firebaser
    const docSnap = await getDoc(userSettings);
    if (docSnap.exists()) {
      setOpenaiKey(docSnap.data().openaiKey)
    } else {
      // Create a new document, blank
      setDoc(userSettings, {openaiKey: ''});
    }
  };

  const testApiKey = async(key) => {
    // test openai api key
    try {
      const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
          prompt: 'This is a test of the OpenAI GPT-3 API, please ignore',
          max_tokens: 1,
          temperature: 0.9,
          top_p: 1,
          n: 1,
          stream: false,
          logprobs: null
        })
      });

      const json = await response.json();
      console.log(json);
      Alert.alert('API Key is valid!');
    } catch (error) {
      console.error(error);
      Alert.alert('API Key is invalid, please check your key and try again.');
    }
  }

  useEffect(() => {
    getUserData();
    console.log('SettingsScreen useEffect called')
  }, []);

  const onSettingsUpdate = async() => {
    updateDoc(userSettings, {openaiKey: openaiKey});
    Alert.alert('Settings updated!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TextInput
        style={styles.input}
        placeholder={'OpenAI API Key'}
        placeholderTextColor="#aaaaaa"
        onChangeText={(text) => setOpenaiKey(text)}
        value={openaiKey}
        underlineColorAndroid="transparent"
        autoCapitalize="none"/>
      <Pressable onPress={() => onSettingsUpdate()} style={styles.button}>
        <Text style={styles.buttonTitle}>Update</Text>
      </Pressable>

      <Pressable onPress={() => testApiKey(openaiKey)} style={styles.buttonTest}>
        <Text style={styles.buttonTitle}>Test API KEY</Text>
      </Pressable>

      <Pressable onPress={() => signOut(auth)} style={styles.buttonOut}>
        <Text style={styles.buttonTitle}>Sign Out</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 30
  },
  input: {
    marginTop: 8,
    height: 50,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'white',
    paddingLeft: 16,
    borderColor: '#cccccc',
    borderWidth: 1,
    width: 250,
    fontSize: 12
  },
  button: {
    marginTop: 16,
    backgroundColor: '#000',
    height: 50,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: 250
  },
  buttonTitle: {
    color: 'white'
  },

  buttonOut: {
    marginTop: 16,
    backgroundColor: '#0000ff',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30
  },

  buttonTest: {
    marginTop: 16,
    backgroundColor: '#ff0000',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30
  }

});
