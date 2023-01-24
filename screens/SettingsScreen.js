// Screen with edit openai api key and save to firebase
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {TextInput, Button, FAB} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import {firebase} from '../config/firebase';
import {sendPasswordResetEmail} from '@firebase/auth';
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

const models = ['text-davinci-003', 'text-ada-001', 'text-babbage-001', 'text-curie-001'];

export default function SettingsScreen() {
  const [openaiKey,
    setOpenaiKey,
    userData,
    setUserData] = useState('');

  const [openaiModel,
    setOpenaiModel] = useState('text-davinci-003');

  const [serpApiKey, 
    setSerpApiKey] = useState('');

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
      setOpenaiModel(docSnap.data().model)
      setSerpApiKey(docSnap.data().serpApiKey)
    } else {
      // Create a new document, blank
      setDoc(userSettings, {
        openaiKey: '',
        model: 'text-davinci-003',
        serpApiKey: ''
      });
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
      if (!json.choices) 
        throw new Error('Invalid API Key');
      Alert.alert('API Key is valid!');
    } catch (error) {
      console.error(error);
      Alert.alert('API Key is invalid, please check your key and try again.');
    }
  }

  const changePassword = async(auth) => {
    // change password
    const email = auth.currentUser.email;
    sendPasswordResetEmail(auth, email).then(() => {
      Alert.alert('Password reset email sent!');
    }).catch((error) => {
      Alert.alert('Error sending password reset email.');
    });
  };

  useEffect(() => {
    getUserData();
    console.log('SettingsScreen useEffect called')
  }, []);

  const onSettingsUpdate = async() => {
    updateDoc(userSettings, {
      openaiKey: openaiKey,
      model: openaiModel,
      serpApiKey: serpApiKey
    });
    Alert.alert('Settings updated!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OpenAI API Key:</Text>
      <TextInput
        style={styles.input}
        placeholder={'OpenAI API Key'}
        placeholderTextColor="#aaaaaa"
        onChangeText={(text) => setOpenaiKey(text)}
        value={openaiKey}
        underlineColorAndroid="transparent"
        autoCapitalize="none"/>

      <View style={{
        ...styles.howto,
        margin: 10
      }}>
        <Text style={{
          ...styles.small
        }}>How to get API Key:</Text>
        <Text style={{
          ...styles.small,
          marginTop: 10
        }}>
          1. Go to https://beta.openai.com/ and sign up for an account.
        </Text>
        <Text style={{
          ...styles.small,
          marginTop: 10
        }}>
          2. Go to https://beta.openai.com/account/api-keys and create a new API key.
        </Text>
        <Text style={{
          ...styles.small,
          marginTop: 10
        }}>
          3. Copy the key and paste it into the text box above.
        </Text>
      </View>

      <Text style={{
        ...styles.title,
        marginTop: 10
      }}>OpenAI Model:</Text>
      <Picker
        selectedValue={openaiModel}
        style={{
        height: 50
      }}
        onValueChange={(itemValue, itemIndex) => setOpenaiModel(itemValue)}>
        {models.map((model) => {
          return (<Picker.Item label={model} value={model} key={model}/>)
        })}
      </Picker>

      <Text style={{
        ...styles.title,
        marginTop: 10
      }}>SerpApi Key:</Text>
      <TextInput
        style={styles.input}
        placeholder={'SerpApi Key'}
        placeholderTextColor="#aaaaaa"
        onChangeText={(text) => setSerpApiKey(text)}
        value={serpApiKey}
        underlineColorAndroid="transparent"
        autoCapitalize="none"/>

      <View style={{
        ...styles.howto,
        marginTop: 10,
        padding: 10
      }}>
        <Text style={{ color: 'white' }}>
          To use serp api, start message with "!"
        </Text>
      </View>
      

      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <Button
            mode='elevated'
            onPress={() => onSettingsUpdate()}
            style={styles.button}>
            Update
          </Button>

        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode='contained'
            onPress={() => testApiKey(openaiKey)}
            style={styles.button2}>
            Test API Key
          </Button>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <Button
            mode='contained'
            onPress={() => changePassword(auth)}
            style={styles.button}>
            Change Password
          </Button>
        </View>

      </View>
      <FAB icon="logout" style={styles.fab} onPress= { () => signOut(auth) }/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: 10
  },

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0
  },

  title: {
    fontSize: 20
  },
  input: {
    marginTop: 8,
    height: 50,
    borderRadius: 3,
    width: 350
  },
  buttonContainer: {
    marginTop: 16,
    flex: 1
  },

  button: {
    marginRight: 1
  },

  button2: {
    backgroundColor: '#ff0000'
  },

  small: {
    fontSize: 8,
    color: '#fff'
  },

  howto: {
    backgroundColor: '#201f1e',
    borderRadius: 3,
    width: 350,
    padding: 5
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

});
