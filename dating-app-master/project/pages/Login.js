import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Image, Animated, Easing, Dimensions } from "react-native";

import propsHeaderButtons from '../components/props_header_buttons.js';
import globalProps, { utilsGlobalStyles, globalThemes } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import TextInputStandard from '../components/TextInputStandard.js';
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import { useAuth } from '../AuthContext';
import ApiRequestor from '../ApiRequestor.js';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';  
import ThemeContext from '../contexts/ThemeContext.js'; 
import HeaderButton from '../components/HeaderButton.js';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundCircle from '../components/BackgroundCircleComponent.js';

/*
* The login page. There should be an option to create an account.

* Props:
    > navigation: The navigation object.
*/
function Login({ navigation })
{
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ isLoading, setIsLoading ] = useState(false);

    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const { logIn } = useAuth();

    useEffect(
        () => 
        { 
            startAnimation()
        }, []
    )  
    const [loginButtonText, setLoginButtonText] = useState("LOGIN")

    const handleLogin = async () => 
    {
        setCheckingDetails(true);
        setLoginButtonText("Checking details")
        // Check email and password before allowing user to login. 
        
        if (email == '' || password == '') 
        {
            setPropsPopUpMsg(
                {
                    title: "Invalid Details!",
                    message: "Your email or password is invalid.",
                    buttons: [
                        { text: "OK" }
                    ]
                }
            );
            
            setLoginButtonText("LOGIN")
            setCheckingDetails(false)
            return;
        }

        const lStatusResponse = await logIn(email, password);
        // const fetchResponse = await ApiRequestor.findUser(trimmedEmail, password);

        if (lStatusResponse === 200) {
            //navigation.navigate('search');
            loginAnimation();
        } else if (lStatusResponse === 401) {
            console.log("INCORRECT PASSWORD")
            setPropsPopUpMsg(
                {
                    title: "Invalid Details!",
                    message: "Incorrect password!",
                    buttons: [
                        { text: "OK" }
                    ]
                }
            );
        } else if (lStatusResponse === 404) {
            console.log("USER DOES NOT EXIST");
            setPropsPopUpMsg(
                {
                    title: "Invalid Details!",
                    message: "User with that email does not exist!",
                    buttons: [
                        { text: "SIGN UP", onPress: () => {navigation.navigate('createAccountEmail')}},
                        { text: "ClOSE" }, 
                    ]
                }
            );
        } else {
            console.log(lStatusResponse)
            console.log("error code didnt match the else-if. This shouldn't be possible! How'd you do this lmao.")
            
            setPropsPopUpMsg(
                {
                    title: "Uh oh!",
                    message: "Something went wrong! Try again later.",
                    buttons: [
                        { text: "OK" }
                    ]
                }
            );
        }
        
        setLoginButtonText("LOGIN")
        setCheckingDetails(false);
    };
    
    const [checkingDetails, setCheckingDetails] = useState(false)
    const [animationsComplete, setAnimationsComplete] = useState(false); 
    const [contentOpacity] = useState(new Animated.Value(0));  
    const [inputOpacity] = useState(new Animated.Value(0));  
    const [otherScaleAnimation] = useState(new Animated.Value(1)); 
    const [translateUsernameX] = useState(new Animated.Value(0));  
    const [translatePasswordX] = useState(new Animated.Value(0));   
    const [circleScaleAnimation1] = useState(new Animated.Value(1));
    const [circleScaleAnimation2] = useState(new Animated.Value(1));
    const [circleScaleAnimation3] = useState(new Animated.Value(1));
    const {height, width} = Dimensions.get('screen') 
    const smallCircleSize = Math.min(height, width) * 0.5 * 0.62;
    const bigCircleSize = Math.min(height, width) * 0.78;

    const startAnimation = () => {
        setAnimationsComplete(false)
        Animated.parallel([ 
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false
            }),
            Animated.timing(inputOpacity, {
                toValue: 1,
                duration: 200,
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
                duration: 200,
                useNativeDriver: false
            }),
        ]).start(() => { 
            setAnimationsComplete(true);
            navigation.goBack();
        });
    }
    const loginAnimation = () =>
    {
        setAnimationsComplete(false)
        Animated.stagger(100, [
            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false
                }),
                Animated.timing(otherScaleAnimation, {
                    toValue: 1.1,
                    duration: 200,
                    useNativeDriver: false
                })
            ]),
            Animated.timing(translatePasswordX, {
                toValue: 500, 
                duration: 500,
                easing: Easing.bounce,
                useNativeDriver: false,
            }),
            Animated.timing(translateUsernameX, {
                toValue: 500, 
                duration: 500,
                easing: Easing.bounce,
                useNativeDriver: false,
            }),
            Animated.timing(circleScaleAnimation1, {
                toValue: 0,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: false,
            }), 
            Animated.timing(circleScaleAnimation2, {
                toValue: 0,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: false,
            }), 
            Animated.timing(circleScaleAnimation3, {
                toValue: 0,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: false,
            }), 
        ]).start(() => {  
            
            setAnimationsComplete(true)
            navigation.navigate('search'); 
        })
    }


    return (
        <PageContainer 
            navigation={navigation} 
            style = {{ justifyContent: "center", alignItems: "center" }}
            showNavBar = { false }
            showHeader = { false }
            propsLeftHeaderButtons={ [propsHeaderButtonBack] }
            propsRightHeaderButtons = { [ ] }
            propsPopUpMsg = { propsPopUpMsg }
            isLoading = { isLoading }
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
            <BackgroundCircle 
                transformAnimation1={circleScaleAnimation1}
                transformAnimation2={circleScaleAnimation2}
                transformAnimation3={circleScaleAnimation3} 
            />
            <Animated.View style={{
                opacity: inputOpacity, transform: [{translateX: translateUsernameX}]
            }}> 
                    <TextInputStandard
                        text = { email }
                        placeholder = "Email"
                        maxLength = { 100 }
                        onChangeText = { (newText) => setEmail(newText) }
                        style = {{
                            
                            ...styles.input, 
                        }}
                        inactive={!animationsComplete || checkingDetails}
                    /> 
            </Animated.View>
            
            <Animated.View style={{
                opacity: inputOpacity, transform: [{translateX: translatePasswordX}]
            }}> 
                    <TextInputStandard
                        text = { password }
                        placeholder = "Password"
                        maxLength = { 100 }
                        onChangeText = { (newText) => setPassword(newText) }
                        secureTextEntry 
                        style = {{
                            ...styles.input,
                            marginBottom: globalProps.spacingVertBase
                        }}
                        inactive={!animationsComplete || checkingDetails}
                    /> 
            </Animated.View>

            
            <Animated.View style={{
                transform: [{scale: otherScaleAnimation}],
                opacity: contentOpacity, 
                width: "80%",
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <LinearGradient
                    colors={[theme.buttonMoreVibrant, theme.buttonStandard, theme.buttonLessVibrant ]}
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
                        onPress = { handleLogin } 
                        inactive={!animationsComplete || checkingDetails}
                    />  
                </LinearGradient>
            </Animated.View>

        </PageContainer>
    );
}

const styles = StyleSheet.create(
    {
        input:
        {
            marginBottom: utilsGlobalStyles.spacingVertN(),
            width: "80%",
            borderRadius: 0,
            borderWidth: 0,
            borderBottomWidth: 1
            
        }, 
        logo:
        {
            width: "60%",
            height: "20%",
            marginBottom: utilsGlobalStyles.spaceVertBase,
        },
        welcomeText: {
            fontSize: 60,
            marginTop: globalProps.spacingVertBase,
            marginBottom: globalProps.spacingVertBase*2,
        },
        button:
        {
            width: "100%",
            padding: 10,
            alignContent: "center",
            borderRadius: 100,  
            backgroundColor: 'transparent'
        },
        linearGradientButton:
        {
            width: "80%", 
            alignContent: "center",
            borderRadius: 100,  
        }
    }
);
// An object that defines the 'menu' header button.
const propsHeaderButtonBack =
{
    icon: (size, colour) => {
        return (
            <Ionicons
                name="chevron-back-sharp" color={colour}
                size={size}
            />
        )
    },
    onPress: (navigation, setPropsPopUp) => {
        navigation.goBack();
    }
}
export default Login;