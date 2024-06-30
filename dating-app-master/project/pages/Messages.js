import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from "react-native";

import globalProps, { globalThemes } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import ApiRequestor from "../ApiRequestor.js";
import { useAuth } from "../AuthContext.js";
import { useState, useEffect, useContext } from "react";
import ThemeContext from "../contexts/ThemeContext.js";
 
/*
* The messages page. This page displays all of the conversations the user has had with their matches. UI should be 
  similar to most standard messaging apps, such as a list of all the conversations, a button to start a new conversation,
  etc.

* Props:
    > navigation: the navigation object.
*/
function Messages({ navigation })
{

    const [users, setUsers] = useState();
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const { userData } = useAuth();

    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];


    useEffect(() => {
        const fetchUsers = async () => { 
            // console.log("bruh " + userId)
            // console.log("userId is a " + typeof userId);
            const fetchResponse = await ApiRequestor.getConvosations(userData._id);
            // const fetchResponse = await ApiRequestor.getMatchedUsersFromId(userData._id); 
            // console.log(fetchResponse); // Stop logging users cause the images are in the objects, which will clutter and/or crash your terminal.
            return fetchResponse;
          }

        fetchUsers().then((users) => { 
            setUsers(users.sort((a, b) => new Date(b.latestMessage.time) - new Date(a.latestMessage.time)))
            setIsLoadingMessages(false)
        }); 

    }, []);

    // setCurrentUser(useAuth().userId);

    return (
        <PageContainer
            navigation = { navigation } 
            isLoading = { isLoadingMessages }
            style = {{ rowGap: 20 }}
        > 
            {/* <TextStandard 
                text = "MY MESSAGES" 
                isBold
                style = {{ 
                    textAlign: "center", marginBottom: globalProps.spacingVertBase 
                }}
            />  */}
            {
                users === undefined ? (
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    {/* <ActivityIndicator size="large" style={{ opacity: 0.25 }} color="#FFF" /> */}
                </View>
                ) : users.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <TextStandard 
                        text="No matches yet. Don't give up!" 
                        style = {{
                            textAlign: "center", marginBottom: globalProps.spacingVertBase 
                        }}
                    />
                </View>
                ) : (
                users.map((item, index) => {
                    return (
                    userData._id === item._id ? null : (
                        <TouchableOpacity
                        onPress={() => navigation.navigate('chat', {
                            reciever: item,
                        })}
                        key={index}
                        style={{
                            flexDirection: 'row',
                            // marginBottom: 10,
                            padding: 10,
                            gap: 10,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: theme.borders,
                            borderRadius: 10,
                            backgroundColor: `${theme.content}AA`,
                        }}
                        >
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 10, width: 55, aspectRatio: 1, overflow: 'hidden' }}>
                            <Image source={{ uri: item.images[0] }} style={{ height: 55, width: 55, resizeMode: 'cover' }} />
                        </View>
                        <View style={{flex: 1, gap: 4}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <TextStandard isBold text={item.name} />
                                <TextStandard text={item.latestMessage.time ? new Date(item.latestMessage.time).toLocaleTimeString("en-us", { hour: '2-digit', minute:'2-digit' }) : " "}/>
                            </View>
                            <TextStandard italicise text={item.latestMessage.content} />
                        </View>
                        </TouchableOpacity>
                    )
                    );
                })
                )}
                
        </PageContainer>
    );
}

const styles = StyleSheet.create(
    {

    }
);

export default Messages;