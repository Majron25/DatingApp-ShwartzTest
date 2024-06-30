
import { Text } from 'react-native';
import PropTypes from 'prop-types';
import { useContext } from "react";

import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { utilsGlobalStyles, globalThemes } from '../styles_global';

/*
* A component that returns a simple React Native Text element that adheres to the app's global theme and styling, as 
  defined in the file 'styles_global.js'.

* Props:
    > text: The text to be rendered.
    > size: the size of the text. IMPORTANT: this is not fontSize, but rather the 'rank' of the fontSize (see 
            styles_global.js for more info).
    > isBold: whether the text is bold.
    > italicise: whether the text is italicised.
    > style: any additional styling to apply to the Text element. Note that fontWeight and fontSize
             attributes will be overridden by the global styles.
*/
function TextStandard({ text, size, isBold, italicise, style })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    return (
        <Text 
            style = {{ 
                color: theme.font,
                borderColor: theme.borders,
                fontWeight: isBold ? globalProps.fontWeightBold : 'normal', 
                fontSize: utilsGlobalStyles.fontSizeN(size),
                fontStyle: italicise ? 'italic' : 'normal',
                ...style, 
            }} 
        >
            { text }
        </Text>
    );
}

TextStandard.propTypes =
{
    text: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    size: PropTypes.number,
    isBold: PropTypes.bool,
    italicise: PropTypes.bool,
    style: PropTypes.object,
};

TextStandard.defaultProps =
{
    size: 0,
    isBold: false,
    italicise: false,
    style: {},
}

export default TextStandard;