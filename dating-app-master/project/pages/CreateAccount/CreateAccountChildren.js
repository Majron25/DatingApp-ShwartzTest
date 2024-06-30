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
import { childStatuses } from '../../shared_data.js'; 
import HeaderButton from '../../components/HeaderButton.js';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

/*
* The account-creation page in which the user selects their parental/child status.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountChildren({ navigation, route })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ childStatus, setChildStatus ] = useState(-1);

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
            navigation.navigate("createAccountHeight", { ...route.params, childStatus: childStatus })
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
                    text = "Child Status" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = "Your child status will be public. Select the option that best describes you." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1), width: "80%"
                    }}
                />
            </Animated.View>

            <Animated.View style = {{opacity: contentOpacity}}> 
                <SelectList 
                    setSelected = { (val) => setChildStatus(val) } 
                    data = { childStatuses } 
                    save = "key"
                    search = { false }
                    boxStyles = {{ borderColor: theme.borders }}
                    dropdownStyles = {{ borderColor: theme.borders }}
                    inputStyles = {{ 
                        color: theme.font, fontSize: utilsGlobalStyles.fontSizeN(), 
                        fontWeight: globalProps.fontWeightBold, textAlignVertical: "center",
                    }}
                    dropdownTextStyles = {{ color: theme.font, fontSize: utilsGlobalStyles.fontSizeN() }}
                    arrowicon = {
                        <Ionicons 
                            name = "chevron-down-sharp" color = { theme.font } 
                            size = { 25 } 
                        />
                    }
                />
            </Animated.View>

            <Animated.View style = { {...styles.conBottom, opacity: contentOpacity} }> 
                <LinearGradient
                    colors={
                        childStatus < 0 ? 
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
                        inactive={ childStatus < 0 }
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

export default CreateAccountChildren;

