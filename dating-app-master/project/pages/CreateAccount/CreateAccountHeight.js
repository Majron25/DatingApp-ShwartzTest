import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Animated, } from "react-native";

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js';
import SliderSingleStandard from '../../components/SliderSingleStandard.js';
import { heightRange } from '../../shared_data.js';
import utils from '../../utils/utils.js'; 
import HeaderButton from '../../components/HeaderButton.js';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

/*
* The account-creation page in which the user inputs their height.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountHeight({ navigation, route })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ height, setHeight ] = useState(170);

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
            navigation.navigate("createAccountDescription", { ...route.params, height: height })
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

    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between" }}
            showNavBar = { false }
            showHeader = { false }
            propsLeftHeaderButtons = { [ propsHeaderButtons.back ] }
            propsRightHeaderButtons = { [ propsHeaderButtons.settingsLoggedOut ] }
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
                    text = "Your Height" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = "Please select your height." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1)
                    }}
                />
            </Animated.View>
            <Animated.View style = {{opacity: contentOpacity}}>
                <SliderSingleStandard 
                    value = { height } valueFormatted = { utils.cmToFeetAndInch(height) }
                    min = { heightRange.min } max = { heightRange.max } step = { 1 } 
                    onChange = { (val) => setHeight(val[0]) } 
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

export default CreateAccountHeight;