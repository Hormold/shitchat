import React, {useEffect, useState, useCallback} from 'react';
import {StyleSheet, Text, View, FlatList, Pressable, TouchableOpacity, Alert, RefreshControl} from 'react-native';
import { List, Divider } from 'react-native-paper';
import {firebase} from '../config/firebase';
import {getAuth} from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import {Button, FAB} from 'react-native-paper';

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  where,
  query,
  deleteDoc
} from '@firebase/firestore';

import {useNavigation} from '@react-navigation/native';

const ChatListScreen = () => {
  const [rooms,
    setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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
    const chatData = [];
    chats.forEach((chat) => {
      const data = chat.data();
      const lastMessage = data.messages.reverse()[data.messages.length - 1];
      chatData.push({
        id: chat.id,
        title: data.title || 'No title',
        lastMessage: lastMessage.text || 'No message',
        lastMessageTime: lastMessage.createdAt.seconds || 'No time',
        createdAt: new Date(data.createdAt * 1000) || Date.now(),
      });
    });
    // Sort
    chatData.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    
    parentNavi.setOptions({title: 'Chat List'});
    if(chatData.length) {
      parentNavi.setOptions({
        headerShown: true,
      });
    } else {
      parentNavi.setOptions({headerShown: false});
    }
    setRooms(chatData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await getChatsFromFirebase();
    setRefreshing(false);
  };


  const deleteChat = async(roomId) => {
    // Delete chat from firebase
    const chatRef = doc(firestore, 'chats', roomId);
    await deleteDoc(chatRef);
    getChatsFromFirebase();
  };

  const onRoomPress = (room) => {
    navigate.navigate('ChatRoom', {room: room});
  };

  const onCreateRoomPress = () => {
    // Go blank chat screen
    navigate.navigate('ChatRoom', {room: null});
  };

  const onRoomLongPress = (roomId) => {
    // Ask if user wants to delete the chat
    // If yes, delete the chat
    // If no, do nothing
    Alert.alert(
      'Delete chat',
      'Are you sure you want to delete this chat?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {
            deleteChat(roomId);
          }
        }
      ],
      {cancelable: false}
    );
  };

  useEffect(() => {
    getChatsFromFirebase();
   
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getChatsFromFirebase();
    }, [])
  );

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

  const CutLongText = (text, length) => {
    if (text.length > length) {
      return text.substring(0, length) + '...';
    }
    return text;
  };

  const dateHumanize = (date) => {
    const now = new Date();
    const diff = now - new Date(date * 1000);
    const diffInMinutes = Math.floor(diff / 1000 / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes + ' minutes ago';
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours + ' hours ago';
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return diffInDays + ' days ago';
    }
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return diffInWeeks + ' weeks ago';
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths + ' months ago';
    }
  };

  const RoomList = () => {
    return (<FlatList
      style={styles.list}
      data={rooms}
      keyExtractor={(item, index) => index}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
      renderItem={({item}) => (
      <TouchableOpacity
        onPress={() => onRoomPress(item.id)}
        onLongPress={() => onRoomLongPress(item.id)}
      >
        <List.Item
          title={CutLongText(item.title, 50)}
          description={CutLongText(item.lastMessage, 90)}
          left={props => <List.Icon {...props} icon="robot-angry" />}
          right={props => 
            <View style={{flexDirection: 'column', alignItems: 'flex-end'}}>
              <Text style={{fontSize: 12}}>{dateHumanize(item.lastMessageTime)}</Text>
              <List.Icon {...props} icon="chevron-right" />
            </View>
          }
          style={styles.listItem}
        />
      </TouchableOpacity>
    )}/>);
  }

  return (
    <View style={styles.container}>
      {rooms.length === 0 && <BlankRoom/>}
      {rooms.length > 0 && <RoomList/>}
      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => onCreateRoomPress()}
      />
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
    fontSize: 8
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  list: {
    flex: 1,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0
  },

});

export default ChatListScreen;