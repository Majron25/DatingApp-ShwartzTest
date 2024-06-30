import React, { useState, useContext } from 'react';
import { View, StyleSheet, } from "react-native";

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js';
import SliderSingleStandard from '../../components/SliderSingleStandard.js';
import { heightRange } from '../../shared_data.js';
import utils from '../../utils/utils.js';
import { useAuth } from '../../AuthContext.js';

/*
* This page let's the user know that their account has been created.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountCompleted({ navigation })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const { userData } = useAuth();

    const handleContinue = () =>
    {
        navigation.navigate("createAccountQuizIntro");
    }

    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between" }}
            showNavBar = { false }
            propsLeftHeaderButtons = { [] }
            propsRightHeaderButtons = { [ propsHeaderButtons.settingsLoggedOut ] }
        > 
            <View>
                <TextStandard 
                    text = "Account Created!" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = { `${validatedUser.name}, your account has been created!` } 
                    size = { 0 }
                    style = { styles.instruction }
                />

                <TextStandard 
                    text = "It's almost time to start matching."
                    size = { 0 }
                    style = { styles.instruction }
                />  

                <TextStandard 
                    text = "Click the button below to continue."
                    size = { 0 }
                    style = { styles.instruction }
                />
            </View>

            <View style = { styles.conBottom }>
                <ButtonStandard 
                    text = "CONTINUE" 
                    sizeText = { 1 }
                    isBold
                    onPress = { handleContinue } 
                    style = {{ 
                        ...styles.btnContinue
                    }}
                />
            </View>

        </PageContainer>
    );
}

const styles = StyleSheet.create(
    {
        conBottom:
        {
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: utilsGlobalStyles.spacingVertN(1)
        },
        btnContinue:
        {
            width: "100%",
            padding: 10,
            borderRadius: globalProps.borderRadiusStandard
        },
        instruction:
        {
            textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1)
        }
    }
);

export default CreateAccountCompleted;