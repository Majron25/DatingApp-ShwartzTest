import React from "react";
import { View, ScrollView, StyleSheet, Button } from "react-native";
import PropTypes from 'prop-types';
import { useContext } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import propsHeaderButtons from '../components/props_header_buttons.js';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import ButtonStandard from "../components/ButtonStandard.js";
import ButtonNextPage from "../components/ButtonNextPage.js";
import PageContainer from "../components/PageContainer.js";
import { useAuth } from "../AuthContext.js";
//import { PopUpOk } from "../components/PopUpStandard.js";

/*
* The settings page. This page should include functionality to change the app's theme, manage notifications, etc.

* Props:
    > navigation: the global navigation object.
    > loggedOut: whether the user is not signed in.
*/
function Settings({ navigation, loggedOut })
{
    // The name of the current theme and the function that handles updating it.
    const { themeName, updateTheme } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const { logOut, userData } = useAuth();

    const handleLogoutPressed = async () => {

        await logOut(navigation);
    };

    return (
        <PageContainer
            navigation = { navigation } 
            showNavBar = { !loggedOut }
            propsLeftHeaderButtons = { [ propsHeaderButtons.back ] }
            // propsRightHeaderButtons = { loggedOut ? [] : [ propsHeaderButtons.account ] }
        >
            <ButtonNextPage 
                text = "Themes" 
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "theme-light-dark" color = { theme.borders } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => navigation.navigate(loggedOut ? "settingsThemesLoggedOut" : "settingsThemes") }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN() }}
            />

            {/* The user must be logged-in to edit their preferences. */}
            {
                !loggedOut && (
                    <ButtonNextPage 
                        text = "Preferences" 
                        sizeText = { 1 } isBold
                        icon = { 
                            <MaterialCommunityIcons 
                                name = "account-filter" color = { theme.borders } 
                                size = { globalProps.sizeIconHeaderFooter } 
                            /> 
                        }
                        onPress = { () => navigation.navigate("settingsPrefs") }
                        style = {{ marginBottom: utilsGlobalStyles.spacingVertN() }}
                    />
                )
            }

            {/* The user must be logged-in to view their PVQ answers */}
            {
                !loggedOut && (
                    <ButtonNextPage
                        text = "Values Quiz"
                        sizeText = { 1 } isBold
                        icon = { 
                            <MaterialCommunityIcons 
                                name = "heart-cog" color = { theme.borders } 
                                size = { globalProps.sizeIconHeaderFooter } 
                            /> 
                        }
                        onPress = { () => navigation.navigate("pvqPage") }
                        style = {{ marginBottom: utilsGlobalStyles.spacingVertN() }}
                    />
                )
            }

            {/* The user must be logged-in to view their PVQ answers */}
            {
                !loggedOut && (
                    <ButtonNextPage
                        text = "Delete Profile"
                        sizeText = { 1 } isBold
                        icon = { 
                            <MaterialCommunityIcons 
                                name = "heart-broken" color = { theme.borders } 
                                size = { globalProps.sizeIconHeaderFooter } 
                            /> 
                        }
                        onPress = { () => navigation.navigate("deleteAccount") }
                        style = {{ marginBottom: utilsGlobalStyles.spacingVertN() }}
                    />
                )
            }

            {/* The user must be logged-in to Log-out of the app*/}
            {
                !loggedOut && (
                    <ButtonStandard
                        text="Log Out"
                        sizeText={1} isBold
                        icon={
                            <MaterialCommunityIcons
                                name="logout" color={theme.borders}
                                size={globalProps.sizeIconHeaderFooter}
                            />
                        }
                        onPress={handleLogoutPressed}
                        style={{
                            ...styles.btnLogOut,
                        }}
                    />
                    )
                }

        </PageContainer>
    );
}


Settings.propTypes =
{
    navigation: PropTypes.object.isRequired,
    loggedOut: PropTypes.bool,
};

Settings.defaultProps =
{
    loggedOut: false
};

const styles = StyleSheet.create(
    {
        btnLogOut: {
            marginBottom: utilsGlobalStyles.spacingVertN(),
            borderRadius: globalProps.fontSizeBase,
            padding: 10
        }
    }
);

export default Settings;