import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useContext } from 'react';

import globalProps, { utilsGlobalStyles, globalThemes } from "../styles_global.js";
import ThemeContext from "../contexts/ThemeContext.js";
/* 
* This is a basic container element designed to break up the content of a page.

* Props:
    > children: any children components.
    > style: an optional styling object.
*/
function Container({ children, style })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    return ( 
        <View 
            style = {{ 
                ...style, ...styles.container, borderWidth: 1, 
                borderColor: theme.borders 
            }}
        >

            { children }

        </View>
    );
}

Container.propTypes =
{
    children: PropTypes.node,
    style: PropTypes.object,
};

Container.defaultProps =
{
    style: {}
}

const styles = StyleSheet.create(
    {
        container:
        {
            width: "100%",
            maxWidth: 500,
            paddingVertical: utilsGlobalStyles.spacingVertN(-2),
            paddingHorizontal: utilsGlobalStyles.spacingVertN(-1),
            borderRadius: globalProps.borderRadiusStandard,
            overflow: "hidden"
        }
    }
)


export default Container;