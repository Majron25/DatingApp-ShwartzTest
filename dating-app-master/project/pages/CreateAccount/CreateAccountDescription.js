import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Animated } from "react-native";

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import TextInputStandard from '../../components/TextInputStandard.js';
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js'; 
import { LinearGradient } from 'expo-linear-gradient';
import HeaderButton from '../../components/HeaderButton.js';
import { Ionicons } from '@expo/vector-icons';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

// The maximum number of characters that may be entered.
const maxLengthDescription = 1000;

/*
* The account-creation page in which the user enters an optional self-description.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountDescription({ navigation, route })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ description, setDescription ] = useState("");
 
    const handleContinue = () =>
    {
        setAnimationsComplete(false) 
        Animated.parallel([
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false
            }), 
        ]).start(() => { 
            setAnimationsComplete(true) 
            contentOpacity.setValue(1); 
            navigation.navigate("createAccountImages", { ...route.params, description: description })
        });
    }
    const [animationsComplete, setAnimationsComplete] = useState(true); 
    const [contentOpacity] = useState(new Animated.Value(0));   
    
    const backAnimation = () => {
        navigation.goBack();
    }
    useEffect(
        () =>
        {
            startAnimation();
        }, []
    );
    const startAnimation = () => {
        setAnimationsComplete(false) 
        Animated.parallel([ 
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false
            }),   
        ]).start(() => {
            //animations are finished
            setAnimationsComplete(true)
        });
    }
    
    // The number of remaining characters.
    let numRemainingCharacters = maxLengthDescription - description.length;

    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between" }}
            showNavBar = { false }
            showHeader = { false }
            propsLeftHeaderButtons = { [] }
            propsRightHeaderButtons = { [ propsHeaderButtons.settingsLoggedOut ] }
        >   
        <BackgroundCircle/>
            <Animated.View style = {{
                //opacity: contentOpacity,
                position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 1
                }}>
                <HeaderButton 
                    icon={(size, colour) => {
                        return ( 
                            <Ionicons 
                                name = "chevron-back-sharp" color = { colour } 
                                size = { size } 
                            />
                        )
                    }
                    } 
                    onPress={backAnimation} 
                    inactive={!animationsComplete}
                />
            </Animated.View>
            <Animated.View style = {{alignItems: 'center', marginTop: "20%", opacity: contentOpacity}}>
                <TextStandard 
                    text = "Describe yourself" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = "If you'd like, you can enter a description of yourself, which will be visible on your profile. This is optional." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1), width: "80%"
                    }}
                />
            </Animated.View>

            <Animated.View style ={{opacity: contentOpacity}}>
                <TextInputStandard 
                    text = { description }
                    maxLength = { maxLengthDescription }
                    multiline
                    placeholder = "Describe yourself ..."
                    onChangeText = { (text) => setDescription(text) }
                    style = { { ...styles.txtDescription, height: Dimensions.get("screen").height * 0.3 } }
                />

                <TextStandard 
                    text = { numRemainingCharacters.toString() } 
                    size = { 1 }
                    isBold
                    style = {{ 
                        textAlign: "right", marginTop: utilsGlobalStyles.spacingVertN(-5)
                    }}
                />
            </Animated.View>

            <Animated.View style = { {...styles.conBottom, opacity: contentOpacity} }>  
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
                        text={"CONTINUE"} 
                        sizeText = { 1 }
                        isBold
                        style={{ ...styles.button, backgroundColor: 'transparent'}}
                        onPress = { handleContinue }  
                    />  
                </LinearGradient> 
            </Animated.View>

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
        txtDescription: 
        {
            marginTop: utilsGlobalStyles.spacingVertN(1)
        },
        btnContinue:
        {
            width: "100%",
            padding: 10,
            borderRadius: globalProps.borderRadiusStandard
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

export default CreateAccountDescription;