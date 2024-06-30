import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, Animated } from "react-native";
//import { BarPasswordStrengthDisplay, BoxPasswordStrengthDisplay } from 'react-native-password-strength-meter';

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import TextInputStandard from '../../components/TextInputStandard.js';
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js'; 
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

// The minimum length of a password.
const minLengthPassword = 8;

/*
* The account-creation page in which the user creates their password.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountPassword({ navigation, route })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const widthScreen = useWindowDimensions().width;

    const [ password, setPassword ] = useState("");

    const [ confirmPassword, setConfirmPassword ] = useState("");

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const handleContinue = () =>
    {
        if (password != confirmPassword)
        {
            setPropsPopUpMsg(
                {
                    title: "Passwords Don't Match",
                    message: "Please make sure your confirmation password matches your password.",
                    buttons: [
                        { text: "OK" }
                    ]
                }
            );

            return;
        }
        else if (!isPasswordValid(password))
        {
            setPropsPopUpMsg(
                {
                    title: "Invalid Password",
                    message: `Your password must be at least ${minLengthPassword} characters long.`,
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
            navigation.navigate("createAccountName", { ...route.params, password: password })
        });
    }
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
    //start animation gets called when page loads
    useEffect( () => { startAnimation() }, [] ) 

    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between" }}
            showNavBar = { false }
            showHeader = { false }
            propsLeftHeaderButtons = { [] }
            propsRightHeaderButtons = { [ propsHeaderButtons.settingsLoggedOut ] }
            propsPopUpMsg = { propsPopUpMsg }
        > 
            <BackgroundCircle/>
            
            <Animated.View style={{ 
                    alignItems: 'center', 
                    marginTop: "20%",
                    opacity: contentOpacity, 
                }}> 
                <TextStandard 
                    text = "Create Password" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = "A password is required to secure your account. Record your password somewhere safe so you don't forget it." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1), width: "80%"
                    }}
                />
            </Animated.View>

            <Animated.View style = {{ marginTop: utilsGlobalStyles.spacingVertN(1), opacity: inputOpacity, transform: [{translateY: translate}] }}>
                {/*
                <View style = { { marginBottom: "5%", alignSelf: "center" } }>
                    <BarPasswordStrengthDisplay 
                        password = {password}
                        barColor = { theme.borders }
                        width = { 320 }
                        minLength = {4}
                    />
                </View>
                */}

                <TextInputStandard 
                    text = { password }
                    size = { 0 }
                    placeholder = "Password"
                    onChangeText = { (text) => setPassword(text) }
                    style = { { ...globalStyles.textboxSingleLine } }
                    secureTextEntry
                />

                <TextInputStandard 
                    text = { confirmPassword }
                    size = { 0 }
                    placeholder = "Confirm password"
                    onChangeText = { (text) => setConfirmPassword(text) }
                    style = {{ 
                        ...globalStyles.textboxSingleLine, 
                        marginTop: utilsGlobalStyles.spacingVertN() 
                    }}
                    secureTextEntry
                />

            </Animated.View>

            <Animated.View style = { {...styles.conBottom, opacity: contentOpacity} }> 
                <LinearGradient
                    colors={
                        password === "" ? 
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
                        inactive={ !animationsComplete || password === "" }
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
        btnContinue:
        {
            width: "100%",
            padding: 10,
            borderRadius: globalProps.borderRadiusStandard,
            marginTop: utilsGlobalStyles.spacingVertN(),
            flexShrink: 0,
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

export default CreateAccountPassword;

/*
* A utility function that determines if a user's password is 'valid', meaning that it accords with our rules: e.g. is 
  higher than the minimum length.
*/
function isPasswordValid(password)
{
    return (password.length >= minLengthPassword)
}