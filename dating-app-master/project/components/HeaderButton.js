import { StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { useContext } from "react";

import ButtonStandard from './ButtonStandard';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes } from '../styles_global';

/*
* A button that is designed to be displayed in a page's Header component. As with most apps, the header button is simply
  an icon (i.e. no text).

* Props:
    > icon: a function that takes a parameter list of (size, colour) and returns a vector icon (such as from Ionicons) 
      that uses the size and colour arguments for its corresponding props.
    > onPress: onPress prop is a function that's called when the icon is clicked.
*/
function HeaderButton({ icon, onPress, style, inactive })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    return (
        <ButtonStandard 
            icon = { icon(globalProps.sizeIconHeaderFooter, theme.iconHeader) }
            onPress = { onPress }
            style = { {...styles.button, ...style } }
            inactive = { inactive }
        />
    )
};

HeaderButton.propTypes =
{
    icon: PropTypes.func.isRequired,
    onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create(
    {
        button:
        {
            backgroundColor: 'transparent',
            paddingVertical: (globalProps.heightHeader - globalProps.sizeIconHeaderFooter) / 2,
            paddingHorizontal: (globalProps.heightHeader - globalProps.sizeIconHeaderFooter) / 3
        }
    }
);

export default HeaderButton;