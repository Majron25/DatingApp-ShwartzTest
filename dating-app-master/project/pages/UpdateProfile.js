import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import PropTypes from 'prop-types';
import { useContext } from "react";
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import propsHeaderButtons from '../components/props_header_buttons.js';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import TextInputStandard from '../components/TextInputStandard.js';
import { SelectList } from 'react-native-dropdown-select-list';
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import Container from "../components/Container.js";
import ApiRequestor from "../ApiRequestor.js";
import { childStatuses, religions } from "../shared_data.js";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "../AuthContext.js";

/*
* The page on which the user can update their visible profile.

* Props:
    > navigation: the global navigation object.
*/

function UpdateProfile({ navigation })
{
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ isLoading, setIsLoading ] = useState(false);

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    // Maximum character length of the description field.
    const maxLengthDescription = 1000;

    const { userData, setUserData } = useAuth();

    const [ newChildStatus, setNewChildStatus ] = useState(userData.childStatus);
    const [ newGender, setNewGender ] = useState(userData.gender);
    const [ newReligion, setNewReligion ] = useState(userData.religion);
    const [ newDescription, setNewDescription ] = useState(userData.description);

    // The number of remaining characters for the description
    let numRemainingCharacters = maxLengthDescription - newDescription.length;

    const iconMale = (
        <MaterialCommunityIcons name = "human-male" size = { 80 } color = { theme.borders } />
    );
    const iconFemale = (
        <MaterialCommunityIcons name = "human-female" size = { 80 } color = { theme.borders } />
    );

    // Basic variable to check if any of the fields have been changed, to be used as an inactive trigger on the update profile button.
    let unChanged = (newGender === userData.gender && 
                newChildStatus === userData.childStatus &&
                newReligion === userData.religion &&
                newDescription === userData.description);


    // Handlers for gender and sexual preference remain unchanged from account creation.
    const handleGender = (genderSelection) => 
    {
        setNewGender(genderSelection);
    }

    const handleContinue = async () => 
    {
        if (unChanged)
        {
            console.log("No changes detected.");
            navigation.goBack();
            return;
        }

        setIsLoading(true);

        const fetchResponse = await ApiRequestor.updateProfile(userData._id, newGender, newChildStatus, newReligion, newDescription);
        console.log(fetchResponse.status);

        setIsLoading(false);

        if (fetchResponse)
        {
            setUserData(
                (prev) => 
                { 
                    return { ...prev, gender: newGender, childStatus: newChildStatus, religion: newReligion, description: newDescription };
                }
            );

            navigation.goBack();
        }
    };

    // Props for the pop-up that appears when the user attempts to leave with unsaved changes.
    const propsPopUpUnsavedChanges = 
    {
        title: 'Save Changes?',
        message: "You have unsaved changes. Would you like to save before leaving?",
        buttons: [
            {
                text: "Save and Exit",
                onPress: handleContinue,
            },
            {
                text: "Exit Without Saving",
                onPress: () => {
                    navigation.goBack();
                },
            },
            {
                text: "Cancel",
            }
        ]
    };

    const handleCancel = () =>
    {
        if (unChanged)
        {
            console.log("No changes detected.");
            navigation.goBack();
            return;
        }

        setPropsPopUpMsg(propsPopUpUnsavedChanges)
    };

    // Props that define the 'back' header button for when there have been changes.
    const headerButtonBack = 
    {
        icon: (size, colour) =>
        {
            return (
                <Ionicons 
                    name = "chevron-back-sharp" color = { colour } 
                    size = { size } 
                />
            )
        },
        onPress: (navigation, setPropsPopUp) =>
        {
            setPropsPopUp(propsPopUpUnsavedChanges);
        }
    };

    return (
        <PageContainer
            navigation = { navigation } 
            propsLeftHeaderButtons = { [ !unChanged ? headerButtonBack : propsHeaderButtons.back ]  }
            isLoading = { isLoading } propsPopUpMsg = { propsPopUpMsg }
            style = { styles.container } showNavBar = { false }
        >

            <ScrollView
                vertical = { true }
                style = {{ height: 1 }}
                contentContainerStyle = { styles.conStatements }
            >

                <Container>
                    <TextStandard 
                        text = "Child Status" 
                        size = { 1 } isBold
                        style = { styles.title }
                    />

                    <SelectList 
                        setSelected = { (val) => setNewChildStatus(val) } 
                        data = { childStatuses } defaultOption={ childStatuses[newChildStatus - 1] }
                        save = "key"
                        search = { false }
                        boxStyles = {{ borderColor: theme.borders }}
                        dropdownStyles = {{ borderColor: theme.borders }}
                        inputStyles = {{ 
                            color: theme.font, fontSize: utilsGlobalStyles.fontSizeN()
                        }}
                        dropdownTextStyles = {{ color: theme.font, fontSize: utilsGlobalStyles.fontSizeN() }}
                        arrowicon = {
                            <Ionicons 
                                name = "chevron-down-sharp" color = { theme.font } 
                                size = { 25 } 
                            />
                        }
                    />
                </Container>

                <Container>
                    <TextStandard 
                        text = "Religious Status" 
                        size = { 1 } isBold
                        style = { styles.title }
                    />

                    <SelectList 
                        setSelected = { (val) => setNewReligion(val) } 
                        data = { religions } defaultOption = { religions[newReligion - 1] }
                        save = "key"
                        search = { false }
                        boxStyles = {{ borderColor: theme.borders }}
                        dropdownStyles = {{ borderColor: theme.borders }}
                        inputStyles = {{ 
                            color: theme.font, fontSize: utilsGlobalStyles.fontSizeN(0), textAlignVertical: "center"
                        }}
                        dropdownTextStyles = {{ color: theme.font, fontSize: utilsGlobalStyles.fontSizeN(0) }}
                        arrowicon = {
                            <Ionicons 
                                name = "chevron-down-sharp" color = { theme.font } 
                                size = { 30 } 
                            />
                        }
                    />
                </Container>

                <Container>
                    <TextStandard 
                        text = "Description" 
                        size = { 1 } isBold
                        style = { styles.title }
                    />

                    <TextInputStandard 
                        text = { newDescription }
                        maxLength = { maxLengthDescription }
                        multiline
                        placeholder = "Describe yourself ..."
                        onChangeText = { (text) => setNewDescription(text) }
                        style = { { height: Dimensions.get("screen").height * 0.3 } }
                    />

                    <TextStandard 
                        text = { numRemainingCharacters.toString() } 
                        size = { 1 }
                        isBold
                        style = {{ 
                            textAlign: "right", marginTop: utilsGlobalStyles.spacingVertN(-5)
                        }}
                    />
                </Container>

                <Container>
                    <TextStandard 
                        text = "I am a ..." 
                        size = { 1 } isBold
                        style = { styles.title }
                    />

                    <View style = { styles.containerGender }>
                        <ButtonStandard
                            icon = { iconMale } 
                            style = {{ 
                                ...styles.buttonGender, borderWidth: newGender == 'M' ? 2 : 0, backgroundColor: theme.header 
                            }}
                            onPress = { () => handleGender('M') }
                        />
                        <ButtonStandard
                            icon = { iconFemale } 
                            style = {{ 
                                ...styles.buttonGender, borderWidth: newGender == 'F' ? 2 : 0, backgroundColor: theme.header 
                            }}
                            onPress = { () => handleGender('F') }
                        />
                    </View>
                </Container>

            </ScrollView>

            <View style = {{ ...styles.buttonContainer, borderColor: theme.borders }}>
                <LinearGradient
                    colors={['transparent', 'transparent'  ]}
                    style={{
                        ...styles.linearGradientButton, 
                    }}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }} 
                >  
                    <ButtonStandard
                        text = "CANCEL" sizeText = {1}
                        style = {{ ...styles.button,  backgroundColor: theme.buttonLessVibrant, borderWidth: 1 }}
                        isBold  
                        onPress={handleCancel}
                    />
                </LinearGradient>
                <LinearGradient
                        colors={[theme.buttonMoreVibrant, theme.buttonStandard, theme.buttonLessVibrant ]}
                        style={{
                            ...styles.linearGradientButton, 
                        }}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }} 
                    >  
                    <ButtonStandard
                        text = { "SAVE"} sizeText = {1}
                        style = {{ ...styles.button, backgroundColor: 'transparent', borderWidth: 1 }}
                        isBold 
                        onPress={handleContinue}
                    />
                </LinearGradient> 
            </View>

        </PageContainer>
    );
}


UpdateProfile.propTypes =
{
    navigation: PropTypes.object.isRequired,
};

UpdateProfile.defaultProps =
{
};

const styles = StyleSheet.create(
    {
        container:
        {
            paddingHorizontal: 0, paddingVertical: 0
        },
        conStatements:
        {
            flexGrow: 1,
            paddingVertical: utilsGlobalStyles.spacingVertN(),
            paddingHorizontal: utilsGlobalStyles.spacingVertN(-2),
            rowGap: utilsGlobalStyles.spacingVertN(1)
        },
        buttonContainer: 
        {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: utilsGlobalStyles.spacingVertN(-1),
            borderTopWidth: 1,
        },
        btnSaveCancel: 
        {
            paddingVertical: 15,
            width: "40%",
            borderRadius: globalProps.borderRadiusStandard,
        },
        title:
        {
            marginBottom: utilsGlobalStyles.spacingVertN(-2)
        },
        description:
        {
            marginTop: utilsGlobalStyles.spacingVertN(-4)
        },
        centeredView: 
        {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 22,
        },
        button: 
        {
            width: "100%",
            padding: 15,
            alignContent: "center",
            borderRadius: 100,  
            backgroundColor: 'transparent'
        }, 
        linearGradientButton:
        {
            width: "45%", 
            //alignContent: "center",
            borderRadius: 100,  
        }, 
        btnContinue:
        {
            width: "100%",
            padding: 10,
            borderRadius: globalProps.borderRadiusStandard,
            marginTop: utilsGlobalStyles.spacingVertN(),
            //borderRadius: globalProps.borderRadiusStandard,
            //marginTop: utilsGlobalStyles.spacingVertN(),
            
            borderRadius: 100,  
            backgroundColor: 'transparent'
        },
        containerGender:
        {
            marginTop: utilsGlobalStyles.spacingVertN(-1),
            flexDirection: "row",
            columnGap: 30,
            justifyContent: "center",
            alignItems: "center"
        },
        buttonGender: 
        {
            height: 130,
            width: 80,
            borderRadius: 10
        },
    }
);

export default UpdateProfile;

