import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import PropTypes from 'prop-types';
import { useContext } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { SelectList } from "react-native-dropdown-select-list";

import propsHeaderButtons from '../components/props_header_buttons.js';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import Container from "../components/Container.js";
import { useAuth } from "../AuthContext.js";
import ApiRequestor from "../ApiRequestor.js";
import utils from "../utils/utils.js"; 
import CheckBox from 'react-native-check-box'
import { LinearGradient } from "expo-linear-gradient";

/*
* The page on which the user can edit their preferences/filters.

* Props:
    > navigation: the global navigation object.
*/
function SettingsPrivacy({ navigation })
{
    // The name of the current theme and the function that handles updating it.
    const { themeName, updateTheme } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ isLoading, setIsLoading ] = useState(false);

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const { userData, setUserData, authToken } = useAuth();

    const [ stAllowUnmatchedMessages, setAllowUnmatchedMessages ] = useState(userData.settings.privacy.allowUnmatchedMessages);

    // Returns whether or not there have been any changes.
    const haveThereBeenAnyChanges = () =>
    {
        if (stAllowUnmatchedMessages != userData.settings.privacy.allowUnmatchedMessages) return true;
        //...

        return false;
    };

    const handleSave = async () =>
    {
        if (!haveThereBeenAnyChanges())
        {
            console.log("No changes detected.");
            navigation.goBack();
            return;
        }

        setIsLoading(true);

        const newSettingsPrivacy = { ...userData.settings.privacy, allowUnmatchedMessages: stAllowUnmatchedMessages };

        // Construct update query.
        const queryUpdate = {
            $set: { "settings.privacy": newSettingsPrivacy }
        };

        const response = await ApiRequestor.updateUser(userData._id, queryUpdate);

        if (response.status == 200)
        {
            // Synchronise local user data with that of the server.
            setUserData((prev) => { return { ...prev, settings: { ...userData.settings, privacy: newSettingsPrivacy } } });
        }
        else
        {
            // Maybe display a pop-up indicating that a problem has occurred.
            console.log("Error updating privacy settings.");
        }

        setIsLoading(false);

        navigation.goBack();
    };

    // Props for the pop-up that appears when the user attempts to leave with unsaved changes.
    const propsPopUpUnsavedChanges = 
    {
        title: 'Save Changes?',
        message: "You have unsaved changes. Would you like to save before leaving?",
        buttons: [
            {
                text: "Save and Exit",
                onPress: handleSave,
            },
            {
                text: "Exit Without Saving",
                onPress: () => {
                    navigation.goBack();
                },
            },
            {
                text: "Cancel",
            }
        ]
    };

    const handleCancel = () =>
    {
        if (!haveThereBeenAnyChanges())
        {
            console.log("No changes detected.");
            navigation.goBack();
            return;
        }

        setPropsPopUpMsg(propsPopUpUnsavedChanges);
    };

    // Props that define the 'back' header button for when there have been changes.
    const headerButtonBack = 
    {
        icon: (size, colour) =>
        {
            return (
                <Ionicons 
                    name = "chevron-back-sharp" color = { colour } 
                    size = { size } 
                />
            )
        },
        onPress: (navigation, setPropsPopUp) =>
        {
            setPropsPopUp(propsPopUpUnsavedChanges);
        }
    };

    return (
        <PageContainer
            navigation = { navigation } 
            propsLeftHeaderButtons = { [ haveThereBeenAnyChanges() ? headerButtonBack : propsHeaderButtons.back ] }
            propsRightHeaderButtons = { [ ] }
            style = { styles.container }
            showNavBar = { false }
            isLoading = { isLoading }
            propsPopUpMsg = { propsPopUpMsg }
        >
            <ScrollView
                vertical = { true }
                style = {{ height: 1 }}
                contentContainerStyle = { styles.conStatements }
            >

                <Container>
                    <TextStandard 
                        text = "Unmatched Messages" 
                        size = { 1 } isBold
                        style = { styles.title } 
                    />

                    <CheckBox
                        style = {{ flex: 1, padding: 10, borderWidth: 1, borderRadius: 100, borderColor: theme.borders }}
                        onClick = { () => setAllowUnmatchedMessages(!stAllowUnmatchedMessages) }
                        isChecked = { stAllowUnmatchedMessages }
                        leftText = "Allow Unmatched Messages"
                        leftTextStyle = {{ color: theme.font }}
                        checkBoxColor = { theme.borders }
                    />

                    <TextStandard 
                        text = { unmatchedMessagesDescriptions[stAllowUnmatchedMessages ? 1 : 0] }
                        size = { 0 } italicise style = { styles.description }
                    />
                </Container>

            </ScrollView>

            <View style = {{ ...styles.buttonContainer, borderColor: theme.borders }}>
                <LinearGradient
                    colors={['transparent', 'transparent'  ]}
                    style={{
                        ...styles.linearGradientButton, 
                    }}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }} 
                >
                    <ButtonStandard
                        text = "CANCEL" sizeText = {1}
                        style = {{ ...styles.btnSaveCancel,  backgroundColor: theme.buttonLessVibrant, borderWidth: 1 }}
                        isBold  
                        onPress={handleCancel}
                    />
                </LinearGradient>
                <LinearGradient
                    colors={[theme.buttonMoreVibrant, theme.buttonStandard, theme.buttonLessVibrant ]}
                    style={{
                        ...styles.linearGradientButton, 
                    }}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }} 
                >
                    <ButtonStandard
                        text = "SAVE" sizeText = {1} isBold
                        style = { styles.btnSaveCancel } 
                        onPress={handleSave}
                    />
                </LinearGradient> 
            </View>

        </PageContainer>
    );
}


SettingsPrivacy.propTypes =
{
    navigation: PropTypes.object.isRequired,
};

SettingsPrivacy.defaultProps =
{
};

const styles = StyleSheet.create(
    {
        container:
        {
            paddingHorizontal: 0, paddingVertical: 0
        },
        conStatements:
        {
            flexGrow: 1,
            paddingVertical: utilsGlobalStyles.spacingVertN(),
            paddingHorizontal: utilsGlobalStyles.spacingVertN(-2),
            rowGap: utilsGlobalStyles.spacingVertN(1)
        },
        buttonContainer: 
        {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: utilsGlobalStyles.spacingVertN(-1),
            borderTopWidth: 2
        },
        linearGradientButton:
        {
            width: "45%", 
            //alignContent: "center",
            borderRadius: 100,  
        }, 
        btnSaveCancel: 
        {
            width: "100%",
            padding: 15,
            alignContent: "center",
            borderRadius: 100,  
            backgroundColor: 'transparent',
            borderWidth: 1
        },
        title:
        {
            marginBottom: utilsGlobalStyles.spacingVertN(-2)
        },
        description:
        {
            marginTop: utilsGlobalStyles.spacingVertN(-3)
        },
        containerGender:
        {
            marginTop: utilsGlobalStyles.spacingVertN(-1),
            flexDirection: "row",
            justifyContent: "center",
            columnGap: 30,
        },
        buttonGender: 
        {
            height: 130,
            width: 80
        },
    }
);

const unmatchedMessagesDescriptions = [
    "You can only receive messages from people you have matched with.",
    "You can receive messages from anyone, even those you haven't matched with.",
];

export default SettingsPrivacy;