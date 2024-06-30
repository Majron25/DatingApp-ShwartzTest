
//old imports 
//import React, { useState, useEffect, useContext, useRef } from 'react';
//import { View, StyleSheet, } from "react-native";

import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Animated, } from "react-native";

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js';

import { useAuth } from '../../AuthContext.js';

//import { useAuth } from '../../LoggedInUser.js'; 
import { LinearGradient } from 'expo-linear-gradient'; 

/*
* This page introduces the user to the PVQ questionnaire and offers them the ability to either start skip it.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountQuizIntro({ navigation })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const { userData, isQuizComplete } = useAuth();

    // If the user completed the quiz.
    let lIsQuizComplete = isQuizComplete();

    // Prevent the user from going back.
    useEffect(
        () =>
        {
            const handleRemoveAction = (e) => 
            {
                console.log(e.data.action);

                if (e.data.action.type == "GO_BACK")
                {
                    e.preventDefault(); 
                    console.log("You shall not pass."); 
                    return;
                }

                navigation.dispatch(e.data.action);
            };

            const removeListener = navigation.addListener('beforeRemove', handleRemoveAction);

            return removeListener;
        },
        [ navigation ]
    );

    const handleTakeQuiz = () =>
    {
        navigation.navigate("pvqPage");
    }

    const handleSkip = () =>
    {
        navigation.navigate("search");
    }

    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between" }}
            showNavBar = { false }
            showHeader = { false }
            propsLeftHeaderButtons = { [] }
            propsRightHeaderButtons = { [ propsHeaderButtons.settingsLoggedOut ] }
        >  
            <Animated.View style={{ 
                alignItems: 'center', 
                marginTop: "20%", 
                //opacity: contentOpacity, 
            }}> 
                <TextStandard 
                    text = { lIsQuizComplete ? "Quiz Complete!" : "Values Quiz" }
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />

                {
                    !lIsQuizComplete && (
                        <View style = {{width: "80%"}}>
                            <TextStandard 
                                text = "Let people know the principles that guide your actions by taking our values quiz." 
                                size = { 0 }
                                style = { styles.instruction }
                            />

                            <TextStandard 
                                text = "You will have to complete the quiz before you can start matching."
                                size = { 0 }
                                style = { styles.instruction }
                            />
                        </View>
                    )
                }

                {
                    lIsQuizComplete && (
                        <View style = {{width: "80%"}}>
                            <TextStandard 
                                text = "Thank you for completing our quiz!"
                                size = { 0 }
                                style = { styles.instruction }
                            />

                            <TextStandard 
                                text = "You are now ready to start matching."
                                size = { 0 }
                                style = { styles.instruction }
                            />
                        </View>
                    )
                }
            </Animated.View> 
            <View style = { styles.conBottom }>
                {
                    !lIsQuizComplete && ( 
                        <LinearGradient
                        colors={ 
                            [theme.buttonMoreVibrant, theme.buttonStandard, theme.buttonLessVibrant ]
                        }
                        style={{
                            ...styles.linearGradientButton, 
                            marginTop: globalProps.spacingVertBase
                        }}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }} 
                        >  
                            <ButtonStandard 
                                text={ userData.pvqAnswers ? "RESUME QUIZ" : "TAKE QUIZ" } 
                                sizeText = { 1 }
                                isBold
                                style={{ ...styles.button, backgroundColor: 'transparent'}}
                                onPress = { handleTakeQuiz }  
                            />  
                        </LinearGradient> 
                    )
                } 
                <LinearGradient
                    colors={ 
                        [theme.buttonLessVibrant, theme.buttonLessVibrant, theme.buttonLessVibrant ]
                    }
                    style={{
                        ...styles.linearGradientButton,  
                    }}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }} 
                >  
                    <ButtonStandard 
                        text={ lIsQuizComplete ? "START MATCHING" : "SKIP QUIZ" } 
                        sizeText = { 1 }
                        isBold
                        style={{ ...styles.button, backgroundColor: 'transparent'}}
                        onPress = { handleSkip }  
                    />  
                </LinearGradient> 
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
            rowGap: utilsGlobalStyles.spacingVertN(),
            marginTop: utilsGlobalStyles.spacingVertN(1)
        },
        btn:
        {
            width: "100%",
            padding: 20,
            borderRadius: globalProps.borderRadiusStandard
        },
        instruction:
        {
            textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1)
        },
        linearGradientButton:
        {
            width: "80%", 
            alignContent: "center",
            borderRadius: 100,  
        },
        button:
        {
            width: "100%",
            padding: 10,
            alignContent: "center",
            borderRadius: 100,  
            backgroundColor: 'transparent'
        },
    }
);

export default CreateAccountQuizIntro;