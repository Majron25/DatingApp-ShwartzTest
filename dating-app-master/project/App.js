import { useState, useEffect, useRef } from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";

import utils from "./utils/utils";
import ThemeContext from "./contexts/ThemeContext";
import globalProps, { utilsGlobalStyles, globalThemes } from "./styles_global";
import pages, { pagesNoAnimations } from "./pages/pages";
import { AuthProvider } from './AuthContext';
import CacheProvider from "./contexts/CacheContext";
import AnimatedSplashScreen from "./pages/AnimatedSplashScreen";


// The overarching stack navigator.
const Stack = createStackNavigator();

/*
* The app's top-level/entry-point component.
*/
function App() 
{
    const [autoLoggedIn, setAutoLoggedin] = useState(0); // Initially show the splash screen

    // The global theme.
    const [themeName, setThemeName] = useState(globalProps.themeDefault);
    let theme = globalThemes[themeName];

    /*
    * Updates the themeName.

    * Parameters:
        > newThemeName: the name of the theme that will be set.s
    */
    const updateTheme = (newThemeName) => 
    {
        if (!newThemeName) 
        {
            console.log("No theme name provided!");
            return;
        }

        setThemeName(newThemeName);

        /*
        * Set the background colour of the root view. The root view is generally not visible, but can appear when 
          opening the keyboard. It's white by default, which might be jarring if the theme is black.
        */
        SystemUI.setBackgroundColorAsync(globalThemes[newThemeName].decorative1);

        // Locally store the new theme's name.
        utils.SetInAsyncStorage("themeName", newThemeName);
    };

    /*
    * Set the theme to the one stored locally on the user's device; if there isn't a stored theme, the default is used.
    * This function is called only once at start-up to set the app's theme.
    */
    useEffect(
        () => 
        {
            // A function that retrieves stored data from AsyncStorage and sets the relevant state variables.
            const initialLoading = async function () 
            {
                let storedThemeName = await utils.GetFromAsyncStorage("themeName", globalProps.themeDefault);

                if (!(storedThemeName in globalThemes))
                    storedThemeName = globalProps.themeDefault;

                console.log(storedThemeName);

                setThemeName(storedThemeName);

                SystemUI.setBackgroundColorAsync(globalThemes[storedThemeName].decorative1);
            };

            initialLoading();
        }, 
        []
    );

    return (
        <SafeAreaProvider>

            <SafeAreaView style = {{ flex: 1, backgroundColor: theme?.header }}>

                {/* Set colour of the status bar based on the current theme. */}
                <StatusBar
                    style = { utilsGlobalStyles.isThemeDark(themeName) ? "light" : "dark" }
                />

                <AuthProvider>
                <ThemeContext.Provider value = {{ themeName, updateTheme }}>
                <CacheProvider>

                    <NavigationContainer
                        theme = {{ colors: { background: theme?.content } }}
                    >
                        {
                            // Show the splash screen until it's determined whether the user can auto login.
                            (autoLoggedIn == 0) ? (
                                <AnimatedSplashScreen onFinish = { (autoLoggedIn) => { setAutoLoggedin(autoLoggedIn); } } />
                            ) : (
                                <Stack.Navigator
                                    initialRouteName = { autoLoggedIn == 1 ? "search" : "landing" }
                                    screenOptions = {{
                                        headerShown: false,

                                        /*
                                        * When this is set to false the position of ScrollView and FlatList 
                                            components are forgotten when navigating back to a page. e.g. if you're on
                                            page A which is at scroll position 800 and you navigate to page B and then
                                            back to page A, the scroll position will be 0.
                                        * See https://github.com/react-navigation/react-navigation/issues/10611.
                                        */
                                        animationEnabled: false,
                                        animationTypeForReplace: "pop"
                                    }}
                                >
                                    {
                                        Object.keys(pages).map(
                                            (pageName, index) => 
                                            {
                                                const animationEnabled = !(pagesNoAnimations.some((page) => { return page == pageName; } ));
                                                return (
                                                    <Stack.Screen
                                                        name = { pageName }
                                                        component = { pages[pageName] }
                                                        key = { index }
                                                        options = {{ 
                                                            animationEnabled: animationEnabled
                                                        }}
                                                    />
                                                );
                                            }
                                        )
                                    }
                                </Stack.Navigator>
                            )
                        }
                    </NavigationContainer>

                </CacheProvider>
                </ThemeContext.Provider>
                </AuthProvider>

            </SafeAreaView>

        </SafeAreaProvider>
    );
};

const asyncStorageKeyPrefs = "prefs"

export default App;
