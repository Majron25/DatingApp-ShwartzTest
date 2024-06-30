
import { View, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useContext, useState } from "react";
import ThemeContext from "../contexts/ThemeContext.js";
import { Ionicons } from '@expo/vector-icons';

import globalProps, { utilsGlobalStyles, globalThemes } from '../styles_global';
import ButtonStandard from './ButtonStandard.js';

/*
* An element that returns a React Native TextInput element that adheres to the app's global styling, as defined in the 
  file 'styles_global.js'.

* Props:
    > text: The text to be rendered.
    > size: the size of the text. IMPORTANT: this is not fontSize, but rather the 'rank' of the fontSize (see 
      styles_global.js for more info).
    > isBold: whether the text is bold.
    > placeholder: the placeholder text (i.e. what is displayed when given an empty string).
    > maxLength: the maximum length of the text that can be inputted.
    > onChangeText: the function that's called when the user adds/removes text.
    > onPressIn: the function that's called when the user clicks the text input.
    > secureTextEntry: determines whether to hide the user's input. When true, the user's text is, by default hidden, 
      but an 'eye' button is rendered that allows the user to toggle this. Note that if multiline is true, this will not
      work.
    > multiline: whether the user can enter multiple lines.
    > maxHeight: the maximum height of the container before the component scrolls. This may be useful for creating a
      text-based messaging system, whereby the textbox starts at a normal single-line height, but expands to a set 
      maximum as the user enters more lines/characters.
    > numLines: Sets the number of lines the component should display before scrolling.
    > autoCorrect: whether autocorrect is enabled.
    > style: any additional styling to apply to the TextInput element. Note that fontWeight, fontSize, 
      borderRadius, and borderColor attributes will be overridden.
    > editable: whether the text can be edited.
    > textAlignment: the alignment of the text.
*/
function TextInputStandard({ text, size, isBold, placeholder, maxLength, onChangeText, onPressIn, secureTextEntry, 
                             multiline, maxHeight, numLines, autoCorrect, editable, style, textAlignment })
{
    // Whether text is visible (only relevant if the secureTextEntry flag has been set to true).
    const [ isTextVisible, setIsTextVisible ] = useState(false);

    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    // The font size.
    const fontSize = utilsGlobalStyles.fontSizeN(size);

    // Whether the hide/unhide icon appears to the right of the text.
    const isEyeShown = (secureTextEntry && !multiline);

    return (
        <View
            style = {{
                ...styles.container,
                borderColor: theme.borders,
                borderRadius: fontSize / 2,
                maxHeight: maxHeight,
                paddingVertical: fontSize / 2,
                ...style,
            }}
        >
            <TextInput
                textAlign = { textAlignment }
                value = { text }
                placeholder = { placeholder }
                placeholderTextColor = { theme.fontFaded } // Change this to a more 'faded' version of theme.Font.
                maxLength = { maxLength }
                onChangeText = { onChangeText }
                onPressIn = { onPressIn }
                secureTextEntry = { secureTextEntry && !isTextVisible }
                multiline = { multiline }
                numberOfLines = { numLines }
                autoCorrect = { autoCorrect }
                style = {{
                    color: theme.font,
                    fontWeight: isBold ? globalProps.fontWeightBold : 'normal', 
                    fontSize: fontSize,
                    marginLeft: fontSize,
                    marginRight: isEyeShown ? 0 : fontSize,
                    flex: 1,
                    textAlignVertical: (multiline) ? "top" : "auto"
                }}
                editable = { editable }
            />
            {
                isEyeShown && (
                    <ButtonStandard 
                        icon = { 
                            <Ionicons 
                                name = { isTextVisible ? "eye" : "eye-off" } color = { theme.font }  
                                size = { fontSize * 1.25 } 
                            />
                        } 
                        onPress = { () => setIsTextVisible(!isTextVisible) }
                        style = {{
                            paddingHorizontal: fontSize,
                            backgroundColor: "transparent",
                        }}
                    />
                )
            }

        </View>
    );
}

TextInputStandard.propTypes =
{
    text: PropTypes.string.isRequired,
    size: PropTypes.number,
    isBold: PropTypes.bool,
    placeholder: PropTypes.string,
    maxLength: PropTypes.number,
    onChangeText: PropTypes.func,
    onPressIn: PropTypes.func,
    secureTextEntry: PropTypes.bool,
    multiline: PropTypes.bool,
    maxHeight: PropTypes.number,
    numLines: PropTypes.number,
    autoCorrect: PropTypes.bool,
    editable: PropTypes.bool,
    style: PropTypes.object,
    textAlignment: PropTypes.oneOf([ 'center', 'left', 'right' ])
};

TextInputStandard.defaultProps =
{
    size: 0,
    isBold: false,
    placeholder: "",
    maxLength: undefined,
    onChangeText: undefined,
    onPressIn: undefined,
    secureTextEntry: false,
    multiline: false,
    maxHeight: undefined,
    numLines: undefined,
    autoCorrect: true,
    editable: true,
    style: {},
    textAlignment: 'left'
}

const styles = StyleSheet.create(
    {
        container:
        {
            borderWidth: 1,
            flexDirection: "row",
            justifyContent: "space-between",
        },
        containerTextInput:
        {
            flex: 1
        }   
    }
);

export default TextInputStandard;