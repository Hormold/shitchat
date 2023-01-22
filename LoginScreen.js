import React, {useState} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  AsyncStorage
} from 'react-native';

const LoginScreen = ({navigation}) => {
  const [state, setState] = useState({userInfo})
  const signIn = async() => {
    try {
      // Get the users ID token
      const {idToken} = await GoogleSignin.signIn();

      const userInfo = await GoogleSignin.signIn();
      setState({userInfo});
      AsyncStorage.setItem('user', JSON.stringify(userInfo));
      // Create a Google credential with the token
      const googleCredential = auth
        .GoogleAuthProvider
        .credential(idToken);
      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  const onPressLogin = async() => {
    // Do something about login operation Go to ChatScreen
    const result = await signIn();
    if (result) {
      // Check user have openai api key in Firebase
      const user = auth().currentUser;
      const db = firebase.firestore();
      const doc = await db
        .collection('users')
        .doc(user.uid)
        .get();
      if (doc.exists) {
        const data = doc.data();
        if (data.openai_api_key) {
          navigation.navigate('Rooms');
        } else {
          navigation.navigate('Settings');
        }
      } else {
        navigation.navigate('Settings');
      }
    }
    //navigation.navigate('Chat');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        GPT-3 Chat Bot</Text>
      <TouchableOpacity onPress={onPressLogin} style={styles.loginBtn}>
        <Text style={styles.loginText}>LOGIN WITH GOOGLE
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  loginBtn: {
    width: "80%",
    backgroundColor: "#fb5b5a",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10

  },
  loginText: {
    color: "white"

  },

  container: {
    flex: 1,
    backgroundColor: '#4FD3DA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontWeight: "bold",
    fontSize: 50,
    color: "#fb5b5a",
    marginBottom: 40
  },
  inputView: {
    width: "80%",
    backgroundColor: "#3AB4BA",
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20
  },
  inputText: {
    height: 50,
    color: "white"
  },
  forgotAndSignUpText: {
    color: "white",
    fontSize: 11
  },
  loginBtn: {
    width: "80%",
    backgroundColor: "#fb5b5a",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10
  }
});
export default LoginScreen;