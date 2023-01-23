import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input, Button } from 'react-native-elements';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = getAuth();

const SignInScreen = () => {
  const [value, setValue] = React.useState({
    email: '',
    password: '',
    error: ''
  })

  async function signIn() {
    if (value.email === '' || value.password === '') {
      setValue({
        ...value,
        error: 'Email and password are mandatory.'
      })
      return;
    }

    try {
      const user = await signInWithEmailAndPassword(auth, value.email, value.password);
	  await AsyncStorage.setItem("userData", JSON.stringify(user));
      navigation.navigate('Home');
    } catch (error) {
      setValue({
        ...value,
        error: error.message,
      })
    }
  }

  const onForgetPassword = async () => {
    if (value.email === '') {
      setValue({
        ...value,
        error: 'Email is mandatory.'
      })
      return;
    }

    try {
      await sendPasswordResetEmail(auth, value.email);
      setValue({
        ...value,
        error: 'Password reset email sent.'
      })
    } catch (error) {
      setValue({
        ...value,
        error: error.message,
      })
    }
  }

  return (
    <View style={styles.container}>

      {!!value.error && <View style={styles.error}><Text>{value.error}</Text></View>}

      <View style={styles.controls}>
        <Input
          placeholder='Email'
          containerStyle={styles.control}
          value={value.email}
          onChangeText={(text) => setValue({ ...value, email: text })}
          leftIcon={<Icon
            name='envelope'
            size={16}
          />}
        />

        <Input
          placeholder='Password'
          containerStyle={styles.control}
          value={value.password}
          onChangeText={(text) => setValue({ ...value, password: text })}
          secureTextEntry={true}
          leftIcon={<Icon
            name='key'
            size={16}
          />}
        />
        

        <Button title="Sign in" buttonStyle={styles.control} onPress={signIn} />

        <Button title="Forget password" buttonStyle={styles.control2} onPress={() => onForgetPassword()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  controls: {
    flex: 1,
    alignItems: 'center',
  },

  control: {
    marginTop: 10,
	  width: 300,
  },

  control2: {
    marginTop: 10,
    width: 200,
  },

  error: {
    marginTop: 10,
    padding: 10,
    color: '#fff',
    backgroundColor: '#D54826FF',
  }
});

export default SignInScreen;