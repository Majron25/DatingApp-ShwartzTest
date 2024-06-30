import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, } from "react-native";

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import TextInputStandard from '../../components/TextInputStandard.js';
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js'; 
import HeaderButton from '../../components/HeaderButton.js';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

// The maximum length of a name.
const maxLengthName = 50;

/*
* The account-creation page in which the user enters their first name.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountName({ navigation, route })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ name, setName ] = useState("");

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const handleContinue = () =>
    {
        if (!isNameValid(name))
        {
            setPropsPopUpMsg(
                {
                    title: "Invalid Name",
                    message: "Your name may only contain letters and dashes.",
                    buttons: [
                        { text: "OK" }
                    ]
                }
            );

            return;
        }
        setAnimationsComplete(false) 
        Animated.stagger(100, [
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false
            }),
            Animated.parallel([ 
                Animated.timing(translate, {
                    toValue: -20, 
                    duration: 400, 
                    useNativeDriver: false,
                }),
                Animated.timing(inputOpacity, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: false
                }),
            ]),
        ]).start(() => { 
            setAnimationsComplete(true) 
            contentOpacity.setValue(1);
            inputOpacity.setValue(1);
            translate.setValue(0); 
            navigation.navigate("createAccountDOB", { ...route.params, name: name })
        });
    }
    const backAnimation = () => {
        navigation.goBack();
    }
    const [animationsComplete, setAnimationsComplete] = useState(true); 
    const [contentOpacity] = useState(new Animated.Value(0));  
    const [inputOpacity] = useState(new Animated.Value(0));
    const [translate] = useState(new Animated.Value(20)); 
    
    useEffect( () => { startAnimation(); }, [] )
    const startAnimation = () => {
        setAnimationsComplete(false) 
        Animated.parallel([ 
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: false
            }),  
            Animated.timing(translate, {
                toValue: 0, 
                duration: 400, 
                useNativeDriver: false,
            }),
            Animated.timing(inputOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: false
            }),  
        ]).start(() => {
            //animations are finished
            setAnimationsComplete(true)
        });
    }


    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between" }}
            showNavBar = { false }
            showHeader = { false }
            propsLeftHeaderButtons = { [ propsHeaderButtons.back ] }
            propsRightHeaderButtons = { [ propsHeaderButtons.settingsLoggedOut ] }
            propsPopUpMsg = { propsPopUpMsg }
        > 
        
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
        
        <BackgroundCircle/>
        <Animated.View style={{ 
                alignItems: 'center', 
                marginTop: "20%",
                opacity: contentOpacity, 
            }}> 
                <TextStandard 
                    text = "What's your first name?" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = "Your first name will be public." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1)
                    }}
                />
        </Animated.View>

        <Animated.View style={{opacity: inputOpacity, transform: [{translateY: translate}]}}>
            <TextInputStandard 
                text = { name }
                size = { 0 }
                maxLength = { maxLengthName }
                placeholder = "First name"
                onChangeText = { (text) => setName(text) }
                style = { { ...globalStyles.textboxSingleLine } }
            />
        </Animated.View>

            <Animated.View style = {{ ...styles.conBottom, opacity: contentOpacity} }>  
                <LinearGradient
                    colors={
                        name === "" ? 
                        //inactive colours
                        [theme.buttonStandardInactive, theme.buttonStandardInactive]  
                        //active colours
                        : [theme.buttonMoreVibrant, theme.buttonStandard, theme.buttonLessVibrant ]
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
                        inactive={ name === "" }
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
        txtName: 
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

export default CreateAccountName;

function isNameValid(name)
{
    // Only allow letters and -
    const regex = /^[A-Za-z\-]+$/

    return regex.test(name);
}