import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, FlatList, Pressable} from 'react-native';
import {firebase} from '../config/firebase';
import {getAuth} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  where
} from '@firebase/firestore/lite';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../hooks/useAuth.js';

const ChatRoomScreen = () => {
  const [rooms,
    setRooms] = useState([]);
  const auth = getAuth();
  const {user} = useAuth();
  const firestore = getFirestore(firebase);
  const navigate = useNavigation();

  const getChatsFromFirebase = async() => {
    // get all chats from firebase where user is a owner_id
    const chats = await getDocs(collection(firestore, 'chats').where('owner_id', '==', user.uid));
    chats.forEach((chat) => {
      console.log(chat.data());
    });
    setRooms(chats.docs.map((doc) => doc.data()));
  };

  const onRoomPress = (room) => {
    navigate.navigate('ChatRoom', {room: room});
  };

  const onCreateRoomPress = () => {
    // Go blank chat screen
    navigate.navigate('ChatRoom', {room: {}});
  };

  useEffect(() => {
    getChatsFromFirebase();
  }, []);

  const BlankRoom = () => {
    return (<View style={styles.container}>
        <Text>No chats yet</Text>
        <Pressable onPress={() => onCreateRoomPress()} style={styles.button}>
            <Text style={styles.buttonTitle}>Create a new chat session</Text>
        </Pressable>
        </View>);
  };

  const RoomList = () => {
    return (<FlatList
        style={styles.list}
        data={rooms}
        renderItem={({item}) => (
        <TouchableOpacity onPress={() => onRoomPress(item)}>
          <View style={styles.listItemContainer}>
            <Text style={styles.listItemTitle}>{item.name}</Text>
            <Text style={styles.listItemSubtitle}>{item.lastMessage}</Text>
            <Text style={styles.listItemSubtitle}>{item.lastMessageTime}</Text>
          </View>
        </TouchableOpacity>
      )}
        keyExtractor={(item) => item.id}/>);
  }

  return (
    <View style={styles.container}>
      {rooms.length === 0 && <BlankRoom/>} 
        {rooms.length > 0 && <RoomList/>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    marginTop: 10,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    color: '#fff'
  },
  buttonTitle: {
    color: '#fff'
  },
  listItemContainer: {
    alignItems: 'center',
    padding: 16,
},
listItemTitle: {
    fontSize: 24,
},
listItemSubtitle: {
    fontSize: 16,
},
});

export default ChatRoomScreen;