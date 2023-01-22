// Welcome Screen

import React from 'react';
import {StyleSheet, Text, View, Button, Image} from 'react-native';

const WelcomeScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.icon}/>
      <Text style={styles.header}>Welcome to ShitGPT v11</Text>
      <Text style={styles.subheader}>Sign in or sign up to continue</Text>
      <View style={styles.button}>
        <Button
          title="Sign In"
          onPress={() => navigation.navigate('Sign In')}
          buttonStyle={styles.button}/>
      </View>
      <View style={styles.button}>
        <Button
          title="Sign Up"
          onPress={() => navigation.navigate('Sign Up')}
          style={styles.button}
          buttonStyle={styles.button}/>
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
    marginBottom: 40
  }
});

export default WelcomeScreen;
