import { View, StyleSheet, ActivityIndicator } from "react-native";
import PropTypes from 'prop-types';
import { useContext } from "react";

import { globalThemes } from '../styles_global.js';
import ThemeContext from "../contexts/ThemeContext.js";

/**
* A View that covers 100% of its parent's width and height, displaying a loading icon in its centre, with optional 
  transparency.

* Props:
    @param { bool } isTransparent - Whether the View is transparent.
*/
function LoadingArea({ isTransparent })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    return (
        <View 
            style = {{ 
                ...styles.loadingScreen, 
                backgroundColor: isTransparent ? `${theme.header}99` : theme.content
            }}
        >
            <ActivityIndicator size="large" color = { theme.borders } />
        </View>
    );
}

LoadingArea.propTypes =
{
    isTransparent: PropTypes.bool,
};

LoadingArea.defaultProps =
{
    isTransparent: true,
}

const styles = StyleSheet.create(
    {
        loadingScreen:
        {
            position: "absolute", 
            width: '100%', height: '100%', 
            justifyContent: 'center', alignItems: 'center', 
            zIndex: 100
        }
    }
);

export default LoadingArea;