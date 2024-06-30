import { View, ScrollView, StyleSheet, Keyboard, ActivityIndicator } from "react-native";
import PropTypes from 'prop-types';
import { useContext, useState, useEffect } from "react";

import propsHeaderButtons from '../components/props_header_buttons.js';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes } from '../styles_global.js';
import Header from "./Header.js";
import NavBar from "./NavBar.js";
import PopUpStandard, { PopUpOk } from "./PopUpStandard";
import BackgroundGradient from "../contexts/Background.js";
import LoadingArea from "./LoadingArea.js";
import { useNetInfo } from "@react-native-community/netinfo";

/*
* This is the parent component of every page, meaning that it should wrap every page of the application.
* Expected Behaviour: if the supplied children elements do not fill the entire vertical space between the header and 
  footer, the container is expected to take 100% of this space. This is ideal because one may want to center the content
  vertically, such as on a log-in screen, where the input fields are typically centered.
* Note: padding is applied both vertically and horizontally by default, but this can be overridden by the style prop.

* Props:
    > children: any children components.
    > navigation: the navigation object.
    > style: an optional styling object for the container of the content.
    > showHeader: when true, this indicates that the header is displayed.
    > showNavBar: when true, this indicates that the 'footer' (i.e. navbar) is displayed.
    > propsLeftHeaderButtons: this prop is passed as the propsLeftButtons of the page's Header component.
    > propsRightHeaderButtons: this prop is passed as the propsRightButtons of the page's Header component.
    > propsPopUpMsg: an object which defines the content of the pop-up message. If undefined/falsy (which it is by 
      default), a pop-up message isn't displayed
    > isLoading: whether the page is loading.
*/
function PageContainer({ children, navigation, style, showHeader, showNavBar, propsLeftHeaderButtons, 
                         propsRightHeaderButtons, propsPopUpMsg, isLoading, isLoadingScreenTransparent, isScrollable, 
                         showGradientBackground })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    // The object that defines the pop-up message. If undefined/falsy, a pop-up message isn't displayed.
    const [ propsPopUp, setPropsPopUp ] = useState(undefined);

    const [ stIsLoading, setIsLoading ] = useState(false);

    // Whether the (onscreen) keyboard is displayed.
    const [ isKeyboardActive, setIsKeyboardActive ] = useState(false);

    /*
    * Setup the event listeners that are responsible for setting isKeyboardActive.
    */
    useEffect(
        () => 
        {
            const showSubscription = Keyboard.addListener(
                'keyboardDidShow', 
                () => 
                {
                    setIsKeyboardActive(true);
                }
            );

            const hideSubscription = Keyboard.addListener(
                'keyboardDidHide', 
                () => 
                {
                    setIsKeyboardActive(false);
                }
            );

            return () => 
            {
                showSubscription.remove();
                hideSubscription.remove();
            };
        }, 
        []
    );

    /*
    * Set the component's propsPopUp state variable using the prop propsPopUpMsg. 
    */
    useEffect(
        () =>
        {
            if (!propsPopUpMsg)
                setPropsPopUp(undefined);
            else
            {
                /*
                * If a pop-up is to be displayed, it's only logical that the screen should stop loading.
                * A common scenario is that an API call occurs, which results in the stIsLoading flag being set (via 
                  the isLoading prop). If an error occurs with said API call, the programmer may want to display a 
                  pop-up message (by setting the propsPopUpMsg prop). In this case, it's likely that the programmer 
                  would want the loading 'screen' (overlay) to go away.
                */
                setIsLoading(false);

                setPropsPopUp(propsPopUpMsg);
            }
        },
        [ propsPopUpMsg ]
    );

    /*
    * Set the component's stIsLoading state variable using the prop isLoading.
    */
    useEffect(
        () =>
        {
            setIsLoading(isLoading)
        },
        [ isLoading ]
    );
    
    return (
        <View style = {{ flex: 1, backgroundColor: theme.content }}>
            
            {
                (propsPopUp) && <PopUpStandard { ...propsPopUp } removePopUp = { () => setPropsPopUp(undefined) } />
            } 

            {/*gradient background*/}
            {
                showGradientBackground && (
                    <BackgroundGradient/>
                )
            }

            {/* Header */}
            {
                showHeader && (
                    <Header
                        navigation = { navigation } 
                        propsLeftButtons = { propsLeftHeaderButtons }
                        propsRightButtons = { propsRightHeaderButtons }
                        setPropsPopUp = { setPropsPopUp }
                        
                    />
                )
            }

            {/* Content */}
            {
                isScrollable ? (

                    <ScrollView 
                        vertical = { true }
                        showsVerticalScrollIndicator = { false }
                        keyboardShouldPersistTaps = "handled" // Keyboard remains on screen when a button is pressed.
                        contentContainerStyle = {{ 
                            ...styles.container, ...style, backgroundColor: 'transparent', flexGrow: 1
                        }}
                        nestedScrollEnabled
                    >
                        { (!isLoading || isLoadingScreenTransparent) && children }
                    </ScrollView>

                ) : (

                    <View 
                        //keyboardShouldPersistTaps = "handled" // Keyboard remains on screen when a button is pressed.
                        style = {{ 
                            ...styles.container, backgroundColor: 'transparent', flex: 1, flexGrow: 1, ...style,
                        }}
                    >
                        { (!isLoading || isLoadingScreenTransparent) && children }
                    </View>

                )
            }


            {/* TODO: make a LoadingArea component. Should take only one prop: isTransparent */}
            {
                stIsLoading && (
                    <LoadingArea 
                        isLoading = { isLoadingScreenTransparent }
                    />
                ) 
            }

            {/* Navigation Bar */}
            {
                (showNavBar && !isKeyboardActive) && (
                    <NavBar navigation = { navigation } />
                )
            }

        </View> 
    );
}

PageContainer.propTypes =
{
    children: PropTypes.node,
    style: PropTypes.object,
    showHeader: PropTypes.bool,
    showNavBar: PropTypes.bool,
    propsLeftHeaderButtons: PropTypes.arrayOf(
        PropTypes.shape(
            {
                icon: PropTypes.func.isRequired,
                onPress: PropTypes.func
            }
        )
    ),
    propsRightHeaderButtons: PropTypes.arrayOf(
        PropTypes.shape(
            {
                icon: PropTypes.func.isRequired,
                onPress: PropTypes.func
            }
        )
    ),
    propsPopUpMsg: PropTypes.object,
    isLoading: PropTypes.bool,
    isLoadingScreenTransparent: PropTypes.bool,
    isScrollable: PropTypes.bool
};

PageContainer.defaultProps =
{
    style: {},
    showHeader: true,
    showNavBar: true,
    propsLeftHeaderButtons: [ ],
    propsRightHeaderButtons: [ ],
    isLoading: false,
    isLoadingScreenTransparent: true,
    isScrollable: true,
    showGradientBackground: true
}

const styles = StyleSheet.create(
    {
        container: 
        {
            paddingVertical: globalProps.spacingVertBase,
            paddingHorizontal: 15
        },
        loadingScreen:
        {
            position: "absolute", width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: 1
        }
    }
);

export default PageContainer;