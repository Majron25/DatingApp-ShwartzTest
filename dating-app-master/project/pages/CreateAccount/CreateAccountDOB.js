import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Platform, Animated } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import TextInputStandard from '../../components/TextInputStandard.js';
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js';
import utils from '../../utils/utils.js'; 
import { LinearGradient } from 'expo-linear-gradient';
import HeaderButton from '../../components/HeaderButton.js';
import { Ionicons } from '@expo/vector-icons';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

const initialDate = new Date(2000, 0, 1);

/*
* The account-creation page in which the user enters their date of birth.

* Notes:
    > The following video was useful: https://www.youtube.com/watch?v=UEfFjfW7Zes.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountDOB({ navigation, route })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ date, setDate ] = useState(initialDate);

    const [ dateOfBirth, setDateOfBirth ] = useState(utils.formatDateDMY(initialDate));

    const [ showDatePicker, setShowDatePicker ] = useState(false);

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const toggleShowDatePicker = () =>
    {
        if (animationsComplete)
        {
            setShowDatePicker(!showDatePicker);
        }
    }

    const handleChangeDate = (event, selectedDate) =>
    {
        if (event.type == 'set')
        {
            const currentDate = selectedDate;
            setDate(currentDate);

            if (Platform.OS === 'android')
            {
                toggleShowDatePicker();
                setDateOfBirth(utils.formatDateDMY(currentDate));
            }
        }
        else
        {
            toggleShowDatePicker();
        }
    }  
    const handleContinue = () =>
    {
        // Check if the user is over 18.
        if (utils.getAgeFromDate(dateOfBirth) < 18)
        {
            setPropsPopUpMsg(
                {
                    title: "Not Over 18",
                    message: "You must be over 18 to use this app.",
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
            navigation.navigate("createAccountGender", { ...route.params, dob: dateOfBirth })
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
            <Animated.View style={{ 
                alignItems: 'center', 
                marginTop: "20%",
                opacity: contentOpacity, 
            }}> 
                <TextStandard 
                    text = "What's your date of birth?" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = "Your age will be public." 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1)
                    }}
                />
            </Animated.View>

            {
                showDatePicker && (
                    <DateTimePicker 
                        value = { date }
                        onChange = { handleChangeDate }
                        display = "spinner"
                    />
                )
            }

            {
                !showDatePicker && (
                    <Animated.View style={{opacity: inputOpacity, transform: [{translateY: translate}]}}>
                        <Pressable
                            onPress = { toggleShowDatePicker } 
                        >
                            <TextInputStandard
                                text = { dateOfBirth }
                                size = { 0 }
                                placeholder = "Some Date"
                                onChangeText = { (text) => setName(text) }
                                editable = { false }
                                style = { { ...globalStyles.textboxSingleLine } }
                            />
                        </Pressable>
                    </Animated.View>
                )
            }

            <Animated.View style = { {...styles.conBottom, opacity: contentOpacity}}> 
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

export default CreateAccountDOB;