import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, } from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js'; 
import { LinearGradient } from 'expo-linear-gradient';
import HeaderButton from '../../components/HeaderButton.js';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

/*
* The account-creation page in which the user enters their gender and sexual preference.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountGender({ navigation, route })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ gender, setGender ] = useState('');

    const [ sexualPreference, setSexualPreference ] = useState('');

    // Gender icons.
    const iconMale = (
        <MaterialCommunityIcons name = "human-male" size = { 80 } color = { theme.borders } />
    );
    const iconFemale = (
        <MaterialCommunityIcons name = "human-female" size = { 80 } color = { theme.borders } />
    );

    const handleGender = (genderSelection) => 
    {
        if (genderSelection === gender)
        {
            setGender('');
        }
        else
        {
            setGender(genderSelection);
        }
    }

    const handleSexualPreference = (sexualPrefSelection) => 
    {
        if (sexualPreference.includes(sexualPrefSelection))
        {
            setSexualPreference((prev) => { return prev.replace(sexualPrefSelection, '') })
        }
        else
        {
            setSexualPreference(
                (prev) => 
                {
                    const newSexPref = (prev + sexualPrefSelection).split('').sort().join('');
                    //console.log(newSexPref);
                    return newSexPref; 
                }
            );
        }

    }

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
            navigation.navigate("createAccountReligion", { ...route.params, gender: gender, sexPref: sexualPreference })
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
    )
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


    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between", rowGap: utilsGlobalStyles.spacingVertN() }}
            showNavBar = { false }
            showHeader = { false }
            propsLeftHeaderButtons = { [ propsHeaderButtons.back ] }
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

            <Animated.View style = { {...styles.container, marginTop: "20%", opacity: contentOpacity } }>
                <TextStandard 
                    text = "I am a ..." 
                    size = { 2 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />

                <View style = { styles.containerGender }>
                    <ButtonStandard
                        icon = { iconMale } 
                        style = {{ 
                            ...styles.buttonGender, borderWidth: gender == 'M' ? 2 : 0, backgroundColor: theme.header 
                        }}
                        onPress = { () => handleGender('M') }
                    />
                    <ButtonStandard
                        icon = { iconFemale } 
                        style = {{ 
                            ...styles.buttonGender, borderWidth: gender == 'F' ? 2 : 0, backgroundColor: theme.header 
                        }}
                        onPress = { () => handleGender('F') }
                    />
                </View>

                {/* <TextStandard 
                    text = "Your gender will be public." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1)
                    }}
                /> */}
            </Animated.View>

            <Animated.View style = { {...styles.container, opacity: contentOpacity} }>
                <TextStandard 
                    text = "I am interested in ..." 
                    size = { 2 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />

                <View style = { styles.containerGender }>
                    <ButtonStandard
                        icon = { iconMale } 
                        style = {{ ...styles.buttonGender, borderWidth: sexualPreference.includes('M') ? 2 : 0, backgroundColor: theme.header  }}
                        onPress = { () => handleSexualPreference('M') }
                    />
                    <ButtonStandard
                        icon = { iconFemale } 
                        style = {{ ...styles.buttonGender, borderWidth: sexualPreference.includes('F') ? 2 : 0, backgroundColor: theme.header  }}
                        onPress = { () => handleSexualPreference('F') }
                    />
                </View>

                {/* <TextStandard 
                    text = "Your sexual preference will be public." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1)
                    }}
                /> */}
            </Animated.View>

            <Animated.View style = { {...styles.conBottom, opacity: contentOpacity} }>   
                <LinearGradient
                    colors={
                        gender === "" ? 
                        //inactive colours
                        [theme.buttonStandardInactive, theme.buttonStandardInactive]
                        : sexualPreference == '' ?
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
                        inactive={ !animationsComplete || gender == '' || sexualPreference == '' }
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
            //marginTop: utilsGlobalStyles.spacingVertN(1)
        },
        container:
        {
            justifyContent: "center",
            alignItems: "center"
        },
        containerGender:
        {
            marginTop: utilsGlobalStyles.spacingVertN(-1),
            flexDirection: "row",
            columnGap: 30,
        },
        buttonGender: 
        {
            height: 130,
            width: 80,
            borderRadius: 10
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

export default CreateAccountGender;