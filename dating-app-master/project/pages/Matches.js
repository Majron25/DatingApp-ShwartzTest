import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image, FlatList } from "react-native";

import globalProps from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import ApiRequestor from "../ApiRequestor.js";
import { useAuth } from "../AuthContext.js";
import { useState, useEffect } from "react"; 
import MatchContainerForMatchesPage from "../components/MatchContainerForMatchesPage.js";
import utils from "../utils/utils.js"; 

/*
* The search page. This page displays a list of all the user's potential matches, in accordance with their set 
  preferences. The user should be able to sort their potential matches by age, height, PVQ score, name (alphabetical), 
  and any other relevant characteristic. A 'shuffle' button that randomises the list might also be a good idea. It might
  also be a good idea to have a button that links to the preferences page so that the user doesn't have to go to the 
  account page first.

* Props:
    > navigation: the navigation object.
*/
function Matches({ navigation })
{

    const [users, setUsers] = useState();
 
    const [ selectedMatch, setSelectedMatch ] = useState("");
    const { userData } = useAuth();
     

    const handleClickProfile = (match) =>
    {
        navigation.navigate('userProfile', { user: match });
    }
 

    useEffect(() => {
        const fetchUsers = async () => { 
            // console.log("bruh " + userData._id)
            // console.log("userData._id is a " + typeof userData._id);
            const fetchResponse = await ApiRequestor.getMatchedUsersFromId(userData._id); 
            //console.log("BRUHHHHHHH")
            //console.log(users.length)
            // console.log(fetchResponse); // Stop logging users cause the images are in the objects, which will clutter and/or crash your terminal.
            return fetchResponse;
        }

        fetchUsers().then((users) => { 
             
            setUsers(users)
        }); 

    }, []);

    // setCurrentUser(useAuth().userData._id);

    return (
        <PageContainer
            navigation = { navigation } 
            // style = {{ justifyContent: "center", alignItems: "center" }}
            isScrollable = { false }
        >  
            {
                users === undefined ? (
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" style={{ opacity: 0.25 }} color="#FFF" />
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
                    
                    users && (
                        <FlatList
                            data = { users }
                            renderItem = {
                                ({item}) =>
                                {
                                    return ( 
                                        <MatchContainerForMatchesPage
                                            match = { item } 
                                            handleClickMatch = { handleClickProfile }  
                                        />
                                    )
                                }
                            }
                            keyExtractor = { (match) => match._id }
                            // nestedScrollEnabled
                            showsVerticalScrollIndicator = { false }
                            numColumns = { 1 }
                            contentContainerStyle = { styles.matchesContainerScroll }
                            //columnWrapperStyle = {{ justifyContent: 'space-between' }}
                            // ItemSeparatorComponent = {
                            //     () => <View style={{ height: 12, backgroundColor: 'transparent' }}/>
                            // }
                            //onEndReached = { loadMoreMatches }
                        />
                    )
                    
                )
                }
                
        </PageContainer>
    );
}

const styles = StyleSheet.create(
    {

        matchesContainer: {
            flex: 1, 
            //flexGrow: 1,
            width: '100%',
            justifyContent: 'center', 
            //alignItems: 'center', 
            borderRadius: 10, 
            //padding: 15,
            overflow: "hidden",
            backgroundColor: "red"
        },
        matchesContainerScroll: {
            width: "100%",
            flexDirection: 'column', 
            // flexWrap: 'wrap', 
            flexGrow: 1,
            rowGap: 12,
            //justifyContent: "space-between"
        },
    }
);

export default Matches;