import React, { useEffect, useState } from "react";
import PVQ_BORDER from "../assets/PVQ_BORDER.png";
import { View, ScrollView, StyleSheet, Image, Text, Dimensions, ActivityIndicator, Button } from "react-native";
import { Svg, Path } from 'react-native-svg';
import * as d3 from 'd3-shape';

import globalProps from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import propsHeaderButtons from "../components/props_header_buttons.js";

import ApiRequestor from '../ApiRequestor.js';
import Carousel from 'react-native-snap-carousel';

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAuth } from '../AuthContext';

/*
* The 'user profile' page. This page displays another user's profile. This page is navigated to from the Matches and 
  Search page, and perhaps the Messages and Chat page as well.

* Props:
    > navigation: the navigation object.
*/
function UserProfile({ navigation, route })
{
    const { userData, setUserData } = useAuth();

    const [pvqPNG , setPVQ_PNG] = useState();
    const [heartClicked, setHeartClicked] = useState(false);
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);


    const fetchTheRestOfThisUsersInformation = async () => {
        //matches page only gets some user data, so we can get the rest of it now 
        const fetchResponse = await ApiRequestor.getUserFromId(user._id);
        return fetchResponse;
    } 
    const [user, setOpenedUser] = useState(route.params.user);
    const [ENTRIES, setEntries] = useState([]);
    const handleLike = async () => {  
        //redo this check, just for safety
        let liked = false;
        for (let i = 0; i < userData.likes.length; i++)
        {
            if (userData.likes[i] == user._id)
            {
                liked = true;
            }
        }
        if (!liked)
        {
            setHeartClicked(true); 
            const fetchResponse = await ApiRequestor.likeProfile(userData._id, user._id);
            setUserData(
                (prev) => {
                     return { 
                        ...prev, 
                        likes: fetchResponse.updatedLikes, 
                        matches: fetchResponse.updatedMatches, 
                        analytics: { ...prev.analytics, likesFromYou: prev.analytics.likesFromYou + 1 } 
                    }
                }
            );
            // validatedUser.likes = fetchResponse.updatedLikes; // Never update state variables directly. Always use the set function.
            // validatedUser.matches = fetchResponse.updatedMatches;
            //console.log(fetchResponse.matchedNotification)
            if (fetchResponse.matchedNotification !== null)
            { 
                setPropsPopUpMsg(
                    {
                        title: "It's a match!",
                        message: "Shoot them a message and get something started!",
                        buttons: [
                            { text: "OK" }
                        ]
                    }
                );
            }
            //console.log(fetchResponse);
        }
        else
        {
            console.log("unlike is not allowed here, we could put it somewhere else though") 
        }
    };

    useEffect(() => {
        //check if user is liked, then set like button
        for (let i = 0; i < userData.likes.length; i++)
        {
            if (userData.likes[i] == user._id)
            {
                setHeartClicked(true)
            }
        }

        fetchTheRestOfThisUsersInformation().then((response) => {
            //console.log(response.email);
            // Update relevant things that need updating (duh)
            setPVQ_PNG(response.svg);
            setEntries(prevEntries => {
                const updatedImages = response.images
                    .filter(image => image !== "") // && image !== user.firstImage
                    .map(image => ({ image }));
                return [...prevEntries, ...updatedImages];
            });
            setOpenedUser(response);
        });
    }, []);
    
    const renderItem = ({ item, index }) => {
        return (
            <View style={{width: "100%", aspectRatio: 1/1.5, backgroundColor: "rgba(155, 155, 155, 0.5)", borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                    
                    <Image source={{uri: item.image}} style={{height: '100%', aspectRatio: 1/1.5}}></Image>

                    <View style={{ position: 'absolute', bottom: 0, left: 0, padding: 10 }}>
                        <Text style = {{ fontSize: 30, fontWeight: 'bold', color: 'white' }}>{user.name}</Text>
                    </View>

                    <View style={{ position: 'absolute', top: 0, right: 0, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style = {{ fontSize: 30, fontWeight: 'bold', color: 'white' }}>{index}</Text>
                    </View>
                    
                </View> 
        );
    };

 

    return (
        <View style={{height: "100%"}}>
        <PageContainer 
            navigation = { navigation } 
            propsLeftHeaderButtons = {[ propsHeaderButtons.back ]}
            propsPopUpMsg={propsPopUpMsg}
        >
 
                <View style={{padding: 20, gap: 20, alignItems: 'center'}}> 
                    <Carousel layout={'tinder'}
                        ref={(c) => { this._carousel = c; }}
                        data={ENTRIES}
                        renderItem={renderItem}
                        sliderWidth={Dimensions.get('window').width}
                        itemWidth={Dimensions.get('window').width - 50}
                    /> 
                </View>
                {
                    user.description === undefined ? (
                        <View style={styles.activityIndicatorStyle}> 
                            <ActivityIndicator size="large" style={{opacity: 0.25}} color="#FFF" /> 
                        </View> 
                    ) : (
                    <View style={{flex: 1}}>
                        <View style={{paddingLeft: 10, paddingRight: 10}}>
                            <View style={{padding: 10, width: "100%", backgroundColor: "rgba(155, 155, 155, 0.2)", borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                                {/* <TextStandard
                                    style = {{ 
                                        fontSize: 20,
                                        color: 'white',
                                        fontWeight: 'bold',
                                    }}
                                    text = "Bio"
                                />  */}
                                <TextStandard 
                                    style = {{ 
                                        fontSize: 12,
                                        color: 'white',
                                    }}
                                    text = {user.description}
                                /> 
                            </View>
                        </View>
                        
                        <View>
                                
                            <View style={{width: "100%", aspectRatio: 1, padding: 20, borderRadius: 10, justifyContent: "center", alignItems: "center"}}>
                                <Image resizeMode="contain" source={PVQ_BORDER} style={{width: '100%',  aspectRatio: 1, position: 'absolute'}}></Image>
                                <Image source={{uri: user.images[0]}} style={{width: 120, aspectRatio: 1, position: 'absolute', borderRadius: 999}}></Image>
                                <Image source={{uri: user.pvqPNG}} style={{width: '76.92%', aspectRatio: 1, position: 'absolute'}}></Image>
                                <Image source={{uri: userData.pvqOutlinePNG}} style={{width: '76.92%', aspectRatio: 1, position: 'absolute'}}></Image>
                            </View>
                        
                        </View> 

                        <View> 
                            { 
                                user.images.map((item, index) => (
                                    index !== 0 && item !== "" ? (
                                        <View key={index} style={styles.photoContainer}>
                                            <Image
                                                key={index}  
                                                source={{ uri: item }}
                                                style={styles.profilePhoto}
                                                resizeMode="cover"
                                            />
                                        </View>
                                    ) : null
                                ))  
                                
                            }
                        </View>
                    </View>
                    )
                } 
            
        </PageContainer>
        {/* Heart button */} 
        <View style={{position: 'absolute', bottom: 80, right: 20}}>
            <TouchableOpacity onPress={handleLike}>
                <MaterialCommunityIcons
                    name={heartClicked ? "heart" : "heart-outline"}
                    size={100}
                    color={heartClicked ? "pink" : "white"}
                />
            </TouchableOpacity>
        </View>
        </View>
    );
}




const styles = StyleSheet.create(
    {
        profileContainer: {
            alignItems: "center",
            marginTop: 20
        },
        profilePhoto: {
            width: "100%", 
            aspectRatio: 1/1.5, 
            backgroundColor: "rgba(155, 155, 155, 0.5)", 
            borderRadius: 10, 
            overflow: 'hidden', 
            position: 'relative',
        },
        descriptionText: {
            fontSize: 18,
            textAlign: "center"
        },
        activityIndicatorStyle: {
            width: '100%', 
            height: '100%', 
            justifyContent: 'center', 
            alignItems: 'center'
        },
        photoContainer: {padding: 10}, 
        heartButton: {   
            backgroundColor: 'transparent',
            bottom: 80
        }
    }
);

export default UserProfile;