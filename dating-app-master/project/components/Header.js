import { View, StyleSheet, Image } from "react-native";
import PropTypes from 'prop-types';
import { useContext } from "react";

import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes } from '../styles_global';
import TextStandard from './TextStandard';
import HeaderButton from "./HeaderButton";

import { MaterialCommunityIcons } from '@expo/vector-icons';

/*
* The custom header component that's used by the PageContainer component.

* Props:
    > navigation: the object that allows for navigation to pages in the app.
    > propsLeftButtons: an array of props for each of the header buttons placed on the left. Each element is an 
      object that has three properties: icon, onPress, and left. The icon is a function that takes a parameter list of 
      (size, colour) and returns a vector icon (such as from Ionicons) that uses the size and colour arguments for its 
      corresponding props. The onPress prop is a function that's called when the icon is clicked.
    > propsRightButtons: same as propsLeftButtons but for the buttons on the right.
    > setPropsPopUp: a function that's used to have a pop-up message appear. This may be desirable to warn the user
      when they click a button in the header, such as an 'exit' button that might cause them to lose progress.
*/
const Header = ({ navigation, propsLeftButtons, propsRightButtons, setPropsPopUp }) => 
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];
  
    return (
        <View 
            style = {{ 
                ...styles.container, backgroundColor: theme.header, borderBottomColor: theme.borders
            }}
        >

            <View style = { { ...styles.sideContainer, ...styles.leftContainer } }>
                {
                    propsLeftButtons && propsLeftButtons.map(
                        (options, index) =>
                        {
                            return (
                                <HeaderButton 
                                    key = { index }
                                    icon = { options.icon }
                                    onPress = { 
                                        () => { options.onPress(navigation, setPropsPopUp) } 
                                    }
                                />
                            )
                        }
                    )
                }
            </View>
            
            <View>
                <View style={{ height: 40, justifyContent: "center" }}>
                    <Image
                        source={require('../assets/icon.png')}
                        style={{
                            width: globalProps.sizeIconHeaderFooter * 1.5,
                            height: globalProps.sizeIconHeaderFooter * 1.5,
                        }}
                    />
                </View>
            </View>

            <View style = { { ...styles.sideContainer, ...styles.rightContainer } }>
                {
                    propsRightButtons && propsRightButtons.map(
                        (options, index) =>
                        {
                            return (
                                <HeaderButton 
                                    key = { index }
                                    icon = { options.icon }
                                    onPress = { 
                                        () => { options.onPress(navigation, setPropsPopUp) } 
                                    }
                                />
                            )
                        }
                    )
                }
            </View>

        </View>
    );
};

Header.propTypes =
{
    navigation: PropTypes.object.isRequired,
    propsLeftButtons: PropTypes.arrayOf(
        PropTypes.shape(
            {
                icon: PropTypes.func.isRequired,
                onPress: PropTypes.func.isRequired
            }
        )
    ),
    propsRightButtons: PropTypes.arrayOf(
        PropTypes.shape(
            {
                icon: PropTypes.func.isRequired,
                onPress: PropTypes.func.isRequired
            }
        )
    ),
    setPropsPopUp: PropTypes.func
};

const styles = StyleSheet.create(
    {
        container: 
        {
            flexDirection: "row",
            alignItems: "center",
            height: globalProps.heightHeader,
            borderBottomWidth: 1,
            paddingHorizontal: 10,
            // borderRadius: 10,
            // marginLeft: 10,
            // marginRight: 10,
        },
        sideContainer: 
        {
            width: 1,
            flexGrow: 1,
            flexDirection: "row"
        },
        leftContainer:
        {
            justifyContent: "flex-start",
        },
        rightContainer:
        {
            justifyContent: "flex-end",
        }
    }
);

export default Header;