import { View, StyleSheet } from "react-native";
import PropTypes from 'prop-types';
import { useContext, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import ThemeContext from "../contexts/ThemeContext.js";
import globalProps,  { globalThemes } from '../styles_global';
import ButtonStandard from './ButtonStandard';

import { useAuth } from '../AuthContext';
import TextStandard from "./TextStandard.js";

/*
* The custom header component that's used throughout the app.

* Props:
    > navigation: the object that allows for navigation to pages in the app.
*/
const NavBar = ({ navigation }) => 
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const { userId, validatedUser, setValidatedUser } = useAuth();
    // The app's page history.
    const pageHistory = navigation.getState().routes;

    // The name of the page corresponding to one of the navbar's buttons.
    // This is used to determine which of the navbar's buttons is 'active'.
    let currentPage = "";

    // Set currentPage.
    for (const page of pageHistory.slice().reverse())
    {
        if (Object.keys(buttonsNavBar).includes(page.name))
        {
            currentPage = page.name;
            break;
        }
    }

    const [showNotification, setShowNotification] = useState(true);
 
        const toggleNotification = () => {
        setShowNotification(!showNotification);
    };
  
    return (
        <View 
            style = {{ 
                ...styles.container, backgroundColor: theme.navBar, borderColor: theme.borders 
            }}
        >

            {/* Render each of the navbar buttons. */}
            {
                pagesNavBar.map(
                    (namePage, index) =>
                    {
                        const Button = buttonsNavBar[namePage];
                        const isActive = namePage === currentPage;

                        return (
                            <View 
                                key = { index } 
                                style = {{ 
                                    ...styles.innerContainer, borderTopColor: theme.borders, 
                                }}
                            >
                                <Button navigation = { navigation } isActive = { isActive } />
                                { 
                                    // validatedUser !== undefined && 
                                    // validatedUser?.notifications?.filter(notification => notification.type === "matched_with_user").length > 0 && namePage === 'messages' && (
                                    //     <View
                                    //         style={styles.notificationBall}
                                    //     >
                                    //         <TextStandard 
                                    //             style={styles.notificationNumber}
                                    //             text={validatedUser?.notifications
                                    //                 ? validatedUser.notifications.filter(notification => notification.type === "matched_with_user").length.toString()
                                    //                 : '0'
                                    //             }
                                    //         />
                                    //     </View>
                                    // )
                                    namePage === 'messages' && (
                                        <View
                                            style={styles.notificationBall}
                                        >
                                        </View>
                                    )
                                }
                            </View>
                        )
                    }
                )
            }
        


        </View>
    );
};

NavBar.propTypes =
{
    navigation: PropTypes.object.isRequired,
};

NavBar.defaultProps =
{
}

const styles = StyleSheet.create(
    {
        container: 
        {
            flexDirection: "row",
            alignItems: "stretch",
            height: globalProps.heightFooter,
            borderWidth: 0,
            borderRadius: 10,
            marginLeft: 10,
            marginRight: 10,
            marginBottom: 10,
        },
        innerContainer: 
        {
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
            alignItems: "stretch",
        },
        notificationBall: 
        {
            position: "absolute",
            top: 8,
            right: 30,
            backgroundColor: "red",  
            width: 18,
            height: 18,
            borderRadius: 100,
            borderColor: "white",
            borderWidth: 3,
            alignItems: "center",
            justifyContent: "center",
        },
        notificationNumber: {
            color: "white", 
            fontSize: 8,
            width: 20,
            height: 20,
            lineHeight: 18,
            textAlign: 'center',
        }
    }
);

// The pages that have a button in the navbar linking to them (refer to components in buttonsNavBar).
// This is used instead of Object.keys(buttonsNavBar) so that the order is guaranteed.
const pagesNavBar = 
[
    "search", "matches", "messages", "account"
];

/*
* The buttons that are available to appear in the navbar.
*/
const buttonsNavBar = 
{
    /*
    * Goes to the 'search' page.

    * Props:
        > navigation: the app's navigation object.
        > isActive: whether this button of the navbar corresponds to the current page.
    */
    search: ({ navigation, isActive }) =>
    {
        const { themeName } = useContext(ThemeContext);
        let theme = globalThemes[themeName];

        const borderTopWidth = isActive ? 4 : 0;
        const paddingVertical = isActive ? (globalProps.heightFooter - globalProps.sizeIconHeaderFooter - 4) / 2 :
                                            (globalProps.heightFooter - globalProps.sizeIconHeaderFooter) / 2;

        return (
            <ButtonStandard 
                icon = { 
                    <Ionicons 
                        name = { isActive ? "home" : "home-outline" }
                        //name = { isActive ? "grid" : "grid-outline" }
                        color = { isActive ? theme.iconNavBarActive : theme.iconNavBarInactive } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    />
                }
                onPress =  { () => navigation.navigate("search") } 
                style = {{ backgroundColor: 'transparent', paddingVertical: paddingVertical }}
            />
        );
    },

    /*
    * Goes to the 'matches' page.

    * Props:
        > navigation: the app's navigation object.
        > isActive: whether this button of the navbar corresponds to the current page.
    */
    matches: ({ navigation, isActive }) =>
    {
        const { themeName } = useContext(ThemeContext);
        let theme = globalThemes[themeName];

        const borderTopWidth = isActive ? 4 : 0;
        const paddingVertical = isActive ? (globalProps.heightFooter - globalProps.sizeIconHeaderFooter - 4) / 2 :
                                           (globalProps.heightFooter - globalProps.sizeIconHeaderFooter) / 2;

        return (
            <ButtonStandard 
                icon = { 
                    <MaterialCommunityIcons 
                        name = { isActive ? "heart-multiple" : "heart-multiple-outline" } 
                        color = { isActive ? theme.iconNavBarActive : theme.iconNavBarInactive } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    />
                }
                onPress =  { () => navigation.navigate("matches") } 
                style = {{ backgroundColor: 'transparent', paddingVertical: paddingVertical }}
            />
        );
    },

    /*
    * Goes to the 'messages' page.

    * Props:
        > navigation: the app's navigation object.
        > isActive: whether this button of the navbar corresponds to the current page.
    */
    messages: ({ navigation, isActive }) =>
    {
        const { themeName } = useContext(ThemeContext);
        let theme = globalThemes[themeName];

        const borderTopWidth = isActive ? 4 : 0;
        const paddingVertical = isActive ? (globalProps.heightFooter - globalProps.sizeIconHeaderFooter - 4) / 2 :
                                           (globalProps.heightFooter - globalProps.sizeIconHeaderFooter) / 2;

        return (
            <ButtonStandard 
                icon = { 
                    // <Ionicons 
                    //     name = { isActive ? "chatbox"  : "chatbox-outline" } 
                    //     color = { isActive ? theme.iconNavBarActive : theme.iconNavBarInactive } 
                    //     size = { globalProps.sizeIconHeaderFooter } 
                    // />
                    <MaterialCommunityIcons 
                        name ={ isActive ? "message" : "message-outline" } 
                        color = { isActive ? theme.iconNavBarActive : theme.iconNavBarInactive } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    />
                }
                onPress =  { () => navigation.navigate("messages") } 
                style = {{ backgroundColor: 'transparent', paddingVertical: paddingVertical }}
            />
        );
    },

    /*
    * Goes to the 'account' page.

    * Props:
        > navigation: the app's navigation object.
        > isActive: whether this button of the navbar corresponds to the current page.
    */
    account: ({ navigation, isActive }) =>
    {
        const { themeName } = useContext(ThemeContext);
        let theme = globalThemes[themeName];

        const borderTopWidth = isActive ? 4 : 0;
        const paddingVertical = isActive ? (globalProps.heightFooter - globalProps.sizeIconHeaderFooter - 4) / 2 :
                                           (globalProps.heightFooter - globalProps.sizeIconHeaderFooter) / 2;

        return (
            <ButtonStandard 
                icon = { 
                    <MaterialCommunityIcons 
                        name ={ isActive ? "account-circle" : "account-circle-outline" } 
                        color = { isActive ? theme.iconNavBarActive : theme.iconNavBarInactive } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    />
                }
                onPress =  { () => navigation.navigate("account") } 
                style = {{ backgroundColor: 'transparent', paddingVertical: paddingVertical }}
            />
        );
    }
}

export default NavBar;