import {StyleSheet, Text, View, Button, Pressable, Alert, TouchableOpacity} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat'
import {useState, useEffect, useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {getAuth} from 'firebase/auth';

import {
  getFirestore,
  collection,
  getDoc,
  doc,
  setDoc,
  addDoc,
} from '@firebase/firestore';
import {firebase} from '../config/firebase';
import DefaultData from '../config/default';
import { StatusBar } from 'expo-status-bar';
import { askGPT, generateTitle, processSerpResults } from '../utils/openai';
import { serpResult } from '../utils/serp';

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Ger props
const ChatRoomScreen = ({route}) => {
  let lastId = 0;
  const [messages,
    setMessages] = useState([]);
  const [chatTitle, setChatTitle] = useState('New Chat');
  const auth = getAuth();
  const navi = useNavigation().getParent('UserStack');

  const firestore = getFirestore(firebase);
  const tbl = collection(firestore, 'chats');
  const user = auth.currentUser;
  const userSettings = doc(firestore, 'settings', user.uid);
  const chatElement = route.params.room?doc(firestore, 'chats', route.params.room ) : null;
  let userAPIKey = null;
  let userSelectedModel = null;
  let settings = {
    openaiKey: null,
    model: null,
    serpApi: null,
  };

  let historyRows = [];
  let chat = route.params.room;
  let chatDoc; // Chat document from D

  const getUserAPIKey = async() => {
    try {
      const userDoc = await getDoc(userSettings);
      const userData = userDoc.data();
      userAPIKey = userData.openaiKey;
      userSelectedModel = userData.model;
      settings = userData;
      if(!userAPIKey) {
        Alert.alert('Error', 'You need to set your OpenAI API key in settings');
      }
      return userData;
    } catch (e) {
      Alert.alert('Error', 'Could not get user settings');
      console.log(e);
    }
  };

  const buildMessage = (text, fromBot = true) => {
    const userEmail = auth.currentUser.email;
    const gravatarUrl = `https://www.gravatar.com/avatar/${userEmail}?s=200&d=identicon`;
    let user = {
      _id: 1,
      name: 'You',
      avatar: gravatarUrl
    };
    if (fromBot) {
      user = {
        _id: 2,
        name: 'GPT-3',
        avatar: require('../assets/ai.png')
      };
    }
    const randomId = Math.floor(Math.random() * 1000000);
    return {_id: randomId, text, createdAt: new Date(), user};
  }

  const loadChatMessages = async() => {
    console.log('Run loadChatMessages');
    if (!chat || !chatElement) {
      console.log(`No chat found, loading default text: ${DefaultData.defaultText}`)
      setMessages(previousMessages => previousMessages.length?previousMessages:GiftedChat.append(previousMessages, buildMessage(DefaultData.defaultText, true)));
      return;
    } else {
      console.log(`Loading chat: ${chat}`)
      const chats = await getDoc(chatElement);
      chatDoc = chats.data();
      const chatMessages = chats.data().messages;
      if (chatMessages.length > 0) {
        // Fix createdAt date
        chatMessages.forEach((message) => {
          message.createdAt = new Date(message.createdAt.seconds * 1000);
          if(message.user._id === 2)
            message.user.avatar = require('../assets/ai.png');
        });
        setChatTitle(chats.data().title || 'Untitled');
        setMessages(previousMessages => GiftedChat.append(previousMessages, chatMessages));
        console.log(`Loaded ${chatMessages.length} messages`);
      }
    }
  };

  const saveChatHistory = (messages, runProxy = true) => {
    historyRows = messages;
    console.log(`[saveChatHistory] Saving chat history: ${historyRows.length}`)
    if(runProxy) saveChatHistoryProxy(messages);
    return messages;
  };

  const saveChatHistoryProxy = async (messages) => {
    try {
      let chatId = chat;
      const chatData = {
        title: (chatDoc?chatDoc.title:chatTitle) || 'Untitled',
        owner_id: user.uid,
        messages,
        createdAt: chatDoc?chatDoc.createdAt:Math.floor(Date.now() / 1000)
      };

      if(!messages.length) 
        return console.log('No messages to save', messages);

      if(!chatId) {
        // Create new chat json
        // Generate title for first message from user
        const firstMessage = historyRows.filter((message) => message.user._id === 1)[0];
        const newTitle = await generateTitle(firstMessage.text, userAPIKey);
        chatData.title = newTitle;
        console.log(`[saveChatHistory] New chat created: ${chat} with title ${newTitle}`);
        setChatTitle(newTitle);
        const result = await addDoc(tbl, chatData);
        chatDoc = chatData;
        chat = result.id;
      } else {
        // Update chat json
        await setDoc(doc(tbl, chatId), chatData);
        console.log(`[saveChatHistory] Chat updated: ${chatId}`);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const buildHistory = () => {
    // Get last 20 messages from chat
    const history = [];

    historyRows.forEach((message) => {
      if(message.user._id === 1)
        history.push(`Human: ${message.text}`);
      else
        history.push(`AI: ${message.text}`);
    });

    console.log(`[buildHistory] ${history.length} rows`);

    return history.reverse().join('\n');
  };

  const init = async () => {
    await getUserAPIKey();
    await loadChatMessages();
  };

  useEffect(() => {
    navi.setOptions({headerShown: false});
    init();
  }, [])

  const onSend = useCallback(async (input = []) => {
    let query = input[0].text;
    if(!query) return;
    if(!settings.openaiKey) 
      return Alert.alert('Error', 'You need to set your OpenAI API key in settings');
    try {
      const msg = buildMessage(query, false);
      setMessages(previousMessages => GiftedChat.append(previousMessages, msg));
      setMessages(previousMessages => saveChatHistory(previousMessages, false));
      await sleep(200);

      const history = buildHistory();
      let result = null;
      if(query.startsWith('!')) {
        if(!settings.serpApiKey)
          return Alert.alert('Error', 'You need to set your SERP API key in settings');
        query = query.replace('!', '');
        const response = await serpResult(query, settings.serpApiKey);
        console.log(`We got response from SERP:`, response)
        result = await processSerpResults(query, response, settings.openaiKey);
      } else {
        result = await askGPT(query, history, settings.openaiKey, settings.model);
      }

      if(result.error) {
        return Alert.alert('Error', result.message);
      }

      setMessages(previousMessages => GiftedChat.append(previousMessages, buildMessage(result.result, true)));
      setMessages(previousMessages => saveChatHistory(previousMessages));
    } catch (e) {
      console.log(e);
      Alert.alert('Error', e.message);
    }
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} />
      <View style={styles.chatTitle}>
        <Text style={styles.chatTitleText}>{chatTitle || "Test"}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navi.navigate('ChatList')}>
          <Text style={styles.chatTitleText}>
            ←
          </Text>
        </TouchableOpacity>
      </View>
      <GiftedChat
        style={styles.chat}
        messages={messages}
        onSend={messages => onSend(messages)}
        listViewProps={{
          style: styles.chat2,
        }}
        user={{
        _id: 1
      }}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatTitle: {
    marginTop: 50,
    paddingTop: 10,
    fontSize: 20, fontWeight: 'bold', textAlign: 'center',
    
    backgroundColor: '#000',
    height: 50,
  },
  chatTitleText: {
    fontSize: 20, fontWeight: 'bold', textAlign: 'center',
    color: '#fff',
  },

  backButton: {
    position: 'absolute',
    left: 10,
    top: 10,
  },

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: 0
  },
  chat: {
    backgroundColor: "#fff",
    margin: 0,
    flex: 1,
    
  },
  chat2: {
    backgroundColor: "#fff",
    marginTop: -50,
  }
});

export default ChatRoomScreen;