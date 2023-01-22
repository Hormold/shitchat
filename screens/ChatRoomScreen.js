import {StyleSheet, Text, View, Button, Pressable} from 'react-native';

const ChatRoomScreen = ({navigation}) => {
	  return (
	<View style={styles.container}>
	  <Text>ChatRoomScreen</Text>
	  <Button
		title="Go to Home"
		onPress={() => navigation.navigate('ShitGPT')}
	  />
	</View>
  );
}

const styles = StyleSheet.create({
	  container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	  },
	});

export default ChatRoomScreen;