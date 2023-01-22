import {StyleSheet, Text, View, Button, Pressable, Alert} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat'
import {useState, useEffect, useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
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
import {firebase} from '../config/firebase';
import DefaultData from '../config/default';

// Ger props
const ChatRoomScreen = ({route, navigation}) => {
  let lastId = 0;
  const [messages,
    setMessages] = useState([]);
  const auth = getAuth();
  const navi = useNavigation().getParent('UserStack');

  const firestore = getFirestore(firebase);
  const tbl = collection(firestore, 'chats');
  const user = auth.currentUser;
  const userSettings = doc(firestore, 'settings', user.uid);
  let userAPIKey = null;
  

  const chat = route.params.room;

  const setTitle = (title) => {
    navi.setOptions({headerShown: true});
    navi.setOptions({title});
  };

  const showButton = () => {
    navi.setOptions({
      headerRight: () => (
        <View style={{
          marginRight: 10
        }}>
          <Button
            onPress={() => navi.navigate('ChatList')}
            title="Chat List"
            color="red"/>
        </View>
      )
    });
  };

  const getUserAPIKey = async() => {
    try {
      const userDoc = await getDoc(userSettings);
      const userData = userDoc.data();
      userAPIKey = userData.openaiKey;
      if(!userAPIKey) {
        Alert.alert('Error', 'You need to set your OpenAI API key in settings');
      }
      return userData;
    } catch (e) {
      Alert.alert('Error', 'Could not get user settings');
      console.log(e);
    } finally {
      loadChatMessages();
    }
  };

  const getChatMessages = async (chat_id) => {
    // get all chats from firebase where user is a owner_id
    const q = query(tbl, where('chat_id', '==', chat_id));
    const chats = await getDocs(q);
    const output = [];
    chats.forEach((chat) => {
      output.push(chat.data());
      lastId = chat.data()._id;
    });
    return output;
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
    if (!chat) {
      console.log(`No chat found, loading default text: ${DefaultData.defaultText}`)
      setMessages([buildMessage(DefaultData.defaultText, true)]);
      return;
    } else {
      const chatMessages = await getChatMessages(chat.id);
      if (chatMessages.length > 0) {
        // for()
      }
    }
  };

  const buildHistory = (messages) => {
    let history = [];
    console.log(`GOT GPT HISTORY`,messages)
    messages.forEach((message) => {
      if(message.user._id === 1)
        history.push(`Human: ${message.text}`);
      else
        history.push(`AI: ${message.text}`);
    });

    console.log(`Current History: ${history.join(" | ")}`)

    return history.reverse().join('\n');
  };

  const askGPT = async (text, history) => {
    if(!text || !userAPIKey)
      return;
    let prompt = DefaultData.input;
    prompt = prompt.replace('{human_input}', text);
    prompt = prompt.replace('{history}', buildHistory(history));


    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAPIKey}`

      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [
          '\n', 'Human:', 'AI:'
        ]
      })
    });

    const data = await response.json();
    console.log(`Ask GPT: ${text}`);
    console.log(`Response: ${data.choices[0].text}`);
    return data.choices[0].text
  };

  useEffect(() => {
    getUserAPIKey();

    setTitle('New Chat');
    showButton();

  }, [])

  const onSend = useCallback((messages = []) => {
    const msg = buildMessage(messages[0].text, false);
    setMessages(previousMessages => GiftedChat.append(previousMessages, msg));
    askGPT(messages[0].text, [])
      .then((response) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, buildMessage(response, true)));
      });
  }, [])

  return (<GiftedChat
    messages={messages}
    onSend={messages => onSend(messages)}
    user={{
    _id: 1
  }}/>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default ChatRoomScreen;