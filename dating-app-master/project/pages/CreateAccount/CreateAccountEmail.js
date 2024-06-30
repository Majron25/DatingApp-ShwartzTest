import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, Easing } from "react-native";

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
* The account-creation page in which the user enters their email.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountEmail({ navigation })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ email, setEmail ] = useState("");
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const [loginButtonText, setLoginButtonText] = useState("SEND CODE")

    // Regex check for email validation, so the user has to enter an actual email address.
    function validateEmail(email) {
        var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;;
        //old regex (wasnt sure which one was right when merging)
        //var regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        return regex.test(email.trim());
      }

    // Send the email up to the backend whilst bringing down the generated verification number for checks.
    const handleContinue = async () => {
        setCheckingDetails(true)
        setLoginButtonText("CHECKING EMAIL")
        //let enteredEmail = email; 

        // Allows the setting of popup title and message per inclusion, insteading of requiring setting everything
        // each time the popup is used. Provides a cleaner, more readable implementation of the popup.
        const handlePopupMessage = (title, message) => {
            setPropsPopUpMsg({
            title,
            message,
            buttons: [{ text: "OK" }],
            });
        };

        if (validateEmail(email)) {
            const fetchResponse = await ApiRequestor.VerifyEmail(email);

            let {number, status} = fetchResponse.data;

            // If the email entered is not already in the database, the user will be allowed to continue to the verification page.
            if (status === 200) {
                // TODO: Remove this log before assessment.
                console.log(number);
                nextPageAnimation(number);
            } else if (status === 409) {
                setLoginButtonText("SEND CODE")
                setCheckingDetails(false)
                setPropsPopUpMsg({
                    title: "Invalid Email!",
                    message: "Email already in use!",
                    buttons: [{ text: "LOGIN", onPress: () => {navigation.navigate('login')}}, { text: "CLOSE"}],
                })
                return
            } else {
                setLoginButtonText("SEND CODE")
                setCheckingDetails(false)
                return
            }
        } else {
            handlePopupMessage("Invalid Email!", "Please enter a valid email!");
            setLoginButtonText("SEND CODE")
            setCheckingDetails(false)
        }
    }; 
    useEffect(
        () => 
        { 
            startAnimation()
        }, []
    )  
    const [checkingDetails, setCheckingDetails] = useState(false)
    const [animationsComplete, setAnimationsComplete] = useState(true); 
    const [contentOpacity] = useState(new Animated.Value(0));  
    const [inputOpacity] = useState(new Animated.Value(0));
    const [translate] = useState(new Animated.Value(0));   
    const startAnimation = () => {
        setAnimationsComplete(false) 
        Animated.parallel([ 
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: false
            }),
            Animated.timing(inputOpacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: false
            }), 
    
        ]).start(() => {
            //animations are finished
            setAnimationsComplete(true)
        });
    }
    const backAnimation = () => {
        setAnimationsComplete(false)  
        Animated.parallel([ 
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false
            }),
            Animated.timing(inputOpacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false
            }), 
        ]).start(() => { 
            setAnimationsComplete(true);
            contentOpacity.setValue(1);
            inputOpacity.setValue(1);
            translate.setValue(0);
            navigation.goBack();
        });
        
    }
    const nextPageAnimation = (number) => {
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
            //set button to be correct text again
            //incase user presses the back button
            setLoginButtonText("SEND CODE");
            setCheckingDetails(false);
            contentOpacity.setValue(1);
            inputOpacity.setValue(1);
            translate.setValue(0);
            navigation.navigate("createAccountVerifyEmail", { email: email, verificationNumber: number });
        });
    }
    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between" }}
            showNavBar = { false }
            propsLeftHeaderButtons = { [ propsHeaderButtons.back ] }
            propsRightHeaderButtons = { [ propsHeaderButtons.settingsLoggedOut ] }
            propsPopUpMsg = { propsPopUpMsg }
            showHeader = { false }
        >   
            <Animated.View style = {{
                opacity: contentOpacity,
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
                    inactive={!animationsComplete || checkingDetails}
                />
            </Animated.View>
            <Animated.View style={{ 
                width: 120,   
                height: 120,
                borderRadius: 150,   
                justifyContent: 'center',
                alignItems: 'center', 
                backgroundColor: theme.decorative3,
                position: 'absolute',
                right: '30%',
                top: '8%',    
                //transform: [{scale: circleScaleAnimation1}]
            }}></Animated.View>
            <Animated.View style={{ 
                width: 300,   
                height: 300,
                borderRadius: 150,   
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.decorative1,
                position: 'absolute',
                right: '-25%',
                top: '-25%',  
                //transform: [{scale: circleScaleAnimation2}]
            }}></Animated.View>
            <Animated.View style={{ 
                width: 300,   
                height: 300,
                borderRadius: 150,   
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.decorative2,
                position: 'absolute',
                left: '-20%',
                top: '-13%', 
                //transform: [{scale: circleScaleAnimation3}]
            }}></Animated.View> 
            <BackgroundCircle/>
            <Animated.View style={{ 
                    alignItems: 'center', 
                    marginTop: "20%",
                    opacity: contentOpacity, 
                }}>
                <TextStandard 
                    text = "What's your email?" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = "We require your email to contact you for tasks such as account recovery." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1),
                        width: "80%"
                    }}
                />
            </Animated.View>
             
            <Animated.View style={{
                opacity: inputOpacity, 
                transform: [{translateY: translate}]
            }}> 
                <TextInputStandard 
                    text = { email }
                    size = { 0 }
                    placeholder = "Email"
                    onChangeText = { (text) => setEmail(text) }
                    style = { { ...globalStyles.textboxSingleLine, ...styles.txtEmail } }
                />

            </Animated.View>
             
 

            <Animated.View style = { {...styles.conBottom, opacity: contentOpacity} }>
                {
                    (email != "") && 
                        <TextStandard 
                            text = "Click the button below to send a verification code to your email." 
                            size = { -1 }
                            style = {{ 
                                textAlign: "center", marginBottom: 5, width: "80%"
                            }}
                        />
                }

                <LinearGradient
                    colors={
                        email === "" ? 
                        //inactive colours
                        [theme.buttonStandardInactive, theme.buttonStandardInactive] 
                        : checkingDetails
                        ? [theme.buttonStandardInactive, theme.buttonStandardInactive]
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
                        text={loginButtonText}
                        sizeText={1}
                        isBold
                        style={{ ...styles.button, backgroundColor: checkingDetails ? theme.buttonLessVibrant : 'transparent'}}
                        onPress = { handleContinue } 
                        inactive={!animationsComplete || checkingDetails || email==""}
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
        txtEmail: 
        { 
            width: "80%", 
        },
        btnSendCode:
        {
            width: "80%",
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

export default CreateAccountEmail;