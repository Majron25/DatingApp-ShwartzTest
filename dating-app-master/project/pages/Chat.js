import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, Text, Image, ActivityIndicator } from "react-native";

import propsHeaderButtons from '../components/props_header_buttons.js';
import TextStandard from "../components/TextStandard.js";
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";

import { useContext, useEffect, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import ThemeContext from "../contexts/ThemeContext.js";
import globalProps,  { globalThemes } from '../styles_global';

import { useAuth } from "../AuthContext.js";

import ApiRequestor from "../ApiRequestor.js"; 

import socket from "../utils/socket.js";

/*
* The chat page. This page displays a conversation between the user and one of their matches.

* Props:
    > navigation: the navigation object.
*/


function formatTime(sentAt) {
    const messageTime = new Date(sentAt);
  
    // Format the time as HH:mm
    const formattedTime =
      messageTime.getHours().toString().padStart(2, '0') +
      ':' +
      messageTime.getMinutes().toString().padStart(2, '0');
  
    return formattedTime;
}


function Chat({ navigation, route })
{

  const reciever = route.params.reciever;
  const { userData } = useAuth();
  const userID = userData._id;

  const chatID = reciever._id < userID ? reciever._id + "_" + userID : userID + "_" + reciever._id;

  const [messages, setMessages] = useState([]); 
  const [isTyping, setIsTyping] = useState(false);
  const [matchTyping, setMatchTyping] = useState(false);
  const [messageText, setMessageText] = useState(""); 
  const [tappedMessageIndex, setTappedMessageIndex] = useState(-1);

  const { themeName } = useContext(ThemeContext);
  let theme = globalThemes[themeName];

  const fetchMessages = async () => {
    const fetchResponse = await ApiRequestor.getMessages(chatID); 
    return fetchResponse;
  }

  useEffect(() => {

    socket.on('connect_error', (error) => {
      // console.log('Connection Error:', error);
    });

    socket.on('connect', () => {
      // console.log('Connected to the server');
    });

    socket.on('message', (message) => {
      // console.log('Message from server:', message);
    });

    socket.on('isTyping', (isTyping) => {
      setMatchTyping(isTyping.status);
    });

    socket.on('receiveMessage', (message) => {
      // console.log('Received:', message);
      if (messages[0] === -1) {
        setMessages([message]);
      } else {
      setMessages(prevMessages => [...prevMessages, message]);
      }
    });
  
    socket.on('disconnect', () => {
      // console.log('Disconnected from the server');
    });

    socket.emit('initialize', { userID: userID, chatId: chatID });
    socket.emit('joinRoom', { chatId: chatID });
    // console.log(`User ${socket.id} initialized with userID ${userID} and chatId ${chatID}`);

    fetchMessages().then((response) => {
        response.length === 0 ? setMessages([-1]) : setMessages(response)
    });

}, []);

useEffect(() => {
  // console.log("MESSAGES", messages);
}, [messages]);


function sendMessageToServer(message) {
  socket.emit('sendMessage', { userID, chatID, message });
}

// function emitTyping() {
//   console.log("c - isTyping: " + isTyping);
//   socket.emit('isTyping', { userID, chatID, isTyping });
// }

useEffect(() => {
  // console.log("TYPING", isTyping);
  socket.emit('isTyping', { userID, chatID, isTyping });
}, [isTyping]);


function sendMessage() {

  const messageToSend = messageText.trim();

  if (messageToSend === "") { return }

  sendMessageToServer(messageToSend);

  setMessageText("");
  setMessages(prevMessages => [...prevMessages, { message: messageToSend, sender: userID, sentAt: Date.now() }]);

  const sendToDatabase = async () => {
    const fetchResponse = await ApiRequestor.sendMessage(chatID, messageToSend, userID, reciever._id); 
    return fetchResponse;
  }

  sendToDatabase().then((response) => {
    if (response) {

      fetchMessages().then((response) => {
        response.length === 0 ? setMessages([-1]) : setMessages(response)
    });
    }
  });
}

    return (
        <PageContainer
            showNavBar = { false }
            showHeader = { false }
            navigation = { navigation } 
            isLoading = { (messages.length !== 0) ? false : true}
            style = {{ paddingTop: 10 }}
        >
            
            <View style={{backgroundColor: theme.content, borderRadius: 10, flexDirection: 'row', alignItems: 'center', padding: 8, gap: 5, justifyContent: 'space-between'}}>
              <TouchableOpacity onPress = { () => navigation.goBack() } style={{padding: 5, borderRadius: 10}}>
                <Ionicons name="chevron-back" size={globalProps.sizeIconHeaderFooter} color={theme.iconHeader} />
              </TouchableOpacity>
              
              <TextStandard
                text={reciever.name}
                style={{marginLeft: 10}}
                isBold size = { 2 }
              />

              <View style={{backgroundColor: theme.navBar, borderRadius: 10, width: 55, overflow: 'hidden'}}>
                  <Image source={{uri: reciever.images[0]}} style={{width: 55, height: 55, resizeMode: "cover"}}></Image>
              </View>
            </View>


<View style={styles.container}>

<View style={styles.messagesContainer}>
  {messages.length > 0 ? (
    messages[0] !== -1 ? (
    // messages.map((item, index) => (
    //   <View key={index} style={[styles.messageWrapper, item.sender === userID ? styles.alignRight : styles.alignLeft]}>
    //     <View>
    //       <Text style={[styles.text, {color: "black"}, item.sender === userID ? [{backgroundColor: theme.navBar}, styles.senderBubble] : [{backgroundColor: "rgba(128, 128, 128, 0.25)"}, styles.receiverBubble]]}>{item.message}</Text>
    //       <Text style={[styles.messageTime, item.sender === userID ? styles.alignRight : styles.alignLeft ]}>{formatTime(item.sentAt)}</Text>
    //     </View>
    //   </View>
    // )

    messages.map((item, index) => (
      <TouchableOpacity style={{width: "100%"}} key={index} onPress={() => { tappedMessageIndex === index ? setTappedMessageIndex(-1) : setTappedMessageIndex(index) }} >
          <View style={[ styles.messageWrapper, item.sender === userID ? [styles.alignRight] : [styles.alignLeft]]} >
              <View>
                  <Text style={[styles.text, {color: theme.fontChatMessages}, item.sender === userID ?  [{backgroundColor: theme.chatBoxYou, opacity: 0.75}, styles.senderBubble] : [{backgroundColor: theme.chatBoxThem, opacity: 0.75}, styles.receiverBubble]]}>
                      {item.message}
                  </Text>
                  {/* Only display the sentAt time if this message is the tapped one */}
                  {tappedMessageIndex === index && 
                      <Text style={[styles.messageTime, item.sender === userID ? styles.alignRight : styles.alignLeft, {color: theme.font} ]}>
                          {formatTime(item.sentAt)}
                      </Text>
                  }
              </View>
          </View>
      </TouchableOpacity>
    )
    )
    ) : (
      <View style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>
      <TextStandard text="Start a conversation :)" />
      </View>
    )
  ) : (
    <View style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>
      {/* <ActivityIndicator size="large" style={{opacity: 0.25}} color="#FFF" /> */}
      </View>
  )}
</View>

<View style={[{position: "absolute", bottom: 70, left: 10}, matchTyping ? {opacity: 80} : {opacity: 0}]}>
  <TextStandard text={`${reciever.name} is typing...`}/>
</View>
<View style={[styles.inputContainer, {backgroundColor: theme.navBar, position: "absolute", bottom: 0, left: 0, height: 60, borderRadius: 20}]}>
  <View style={styles.textInputWrapper}>
    <TextInput
      onFocus = { () => {} }
      onBlur = { () => { setIsTyping(false) } }
      style= {{ ...styles.textInput, color: theme.font }}
      onChangeText={(text) => {setMessageText(text); text.length > 0 ? setIsTyping(true) : setIsTyping(false)}}
      value={messageText}
      placeholder="Send your message"
      placeholderTextColor = {theme.font}
    />
    <TouchableOpacity onPress={sendMessage} style={{padding: 10}}>
      <Ionicons name="send" size={20} color={theme.font} />
      {/* <Text style={{color: "black", padding: 10}}>
        SEND
      </Text> */}
    </TouchableOpacity>
  </View>
</View>

</View>

        </PageContainer>
    );
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: 'space-between',
          },
          messagesContainer: {
            flex: 1,
            justifyContent: 'flex-start', // Changed from 'center'
            alignItems: 'center',
            paddingTop: 10,
          },
          messageWrapper: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            width: '100%',
            paddingHorizontal: 10,
            marginBottom: 10,
          },
          text: {
            fontSize: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
          },
          messageTime: {
            fontSize: 12,
            alignSelf: 'flex-end',
            color: 'black',
            marginTop: 5,
          },
          senderBubble: {
            borderBottomRightRadius: 0,
          },
          receiverBubble: {
            borderBottomLeftRadius: 0,
          },
          alignLeft: {
            justifyContent: 'flex-start',
            alignSelf: 'flex-start'
          },
          alignRight: {
            justifyContent: 'flex-end',
            alignSelf: 'flex-end'
          },
          inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 0,
            paddingBottom: 0,
          },
          textInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 10,
            paddingLeft: 10, 
            paddingRight: 10, 
          },
          textInput: {
            flex: 1,
            height: 40,
            paddingHorizontal: 16,
            fontSize: 16,
            backgroundColor: 'transparent',
          },
          idInputContainer: {
            flexDirection: 'row',
            justifyContent: 'center', // Updated justifyContent to center
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingTop: 10,
          },
          idInput: {
            width: 100, // Added width for the input fields
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            fontSize: 16,
            backgroundColor: '#FFFFFF',
            marginRight: 10,
          },
          swapButton: {
            paddingHorizontal: 10,
            justifyContent: 'center',
          },
          saveButton: {
            paddingHorizontal: 15,
            justifyContent: 'center',
            backgroundColor: '#759CC9',
          },
    }
);

export default Chat;