import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';
import { Ionicons } from '@expo/vector-icons';

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import TextInputStandard from '../../components/TextInputStandard.js';
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js';
import { religions } from '../../shared_data.js'; 
import HeaderButton from '../../components/HeaderButton.js';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

/*
* The account-creation page in which the user selects their religious background.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountReligion({ navigation, route })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ religion, setReligion ] = useState("");

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
            navigation.navigate("createAccountChildren", { ...route.params, religion: religion })
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
                    text = "Religious Background" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = "Your religious background will be public." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1)
                    }}
                />
            </Animated.View>
            
            <Animated.View style = {{opacity: contentOpacity}}>
                <SelectList 
                    setSelected = { (val) => setReligion(val) } 
                    data = { religions } 
                    save = "key"
                    search = { false }
                    boxStyles = {{ borderColor: theme.borders }}
                    dropdownStyles = {{ borderColor: theme.borders }}
                    inputStyles = {{ 
                        color: theme.font, fontSize: utilsGlobalStyles.fontSizeN(1), 
                        fontWeight: globalProps.fontWeightBold, textAlignVertical: "center",
                    }}
                    dropdownTextStyles = {{ color: theme.font, fontSize: utilsGlobalStyles.fontSizeN(0) }}
                    arrowicon = {
                        <Ionicons 
                            name = "chevron-down-sharp" color = { theme.font } 
                            size = { 30 } 
                        />
                    }
                /> 
            </Animated.View>
            <Animated.View style = { {...styles.conBottom, opacity: contentOpacity} }> 
                <LinearGradient
                    colors={
                        religion === "" ? 
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
                        inactive={ religion == '' }
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

export default CreateAccountReligion;