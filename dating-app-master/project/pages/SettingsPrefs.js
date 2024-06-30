import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import PropTypes from 'prop-types';
import { useContext } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { SelectList } from "react-native-dropdown-select-list";

import propsHeaderButtons from '../components/props_header_buttons.js';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import Container from "../components/Container.js";
import SliderSingleStandard from "../components/SliderSingleStandard.js";
import SliderRangeStandard from "../components/SliderRangeStandard.js";
import { religions, childStatuses3rdPerson, heightRange } from "../shared_data.js";
import { useAuth } from "../AuthContext.js";
import ApiRequestor from "../ApiRequestor.js";
import utils from "../utils/utils.js"; 
import { LinearGradient } from "expo-linear-gradient";

/*
* The page on which the user can edit their preferences/filters.

* Props:
    > navigation: the global navigation object.
*/
function SettingsPrefs({ navigation })
{
    // The name of the current theme and the function that handles updating it.
    const { themeName, updateTheme } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ isLoading, setIsLoading ] = useState(false);

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const { userData, setUserData, setReloadMatches } = useAuth();

    const [ stMaxDistance, setMaxDistance ] = useState(userData.preferences.maxDistance);

    const [ stAgeRange, setAgeRange ] = useState(userData.preferences.ageRange);

    const [ stSexualPreference, setSexualPreference ] = useState(userData.preferences.sexualPreference);

    const [ stHeightRange, setHeightRange ] = useState(userData.preferences.height);

    const [ stValuesRange, setValuesRange ] = useState(userData.preferences.values);

    const [ stLikeFilter, setLikeFilter ] = useState(userData.preferences.likeFilter);

    const [ stReligiousStatus, setReligiousStatus ] = useState(userData.preferences.religiousStatus);

    const [ stChildStatus, setChildStatus ] = useState(userData.preferences.childStatus);

    // Gender icons.
    const iconMale = (
        <MaterialCommunityIcons name = "human-male" size = { 80 } color = { theme.borders } />
    );
    const iconFemale = (
        <MaterialCommunityIcons name = "human-female" size = { 80 } color = { theme.borders } />
    );

    // Returns whether or not there have been any changes.
    const haveThereBeenAnyChanges = () =>
    {
        if (stMaxDistance != userData.preferences.maxDistance) return true;
        if (stSexualPreference != userData.preferences.sexualPreference) return true;
        if (stLikeFilter != userData.preferences.likeFilter) return true;
        if (stReligiousStatus != userData.preferences.religiousStatus) return true;
        if (stChildStatus != userData.preferences.childStatus) return true;

        if (stValuesRange.high != userData.preferences.values.high || 
            stValuesRange.low != userData.preferences.values.low) return true;
        if (stAgeRange.high != userData.preferences.ageRange.high || 
            stAgeRange.low != userData.preferences.ageRange.low) return true;
        if (stHeightRange.high != userData.preferences.height.high || 
            stHeightRange.low != userData.preferences.height.low) return true;

        return false;
    };

    const handleSave = useCallback(
        async () =>
        {
            if (!haveThereBeenAnyChanges())
            {
                console.log("No changes detected.");
                navigation.goBack();
                return;
            }

            if (stSexualPreference == '')
            {
                setPropsPopUpMsg(
                    {
                        title: "Missing Information",
                        message: "You must select your sexual preference.",
                        buttons: [
                            { text: "OK" }
                        ]
                    }
                );
                return;
            }

            setIsLoading(true);

            const prefs = {
                values: stValuesRange,
                maxDistance: stMaxDistance,
                ageRange: stAgeRange,
                height: stHeightRange,
                likeFilter: stLikeFilter,
                religiousStatus: stReligiousStatus,
                sexualPreference: stSexualPreference,
                childStatus: stChildStatus
            };

            const response = await ApiRequestor.updateUserPrefs(userData._id, prefs);

            if (response.status == 200)
            {
                // Synchronise local user data with that of the server (use the response's data, which is identical to that 
                // which was sent).
                setUserData((prev) => { return { ...prev, preferences: response.data.preferences } });
            }
            else
            {
                // Maybe display a pop-up indicating that a problem has occurred.
                console.log("Error updating preferences.");
            }

            setIsLoading(false);

            setReloadMatches(true);

            navigation.goBack();
        }, 
        [ stValuesRange, stMaxDistance, stAgeRange, stHeightRange, stLikeFilter, stReligiousStatus, stSexualPreference, 
          stChildStatus ]
    );

    const handleSexualPreference = (sexualPrefSelection) => 
    {
        if (stSexualPreference.includes(sexualPrefSelection))
        {
            setSexualPreference((prev) => { return prev.replace(sexualPrefSelection, '') })
        }
        else
        {
            setSexualPreference(
                (prev) => 
                {
                    const newSexPref = (prev + sexualPrefSelection).split('').sort().join('');
                    console.log(newSexPref);
                    return newSexPref; 
                }
            );
        }

    };

    // Props for the pop-up that appears when the user attempts to leave with unsaved changes.
    const propsPopUpUnsavedChanges = useMemo(
        () => {
            return {
                title: 'Save Changes?',
                message: "You have unsaved changes. Would you like to save before leaving?",
                buttons: [
                    {
                        text: "Save and Exit",
                        onPress: handleSave,
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
        },
        [ handleSave ]
    );

    const handleCancel = () =>
    {
        if (!haveThereBeenAnyChanges())
        {
            console.log("No changes detected.");
            navigation.goBack();
            return;
        }

        setPropsPopUpMsg(propsPopUpUnsavedChanges);
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
            propsLeftHeaderButtons = { [ haveThereBeenAnyChanges() ? headerButtonBack : propsHeaderButtons.back ] }
            propsRightHeaderButtons = { [ ] }
            style = { styles.container }
            showNavBar = { false }
            isLoading = { isLoading }
            propsPopUpMsg = { propsPopUpMsg }
        >
            <ScrollView
                vertical = { true }
                style = {{ height: 1 }}
                contentContainerStyle = { styles.conStatements }
            >

                <Container>
                    <TextStandard 
                        text = "Values" 
                        size = { 1 } isBold
                        style = { styles.title } 
                    />

                    <SliderRangeStandard 
                        values = { stValuesRange } 
                        valuesFormatted = {{ 
                            low: `${stValuesRange.low}%`, high: `${stValuesRange.high}%`
                        }}
                        min = { 0 } max = { 100 } step = { 1 } 
                        onChange = { (values) => setValuesRange({ low: values[0], high: values[1] }) } 
                    />

                    <TextStandard 
                        text = "Select how similar your matches' values must be to your own." 
                        size = { 0 } italicise style = { styles.description }
                    />
 
                </Container>

                <Container>
                    <TextStandard 
                        text = "Maximum Distance" 
                        size = { 1 } isBold
                        style = { styles.title } 
                    />

                    <SliderSingleStandard 
                        value = { stMaxDistance } valueFormatted = { `${stMaxDistance}km` }
                        min = { 5 } max = { 100 } step = { 5 } 
                        onChange = { (val) => setMaxDistance(val[0]) } 
                    />

                    <TextStandard 
                        text = "This determines the maximum distance of your matches from your set location." 
                        size = { 0 } italicise style = { styles.description }
                    />
                </Container>

                <Container>
                    <TextStandard 
                        text = "Age Preference" 
                        size = { 1 } isBold
                        style = { styles.title } 
                    />

                    <SliderRangeStandard 
                        values = { stAgeRange }
                        min = { 18 } max = { 80 } step = { 1 } 
                        onChange = { (values) => setAgeRange({ low: values[0], high: values[1] }) }
                    />

                    <TextStandard 
                        text = "Here you can define how old you'd like your matches to be." 
                        size = { 0 } italicise style = { styles.description }
                    />
                </Container>

                <Container>
                    <TextStandard 
                        text = "Height Preference" 
                        size = { 1 } isBold
                        style = { styles.title } 
                    />

                    <SliderRangeStandard 
                        values = { stHeightRange } valuesFormatted = {{ low: utils.cmToFeetAndInch(stHeightRange.low, false), high: utils.cmToFeetAndInch(stHeightRange.high) }}
                        min = { heightRange.min } max = { heightRange.max } step = { 1 } 
                        onChange = { (values) => setHeightRange({ low: values[0], high: values[1] }) } 
                    />

                    <TextStandard 
                        text = "Here you can define the minimum and maximum heights of your matches." 
                        size = { 0 } italicise style = { styles.description }
                    />
                </Container>

                <Container>
                    <TextStandard 
                        text = "Show me ..." 
                        size = { 1 } isBold
                        style = { styles.title } 
                    />

                    <SelectList 
                        setSelected = { (val) => setLikeFilter(val) } 
                        data = { likedSelections } defaultOption = { likedSelections[stLikeFilter] }
                        save = "key"
                        search = { false }
                        boxStyles = {{ borderColor: theme.borders }}
                        dropdownStyles = {{ borderColor: theme.borders }}
                        inputStyles = {{ 
                            color: theme.font, fontSize: utilsGlobalStyles.fontSizeN(0), textAlignVertical: "center", flexShrink: 1
                        }}
                        dropdownTextStyles = {{ color: theme.font, fontSize: utilsGlobalStyles.fontSizeN(0) }}
                        arrowicon = {
                            <Ionicons 
                                name = "chevron-down-sharp" color = { theme.font } 
                                size = { 30 } 
                            />
                        }
                    />

                    <TextStandard 
                        text = { likedSelectionsDescriptions[stLikeFilter] }
                        size = { 0 } italicise style = { styles.description }
                    />
                </Container>

                <Container>
                    <TextStandard 
                        text = "Religious Status" 
                        size = { 1 } isBold
                        style = { styles.title } 
                    />

                    <SelectList 
                        setSelected = { (val) => setReligiousStatus(val) } 
                        data = { religionSelections } defaultOption = { religionSelections[stReligiousStatus] }
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

                    <TextStandard 
                        text = "Filter your matches by religious status."
                        size = { 0 } italicise style = { styles.description }
                    />
                </Container>

                <Container>
                    <TextStandard 
                        text = "Child Status" 
                        size = { 1 } isBold
                        style = { styles.title } 
                    />

                    <SelectList 
                        setSelected = { (val) => setChildStatus(val) } 
                        data = { childSelections } defaultOption = { childSelections[stChildStatus] }
                        save = "key"
                        search = { false }
                        boxStyles = {{ borderColor: theme.borders }}
                        dropdownStyles = {{ borderColor: theme.borders }}
                        inputStyles = {{ 
                            color: theme.font, fontSize: utilsGlobalStyles.fontSizeN(0), textAlignVertical: "center", flexShrink: 1
                        }}
                        dropdownTextStyles = {{ color: theme.font, fontSize: utilsGlobalStyles.fontSizeN(0) }}
                        arrowicon = {
                            <Ionicons 
                                name = "chevron-down-sharp" color = { theme.font } 
                                size = { 30 } 
                            />
                        }
                    />

                    <TextStandard 
                        text = "Filter your matches by child status."
                        size = { 0 } italicise style = { styles.description }
                    />
                </Container>
                
                <Container>
                    <TextStandard 
                        text = "I'm interested in ..." 
                        size = { 1 } isBold
                        style = { styles.title } 
                    />

                    <View style = { styles.containerGender }>
                        <ButtonStandard
                            icon = { iconMale } 
                            style = {{ ...styles.buttonGender, borderWidth: stSexualPreference.includes('M') ? 2 : 0, backgroundColor: theme.header  }}
                            onPress = { () => handleSexualPreference('M') }
                        />
                        <ButtonStandard
                            icon = { iconFemale } 
                            style = {{ ...styles.buttonGender, borderWidth: stSexualPreference.includes('F') ? 2 : 0, backgroundColor: theme.header  }}
                            onPress = { () => handleSexualPreference('F') }
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
                        style = {{ ...styles.btnSaveCancel,  backgroundColor: theme.buttonLessVibrant, borderWidth: 1 }}
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
                        text = "SAVE" sizeText = {1} isBold
                        style = { styles.btnSaveCancel } 
                        onPress={handleSave}
                    />
                </LinearGradient> 
            </View>
        </PageContainer>
    );
}


SettingsPrefs.propTypes =
{
    navigation: PropTypes.object.isRequired,
};

SettingsPrefs.defaultProps =
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
            rowGap: utilsGlobalStyles.spacingVertN(1),
        },
        buttonContainer: 
        { 
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: utilsGlobalStyles.spacingVertN(-1),
            borderTopWidth: 1,
        }, 
        linearGradientButton:
        {
            width: "45%", 
            //alignContent: "center",
            borderRadius: 100,  
        }, 
        btnSaveCancel: 
        {
            width: "100%",
            padding: 15,
            alignContent: "center",
            borderRadius: 100,  
            backgroundColor: 'transparent',
            borderWidth: 1
        },
        title:
        {
            marginBottom: utilsGlobalStyles.spacingVertN(-2), 
            alignSelf: 'center', 
        },
        description:
        {
            marginTop: utilsGlobalStyles.spacingVertN(-2),
            // alignSelf: 'center',
            // width: '80%',
        },
        containerGender:
        {
            marginTop: utilsGlobalStyles.spacingVertN(-1),
            flexDirection: "row",
            justifyContent: "center",
            columnGap: 30,
        },
        buttonGender: 
        {
            height: 130,
            width: 80,
            borderRadius: 10
        },
    }
);

// The 'liked' selections.
const likedSelections = 
[
    { key: 0, value: "People who match my preferences" },
    { key: 1, value: "People who like me and match my preferences" },
    { key: 2, value: "People who like me" },
    { key: 3, value: "Everyone" },
];

// Descriptions for every item in the 'likedSelections' array.
const likedSelectionsDescriptions = 
[
    "You will be shown everyone who matches your preferences.",
    "You will only be shown people who have liked you and who match your preferences.",
    "You will be shown people who have liked you, regardless of whether they match your preferences.",
    "You will be shown everyone, regardless of whether they match your preferences.", // However, they have to match sexual preference.
];

const religionSelections = [ { key: 0, value: "Any" } , ...religions ];

const childSelections = [ { key: 0, value: "Any" }, ...childStatuses3rdPerson ];

export default SettingsPrefs;