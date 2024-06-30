import { TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useContext, useState } from "react";

import TextStandard from './TextStandard';
import ThemeContext from "../contexts/ThemeContext.js";
import { globalThemes } from '../styles_global';

/*
* A customisable button component which by default implements the app's global theme.

* Props:
    > icon: a component such as a vector image from a library like MaterialCommunityIcons. For more icons, see the
      following link: https://oblador.github.io/react-native-vector-icons/.
    > text: the text that is displayed on the button.
    > sizeText: the size of the text. IMPORTANT: this is not fontSize, but rather the 'rank' of the fontSize (see 
      styles_global.js for more info).
    > isBold: whether the text is bold.
    > activeOpacity: how opaque the button is when it's pressed, where 1.0 is completely opaque (i.e. no change) and 0.0
      is completely transparent.
    > onPress: the function that is called when the button is pressed.
    > doubleClick: whether a 'double click' is required to activate the button's onPress.
    > style: the style of the component's container.
    > styleText: the style of the text within the container. The TextStandard component is used here, so refer to that
      component's code for information regarding how styling is applied.
    > inactive a flag that, when true, indicates that the button should be inactive.

*/
function ButtonStandard({ children, icon, text, sizeText, isBold, activeOpacity, onPress, doubleClick, style, styleText,
                          inactive })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ timeLastPress, setTimeLastPress ] = useState(0);

    let styleCustom = {};

    if (style instanceof Array)
    {
        for(let i = 0; i < style.length; ++i) 
        {
            Object.assign(styleCustom, style[i]);
        }
    }
    else
    {
        styleCustom = style;
    }

    return (
        <TouchableOpacity
            onPress = { 
                () =>
                {
                    if (inactive)
                    {
                        return;
                    }

                    if (!doubleClick)
                    {
                        onPress();
                        return;
                    }

                    const timeCurrent = new Date().getTime();

                    const timeBetweenPresses = timeCurrent - timeLastPress;

                    if (timeBetweenPresses <= 1000)
                    {
                        onPress();
                    }

                    setTimeLastPress(timeCurrent);
                } 
            }
            style = {{ 
                backgroundColor: !inactive ? theme.buttonStandard : theme.buttonStandardInactive,
                borderColor: theme.borders,
                ...styles.button, 
                ...styleCustom
            }}
            activeOpacity = { activeOpacity} // Changes the component's opacity when pressed.
        >
            {/* The button's icon. If present, the icon is placed above text. */}
            { icon }

            {/* The button's text. */}
            {
                text && (
                    <TextStandard 
                        text = { text } 
                        size = { sizeText } 
                        isBold = { isBold } 
                        style = {{ 
                            color: !inactive ? theme.fontButton : theme. fontButtonInactive, ...styleText, 
                            textAlign: "center" 
                        }}
                    />
                )
            }

            { children }

        </TouchableOpacity>
    );
}

ButtonStandard.propTypes =
{
    icon: PropTypes.node,
    text: PropTypes.oneOfType([ PropTypes.string, PropTypes.number]),
    sizeText: PropTypes.number,
    isBold: PropTypes.bool,
    opacity: PropTypes.number,
    onPress: PropTypes.func,
    doubleClick: PropTypes.bool,
    style: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ]),
    styleText: PropTypes.object,
    inactive: PropTypes.bool
};

ButtonStandard.defaultProps =
{
    text: "",
    sizeText: 0,
    isBold: false,
    activeOpacity: 0.7,
    doubleClick: false,
    style: {},
    styleText: {},
    inactive: false
}

const styles = StyleSheet.create(
    {
        button:
        {
            alignItems: "center",
            justifyContent: "center"
        }
    }
);

export default ButtonStandard;