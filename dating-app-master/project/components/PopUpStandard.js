import { View, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { useContext } from "react";

import TextStandard from './TextStandard';
import ButtonStandard from './ButtonStandard';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { utilsGlobalStyles, globalThemes } from '../styles_global';

/*
* The app's pop-up message component.

* Props:
    > title: the pop-up's title.
    > message: the pop-up's message.
    > buttons: the pop-up's buttons. This should be an array of objects. Each object should have two properties: text
      (string) and onPress (function). The button's 'text' is required, but 'onPress' is not. If there's only one 
      button, the pop-up is automatically dismissable (regardless of the value of 'dismissable') and said button's 
      onPress function gets called when the pop-up is dismissed.
    > removePopUp: the function that contains the logic to remove the pop-up.
    > dismissable: a boolean that, when true, indicates that the pop-up can be dismissed by clicking off it. This should
      be false if you want the user to click one of the buttons.
*/
function PopUpStandard({ title, message, buttons, removePopUp, dismissable })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    // The onPress prop of the container.
    let onPressContainer = undefined;

    if (buttons.length === 1)
    {
        onPressContainer = () => 
        { 
            removePopUp();

            if (buttons[0].onPress) 
                buttons[0].onPress(); 
        }
    }
    else if (dismissable)
    {
        onPressContainer = removePopUp;
    }

    return (
        <Modal
            visible = { true }
            transparent
            animationType = "slide"
        >

            <TouchableOpacity
                onPress = { onPressContainer }
                style = {{ 
                    backgroundColor: theme.header + "7A",
                    ...styles.container,
                }}
                activeOpacity = { 1 }
            >

                <TouchableOpacity
                    style = {{
                        backgroundColor: `${theme.content}DD`,
                        borderColor: theme.borders,
                        ...styles.alertBox
                    }}
                    activeOpacity = { 1.0 }
                >
                    {/* Title */}
                    <TextStandard text = { title } size = { 1 } isBold />

                    {/* Message */}
                    <TextStandard text = { message } />

                    {/* Buttons */}
                    {
                        buttons.map(
                            (button, index) =>
                            {
                                return (
                                    <ButtonStandard 
                                        text = { button.text } 
                                        sizeText = { 1 }
                                        isBold
                                        onPress = { 
                                            () => 
                                            { 
                                                removePopUp();

                                                if (button.onPress) 
                                                    button.onPress(); 
                                            }
                                        }
                                        style = {{...styles.button, backgroundColor: theme.buttonLessVibrant }}
                                        key = { index }
                                    />
                                )
                            }
                        )
                    }
                </TouchableOpacity>
                
            </TouchableOpacity>

        </Modal>
    );
}

PopUpStandard.propTypes =
{
    title: PropTypes.string,
    message: PropTypes.string,
    buttons: PropTypes.arrayOf(
        PropTypes.shape(
            {
                text: PropTypes.string.isRequired,
                onPress: PropTypes.func
            }
        )
    ),
    removePopUp: PropTypes.func.isRequired,
    dismissable: PropTypes.bool
};

PopUpStandard.defaultProps =
{
    title: "",
    message: "",
    dismissable: true
}

const styles = StyleSheet.create(
    {
        container:
        {
            alignItems: "center",
            justifyContent: "center", 
            flex: 1,
            paddingHorizontal: utilsGlobalStyles.spacingVertN(-1),
        },
        alertBox: 
        {
            width: Dimensions.get("screen").width * 0.8,
            borderWidth: 1,
            rowGap: utilsGlobalStyles.spacingVertN(-1),
            padding: utilsGlobalStyles.fontSizeN(),
            borderRadius: globalProps.borderRadiusStandard
        },
        button:
        {
            paddingVertical: utilsGlobalStyles.fontSizeN() / 2,
            borderRadius: globalProps.borderRadiusStandard
        }
    }
);

function PopUpOk(title, message, onPress, dismissable)
{
    return {
        title: title,
        message: message,
        buttons: [
            { text: "OK", onPress: onPress }
        ],
        dismissable: dismissable
    }
}

export { PopUpStandard as default, PopUpOk };