import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, StyleSheet, Animated, Platform, Dimensions, Image } from "react-native";
import { useIsFocused } from "@react-navigation/native";

import propsHeaderButtons from '../components/props_header_buttons.js';
import globalProps, { globalStyles, utilsGlobalStyles, globalThemes } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import TextInputStandard from '../components/TextInputStandard.js';
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import ApiRequestor from '../ApiRequestor.js';
import { useAuth } from '../AuthContext.js';

import * as Location from 'expo-location';
import ThemeContext from '../contexts/ThemeContext.js';
import { LinearGradient } from 'expo-linear-gradient';
import { Line } from 'react-native-svg';   
import BackgroundCircle from '../components/BackgroundCircleComponent.js';
import utils from '../utils/utils.js';

/*
* The landing page. This is the first page that displays if the user isn't logged-in.

* Props:
    > navigation: The navigation object.
*/
function Landing({ navigation })
{
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const { logOut, setReloadMatches } = useAuth();

    // Used to trigger the useEffect when the page is returned to.
    const isFocused = useIsFocused();

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    // Move to either the 'quiz-intro' or 'search' page if the user is signed in.
    useEffect(
        () =>
        {
            startAnimation();

            if (!isFocused)
            { return; }

            // Ensure that the user is logged-out.
            // It's assumed that when a user logs-out, they are returned to this page.
            logOut();

            // If the user log-out and then logs-in again, the 'reload' flag must be true for searches to be loaded.
            setReloadMatches(true);
        },
        [ isFocused ]
    );

    useEffect(
        () =>
        {
            // Play animation.
            startAnimation();
        },
        []
    );

    const handleCreateAccount = async () =>
    {
        if (Platform.OS == 'web')
            return;

        const lLocationPermissionGranted = await checkLocationPermission();

        if (!lLocationPermissionGranted)
            return;

        navigation.navigate("createAccountEmail");
    };

    const handleSignIn = async () =>
    {
        if (Platform.OS == 'web')
            return;

        const lLocationPermissionGranted = await checkLocationPermission();

        if (!lLocationPermissionGranted)
            return;

        // let location = await Location.getCurrentPositionAsync({});
        // console.log(location);
        navigation.navigate("login");
    };

    const checkLocationPermission = async () =>
    {
        // Whether location services have been granted.
        let { status : statusPermissionGranted } = await Location.getForegroundPermissionsAsync();

        if (statusPermissionGranted == 'granted')
            return true;

        const { status : statusRequest } = await Location.requestForegroundPermissionsAsync();

        if (statusRequest == 'granted')
            return true;

        setPropsPopUpMsg(
            {
                title: "Location Data Required",
                message: "This app requires location data. To continue, go to your device's settings and grant permissions for this app.",
                buttons: [
                    { text: "OK" }
                ],
            }
        );

        return false;
    };

    //animation stuff for the title fade in an slight movement
    const [titleOpacity] = useState(new Animated.Value(0));
    const [titleAnimationY] = useState(new Animated.Value(0));
    const [circleScaleAnimation1] = useState(new Animated.Value(0));
    const [circleScaleAnimation2] = useState(new Animated.Value(0));
    const [circleScaleAnimation3] = useState(new Animated.Value(0));
    const [otherScaleAnimation] = useState(new Animated.Value(1));
    const [animationsComplete, setAnimationsComplete] = useState(false);
    const [returningFromOtherScreen, setReturningFromOtherScreen] = useState(false); 

    const {height, width} = Dimensions.get('screen')
    const smallCircleSize = Math.min(height, width) * 0.5 * 0.62;
    const bigCircleSize = Math.min(height, width) * 0.78;

    const opacityAnimation = titleOpacity.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: [0, 0.7, 1],  
    });
    const translateTitleY = titleAnimationY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20],  
    });   
    const loginAnimation = () =>
    {
        setAnimationsComplete(false)
        Animated.parallel([
            Animated.timing(titleOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }),
            Animated.timing(otherScaleAnimation, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: false
            })
        ]).start(() => { 
            otherScaleAnimation.setValue(1)
            setReturningFromOtherScreen(true)
            //navigation.navigate("login")
            handleSignIn();
        })
    }
    
    const signUpAnimation = () =>
    {
        setAnimationsComplete(false)
        Animated.parallel([
            Animated.timing(titleOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }),
            Animated.timing(otherScaleAnimation, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: false
            })
        ]).start(() => { 
            otherScaleAnimation.setValue(1)
            setReturningFromOtherScreen(true)
            //navigation.navigate("createAccountEmail")
            handleCreateAccount();
        })
    }
    const startAnimation = () => 
    {  
        setAnimationsComplete(false)
        if (returningFromOtherScreen)
        {
            //we have pressed back and come back to this screen. So no need to do the fancy shit
            titleOpacity.setValue(0)
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 200,  
                    useNativeDriver: false, 
                }), 
            ]).start(() => {
                //animations are finished
                setAnimationsComplete(true)
            });
        } else {
            //the fancy shit
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(titleOpacity, {
                        toValue: 1,
                        duration: 1000,  
                        useNativeDriver: false, 
                    }), 
                    Animated.timing(titleAnimationY, {
                        toValue: 1,
                        duration: 1000,  
                        useNativeDriver: false,  
                    }),  
                ]),
                Animated.stagger(200, [
                    Animated.spring(circleScaleAnimation2, {
                        toValue: 1,
                        stiffness: 200, 
                        damping: 20, 
                        useNativeDriver: false,
                    }), 
                    Animated.spring(circleScaleAnimation1, {
                        toValue: 1,
                        stiffness: 200, 
                        damping: 20, 
                        useNativeDriver: false,
                    }), 
                    Animated.spring(circleScaleAnimation3, {
                        toValue: 1,
                        stiffness: 200, 
                        damping: 20, 
                        useNativeDriver: false,
                    }), 
                ])
            ]).start(() => {
                //animations are finished
                setAnimationsComplete(true)
            });
        }
    }

    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between"}}
            showNavBar = { false }
            showHeader = { false }
            propsLeftHeaderButtons = { [] }
            propsRightHeaderButtons = { [ propsHeaderButtons.settingsLoggedOut ] }
            propsPopUpMsg = { propsPopUpMsg }   
        >
        <BackgroundCircle 
            transformAnimation1={circleScaleAnimation1}
            transformAnimation2={circleScaleAnimation2}
            transformAnimation3={circleScaleAnimation3} 
        />  

            {/* end of background */} 


            <View style = { styles.conTop }>
                <Animated.View style={{ 
                        transform: [{translateY: translateTitleY}, {scale: otherScaleAnimation}],
                        opacity: opacityAnimation
                    }}>
                    <TextStandard 
                        text = "MyOne" 
                        size = { 3 }
                        style = {{ 
                            textAlign: "center", marginBottom: globalProps.spacingVertBase
                        }}
                    />

                    {/* <TextStandard 
                        text = "Find the one that's right for you" 
                        size = { 1 }
                        style = {{ 
                            textAlign: "center", marginBottom: globalProps.spacingVertBase
                        }}
                    /> */}
                </Animated.View>
            </View>
            <Image
                source={require('../assets/icon.png')}
                style={{
                    width: 250,
                    height: 250,
                    alignSelf: "center"
                }}
            />
            <Animated.View style = {{
                ...styles.conBottom, 
                opacity: opacityAnimation, 
                transform: [{scale: otherScaleAnimation}]
            }}>     
                    <LinearGradient
                        colors={[theme.buttonMoreVibrant, theme.buttonStandard, theme.buttonLessVibrant ]}
                        style={{
                            ...styles.linearGradientButton, 
                            marginBottom: globalProps.spacingVertBase/2,
                        }}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }} 
                    >  
                        <ButtonStandard 
                            text="LOGIN" 
                            sizeText={1}
                            isBold
                            style={{ ...styles.button}}
                            onPress = { loginAnimation } 
                            inactive={!animationsComplete}
                        />  
                    </LinearGradient>
                    <ButtonStandard 
                        text="SIGN UP"
                        sizeText = { 1 }
                        isBold 
                        style={{
                            ...styles.button,  
                            backgroundColor: theme.buttonLessVibrant, 
                            width: "80%"
                        }} 
                        onPress = { signUpAnimation } 
                        inactive={!animationsComplete}
                    /> 
                    <TextStandard 
                        text = "By using this app, you are agreeing to our Privacy Policy." 
                        size = { -2 }
                        style = {{ 
                            textAlign: "center", marginBottom: 5
                        }}
                    />   
                </Animated.View>    
        </PageContainer>
    );
}
const styles = StyleSheet.create(
    {
        conTop:
        {
        },
        conBottom:
        {
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: '15%', 
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

export default Landing;