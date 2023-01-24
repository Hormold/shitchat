// Welcome Screen

import React, { useEffect } from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import { Button } from 'react-native-paper';
const WelcomeScreen = ({navigation}) => {

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.icon} />
      <Text style={styles.header}>Welcome to ShitGPT*</Text>
      <Text style={styles.subheader}>This is a APP that uses GPT-3{"\n"} to generate responses.{"\n"}{"\n"} You should have an{"\n"}OpenAI API key to use this app.</Text>
      <View style={styles.button}>
        <Button
          mode="contained"
          icon="login"
          onPress={() => navigation.navigate('Sign In')}
          buttonStyle={styles.button}>
          Sign In
          </Button>
      </View>
      <View style={styles.button}>
        <Button
          mode="contained"
          icon="account-plus"
          onPress={() => navigation.navigate('Sign Up')}
          style={styles.button}
          buttonStyle={styles.button}>
          Sign Up
          </Button>
      </View>

      <View>
        <Text style={styles.smallHintMuted}>* - Smart Hyperreal Innvoative Transformative GPT</Text>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  button: {
    marginTop: 10,
    width: 200
  },
  header: {
    fontSize: 20,
    marginBottom: 40
  },
  subheader: {
    fontSize: 15,
    marginBottom: 40,
    textAlign: 'center'
  },
  smallHintMuted: {
    fontSize: 10,
    color: '#999',
    marginTop: 30,
  }
});

export default WelcomeScreen;
