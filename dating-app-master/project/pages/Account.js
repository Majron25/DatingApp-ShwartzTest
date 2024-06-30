import { useState, useEffect } from 'react';
import PVQ_BORDER from '../assets/PVQ_BORDER.png';
import { View, StyleSheet, Button, Image } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext } from "react";
import { StackActions } from '@react-navigation/native';

import propsHeaderButtons from '../components/props_header_buttons.js';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import TextInputStandard from '../components/TextInputStandard.js';
import ButtonStandard from "../components/ButtonStandard.js";
import ButtonNextPage from "../components/ButtonNextPage.js";
import PageContainer from "../components/PageContainer.js";
import { useAuth } from "../AuthContext";
import utils from '../utils/utils.js';
import { LinearGradient } from 'expo-linear-gradient';

/*
* The account page. This page displays information regarding the user's account, such as their name, profile picture/s, 
  age, height, PVQ score etc. All of this data should be editable. The user should also be able to redo the PVQ test. 
  Additional features could include switching accounts, managing subscriptions (eventually), etc.

* Props:
    > navigation: the navigation object.
*/
function Account({ navigation, loggedOut})
{
    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const { userData } = useAuth();
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    // Handles logging out once the button is pressed. A popup is shown in order to confirm logging out, to reduce
    // accidental log outs.
    const handleLogoutPressed = () => {
        setPropsPopUpMsg(
            {
                title: "Logout?",
                message: "Are you sure you want to logout?",
                buttons: [
                    { text: "LOGOUT", onPress: () => { navigation.dispatch(StackActions.popToTop()); navigation.replace("landing") }},
                    { text: "CANCEL"},
                ]
            }
        )
    };

    return (
        <PageContainer 
            navigation = { navigation }
            showNavBar = { !loggedOut }
            propsRightHeaderButtons = { [ ] }
            propsPopUpMsg = { propsPopUpMsg }
            isLoading = { !userData }
        >

            <TextStandard
                    text = { userData?.name }
                    size= { 2 }
                    isBold
                    style = {{
                        textAlign: "center"
                    }}
            />
            {/* <View style={styles.profileContainer}>
                <Image
                    source={{uri:userData.images[0]}}
                    style={styles.profilePhoto}
                />
            </View> */}

            <View style={{width: "100%", aspectRatio: 1, padding: 0, borderRadius: 10, justifyContent: "center", alignItems: "center"}}>
                <Image resizeMode="contain" source={PVQ_BORDER} style={{width: '100%',  aspectRatio: 1, position: 'absolute'}}></Image>
                <Image source={{uri: userData?.images[0]}} style={{width: 120, aspectRatio: 1, position: 'absolute', borderRadius: 999}}></Image>
                {
                    (userData?.pvqPNG) && (
                        <Image 
                            source={{uri: userData?.pvqPNG}} 
                            style={{width: '76.92%', aspectRatio: 1, position: 'absolute'}}
                        >
                        </Image>
                    )
                }
            </View>

            <ButtonNextPage 
                text = "Preferences" 
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "account-filter" color = { theme.iconButtonNextPage } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => navigation.navigate("settingsPrefs") }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN(-1) }}
            />

            <ButtonNextPage 
                text = "Update Account" 
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "account-wrench-outline" color = { theme.iconButtonNextPage } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => navigation.navigate("updateProfile") }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN(-1) }}
            />

            <ButtonNextPage
                text = "Values Quiz"
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "heart-cog" color = { theme.iconButtonNextPage } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => navigation.navigate("pvqPage") }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN(-1) }}
            />

            <ButtonNextPage 
                text = "Analytics" 
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "google-analytics" color = { theme.iconButtonNextPage } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => navigation.navigate("analytics") }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN(-1) }}
            />

            <TextStandard
                text = "Settings"
                size= { 2 }
                isBold
                style = {{
                    textAlign: "center", marginBottom: globalProps.spacingVertBase
                }}
            />

            <ButtonNextPage 
                text = "Themes" 
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "theme-light-dark" color = { theme.iconButtonNextPage } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => navigation.navigate(loggedOut ? "settingsThemesLoggedOut" : "settingsThemes") }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN(-1) }}
            />

            <ButtonNextPage 
                text = "Change password" 
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "form-textbox-password" color = { theme.iconButtonNextPage } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => navigation.navigate("changePassword") }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN(-1) }}
            />  

            <ButtonNextPage
                text = "Delete Profile"
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "heart-broken" color = { theme.iconButtonNextPage } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => navigation.navigate("deleteAccount") }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN(-1) }}
            />

            <ButtonNextPage
                text = "Log Out"
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "logout-variant" color = { theme.iconButtonNextPage } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { handleLogoutPressed }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN(-1) }}
            />
            
            <ButtonNextPage
                text = "Privacy"
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "security" color = { theme.iconButtonNextPage } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => navigation.navigate("settingsPrivacy") }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN() }}
            />

        </PageContainer>
    );
}

const styles = StyleSheet.create(
    {
        profileContainer: {
            alignItems: "center",
            marginTop: 20
        },
        profilePhoto: {
            width: 200,
            height: 200,
            borderRadius: 100,
            marginBottom: 10
        },
        linearGradientButton:
        {
            width: "100%", 
            //alignContent: "center",
            borderRadius: 100,  
        }, 
    }
);

export default Account;