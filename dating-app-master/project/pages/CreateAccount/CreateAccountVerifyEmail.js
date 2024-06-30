import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Animated, } from "react-native";

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import TextInputStandard from '../../components/TextInputStandard.js';
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js';
import ApiRequestor from '../../ApiRequestor.js'; 
import HeaderButton from '../../components/HeaderButton.js';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

/*
* The account-creation page in which the user verifies their email with a code sent to said email.

* Props:
    > navigation: The navigation object.
    > route: An object that contains information regarding the current screen/page's route (i.e. its place in the 
      current navigation stack). The route.params object contains data trnasferred to this page component from the 
      previous page component.
*/
function CreateAccountVerifyEmail({ navigation, route })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ enteredCode, setEnteredCode ] = useState("");
    const [ verifyCode, setVerifyCode ] = useState(route.params.verificationNumber);
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    // Whether the user has resent the code with the button.
    // The button should be disabled after they have resent the code.
    const [ codeResentButtonPress, setCodeResentButtonPress ] = useState(false);

    // A count of how many incorrect attempts the user has made since the code was last resent.
    const rfCountIncorrectAttempts = useRef(0);

    // This will conduct a check on the code entered by the user, compared to the generated code.
    // if successful, the page will redirect. If not, the page will conditionally display an error message
    // and generate a new code (sending a new email in the process).
    const handleContinue = () => { 
        if (enteredCode == verifyCode) {
            console.log("Correct code entered"); 
            //dont put animation code into a function here.
            //causes the animationsComplete bool to not work
            //idk why. React native moment.
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
                navigation.navigate("createAccountPassword", { ...route.params });
            });
        } else {
            rfCountIncorrectAttempts.current += 1;

            if (rfCountIncorrectAttempts.current == 3)
            {
                generateNewCode();
                setPropsPopUpMsg(
                    {
                        title: "Incorrect Code",
                        message: "A new code has been sent to your email. Please try again using the new code.",
                        buttons: [
                            { text: "OK" }
                        ]
                    }
                );
            }
            else
            {
                setPropsPopUpMsg(
                    {
                        title: "Incorrect Code",
                        message: "Please try again.",
                        buttons: [
                            { text: "OK" }
                        ]
                    }
                );
            }
        }
    }


    const [animationsComplete, setAnimationsComplete] = useState(true); 
    const [contentOpacity] = useState(new Animated.Value(0));  
    const [inputOpacity] = useState(new Animated.Value(0));
    const [translate] = useState(new Animated.Value(20)); 

    const backAnimation = () => {
        navigation.goBack();
    }

    useEffect(
        () =>
        {
            startAnimation();
        }, []
    )

    /**
     * Generates a new random six-digit code to be used for verification.
     * @return {[text]} [Returns a random six-digit integer as a string]
     */
    const generateNewCode = async () => {
        rfCountIncorrectAttempts.current = 0;
        const fetchResponse = await ApiRequestor.generateVerificationCode(route.params.email);
        // TODO: Remove this log before assessment.
        console.log(fetchResponse.data.code);
        let newNumber = fetchResponse.data.code;

        setVerifyCode(newNumber);
    }

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
                    inactive = { !animationsComplete }
                />
            </Animated.View>
            <BackgroundCircle/>
            <Animated.View style={{ 
                    alignItems: 'center', 
                    marginTop: "20%",
                    opacity: contentOpacity, 
                }}> 
                <TextStandard 
                    text = "Verify Email" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = {`You should receive a six-digit verification code at ${route.params.email} shortly. Please enter it below.`}
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", 
                        marginTop: utilsGlobalStyles.spacingVertN(-1),
                        width: "80%"
                    }}
                /> 
            </Animated.View>
            <Animated.View 
            style = {{ 
                marginTop: utilsGlobalStyles.spacingVertN(1), 
                alignItems: 'center' ,
                opacity: inputOpacity,
                transform: [{translateY: translate}]
                }}>
                <TextInputStandard 
                    text = { enteredCode }
                    size = { 0 }
                    placeholder = "Code"
                    onChangeText = { (text) => setEnteredCode(text) }
                    style = { { ...globalStyles.textboxSingleLine  } }
                />  
            {/* </Animated.View>
            <Animated.View style = {{  
                //marginTop: utilsGlobalStyles.spacingVertN(0), 
                
                alignItems: 'center' ,
                opacity: contentOpacity
            }}> */}
                <LinearGradient
                    colors={
                        enteredCode === "" ? 
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
                        inactive={ enteredCode === "" || !animationsComplete }
                    />  
                </LinearGradient> 
            </Animated.View>
            <Animated.View style = {{ ...styles.conBottom, opacity: contentOpacity }}>
                <TextStandard 
                    text = "Didn't receive a code?" 
                    size = { -1 }
                    style = {{ 
                        textAlign: "center", marginBottom: 5
                    }}
                />
 
                
                <ButtonStandard 
                    text="RESEND CODE"
                    sizeText = { 1 }
                    isBold 
                    style={{
                        ...styles.button,  
                        backgroundColor: theme.buttonLessVibrant, 
                        width: "80%"
                    }} 
                    onPress = { () => { setCodeResentButtonPress(true); generateNewCode(); } }  
                    inactive = { !animationsComplete || codeResentButtonPress }
                /> 
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

export default CreateAccountVerifyEmail;