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
  where,
  query
} from '@firebase/firestore';

import {useNavigation} from '@react-navigation/native';

const ChatListScreen = () => {
  const [rooms,
    setRooms] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const firestore = getFirestore(firebase);
  const navigate = useNavigation();
  const tbl = collection(firestore, 'chats');
  const parentNavi = useNavigation().getParent('UserStack');

  const getChatsFromFirebase = async() => {
    // get all chats from firebase where user is a owner_id
    const q = query(tbl, where('owner_id', '==', user.uid));
    const chats = await getDocs(q);
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
    navigate.navigate('ChatRoom', {room: null});
  };

  useEffect(() => {
    getChatsFromFirebase();
    parentNavi.setOptions({title: 'Chat List'});
    parentNavi.setOptions({headerShown: false});
  }, []);

  const BlankRoom = () => {
    return (
      <View style={styles.container}>
        <Text>No chats yet</Text>
        <Pressable onPress={() => onCreateRoomPress()} style={styles.button}>
          <Text style={styles.buttonTitle}>Create a new chat session</Text>
        </Pressable>
      </View>
    );
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
    padding: 16
  },
  listItemTitle: {
    fontSize: 24
  },
  listItemSubtitle: {
    fontSize: 16
  }
});

export default ChatListScreen;