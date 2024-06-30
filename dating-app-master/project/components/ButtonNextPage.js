import { View, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useContext } from "react";
import { Ionicons } from '@expo/vector-icons';

import TextStandard from './TextStandard';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global';
import { LinearGradient } from 'expo-linear-gradient';

/*
* A customisable button component which by default implements the app's global theme.

* Props:
    > icon: a component such as a vector image from a library like MaterialCommunityIcons. For more icons, see the
            following link: https://oblador.github.io/react-native-vector-icons/.
    > text: the text that is displayed on the button.
    > sizeText: the size of the text. IMPORTANT: this is not fontSize, but rather the 'rank' of the fontSize (see 
                styles_global.js for more info).
    > isBold: whether the text is bold.
    > backgroundColorIcon: the backgroundColor of the icon.
    > onPress: the function that is called when the button is pressed.
    > style: the style of the component's container.
    > styleText: the style of the text within the container. The TextStandard component is used here, so refer to that
                 component's code for information regarding how styling is applied.
*/
function ButtonNextPage({ icon, text, sizeText, isBold, backgroundColorIcon, onPress, style, styleText })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    return (
        
        <LinearGradient
            colors={[theme.buttonMoreVibrant, theme.buttonStandard, theme.buttonLessVibrant ]}
            style={{ 
                marginBottom: globalProps.spacingVertBase/2,
                borderColor: theme.borders,
                ...styles.container, 
                ...style,
                ...styles.conTextAndIcon,
                borderRadius: 100
            }}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }} 
        >
        <TouchableOpacity
            onPress = { onPress }
            style = {{ 
                backgroundColor: 'transparent',
                width: '100%',
                height: '100%',
                paddingVertical: utilsGlobalStyles.fontSizeN(sizeText) / 2,
                paddingHorizontal: utilsGlobalStyles.fontSizeN(sizeText) / 2,
            }}
            activeOpacity = { 0.8 } // Changes the component's opacity when pressed.
        >
            <View style = {{
                flexDirection: "row", 
                
            }}>
                <View style = {{ backgroundColor: backgroundColorIcon }}>
                    { icon }
                </View>
                <View style = { {...styles.conTextAndIcon, }}> 
                    {/* The button's text. */}
                    {
                        text && (
                            <TextStandard 
                                text = { text } 
                                size = { sizeText } 
                                isBold = { isBold } 
                                style = {{ 
                                    color: theme.fontButton, ...styleText, textAlign: "center", 
                                    marginLeft: utilsGlobalStyles.fontSizeN(sizeText)
                                }}
                            />
                        )
                    }

                    
                </View>
                <View style={{ flex: 1,  alignItems: 'flex-end'}}>
                    <Ionicons 
                        name = "chevron-forward-sharp" color = { theme.iconButtonNextPage }  
                        size = { globalProps.sizeIconHeaderFooter } 
                    />
                </View>
            </View>

        </TouchableOpacity>
        </LinearGradient>  
    );
}

ButtonNextPage.propTypes =
{
    icon: PropTypes.node,
    text: PropTypes.string.isRequired,
    sizeText: PropTypes.number,
    isBold: PropTypes.bool,
    backgroundColorIcon: PropTypes.string,
    onPress: PropTypes.func,
    style: PropTypes.object,
    styleText: PropTypes.object,
};

ButtonNextPage.defaultProps =
{
    sizeText: 0,
    isBold: false,
    backgroundColorIcon: "transparent",
    style: {},
    styleText: {}
}

const styles = StyleSheet.create(
    {
        container:
        {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: 1,
            // borderRadius: 10,
            width: "100%"
        },
        conTextAndIcon: 
        {
            alignItems: 'center',
            flexDirection: 'row',  
        }
    }
);

export default ButtonNextPage;