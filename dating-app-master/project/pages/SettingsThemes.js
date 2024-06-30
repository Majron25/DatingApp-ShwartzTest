import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';

import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global';
import propsHeaderButtons from '../components/props_header_buttons.js';
import ThemeContext from "../contexts/ThemeContext.js";
import TextStandard from '../components/TextStandard.js';
import PageContainer from '../components/PageContainer.js';
import ButtonTheme from '../components/ButtonTheme'; 

function SettingsThemes({ navigation, loggedOut }) 
{
    // The name of the current theme and the function that handles updating it.
    const { themeName, updateTheme } = useContext(ThemeContext);

    return ( 
        <PageContainer
            navigation = { navigation }
            showNavBar = { !loggedOut }
            propsLeftHeaderButtons = { [ propsHeaderButtons.back ] }
            // propsRightHeaderButtons = {  }
            style = {{ paddingHorizontal: 15 }}
        > 
            <TextStandard 
                text = "Select a theme from below." 
                isBold
                style = {{ 
                    textAlign: "center", marginBottom: globalProps.spacingVertBase 
                }}
            />

            <View
                style = { styles.conButtons }
            >
                {
                    Object.keys(globalThemes).map(
                        (themeNameI, index) =>
                        {

                            return (
                                <View key = { index } style = {{ ...styles.conButton, borderRadius: 10 }}>
                                    <ButtonTheme 
                                        themeName = { themeNameI } 
                                        height = { 140 } 
                                        width = { 75 } 
                                        isSelected = { themeNameI === themeName }
                                        onPress = { () => updateTheme(themeNameI) }
                                    />
                                    <TextStandard text = { globalThemes[themeNameI].name } isBold />
                                </View>
                            )
                        }
                    )
                }
            </View>

        </PageContainer>
    );
}

const styles = StyleSheet.create(
    {
        conButton:
        {
            alignItems: "center",
            // justifyContent: "center"
        },
        conButtons:
        {
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "center",
            columnGap: utilsGlobalStyles.spacingVertN(1),
            rowGap: globalProps.spacingVertBase,
        }
    }
);

export default SettingsThemes;