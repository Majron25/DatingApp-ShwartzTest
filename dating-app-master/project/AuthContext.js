import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import ApiRequestor from './ApiRequestor.js';
import utils from './utils/utils.js';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AuthContext = createContext();


export function AuthProvider({ children }) 
{
    const [ authToken, setAuthToken ] = useState("");
    const [ userData, setUserData ] = useState(undefined);

    // Whether the matches should be reloaded when the user next returns to the Search page.
    const [ reloadMatches, setReloadMatches ] = useState(true);

    /*
    * Log-out the user.
    */
    const logOut = async () =>
    {
        if (authToken && userData)
        {
            // Small delay in case any previous screens take too long to be unmounted.
            await utils.sleepFor(500);

            setAuthToken(undefined);
            setUserData(undefined);
            AsyncStorage.removeItem("authToken");
        }
    };

    /**
    * Log-in the user.

    * Parameters:
        @param {object} email - The email entered by the user.
        @param {object} password - The password entered by the user.

    * @returns {string} The status code of the log-in API request.
    */
    const logIn = async (email, password) =>
    {
        const trimmedEmail = email.trim().toLowerCase();
        const response = await ApiRequestor.findUser(trimmedEmail, password);
        //console.log(response)
        console.log("Token " + response.token);

        if (response.status == 200)
        {
            console.log("Setting token.")
            setAuthToken(response.token);
            setUserData(response.user);
            await utils.sleepFor(100);
        }

        return response.status;
    };

    /**
    * Function which performs the auto-login functionality, which requires a valid auth token to be stored in
      AsyncStorage.

    * @returns {boolean} Whether a token was found in AsyncStorage. This also indicates whether the server was called.
      This doesn't guarantee that the user was logged-in.
    */
    const logInAuto = async () =>
    {
        const lAuthToken = await utils.GetFromAsyncStorage("authToken");

        console.log("Auth token: " + lAuthToken)

        if (!lAuthToken)
        {
            console.log("Couldn't find auth token, can't automatically log user in.")
            return { calledDatabase: false, loggedIn: false };
        }

        ApiRequestor.sAuthToken = lAuthToken;

        // Request the user's data.
        const lResponse = await ApiRequestor.getUserData();

        let lLoggedIn = false;

        // Assign user's data if the request was successful.
        if (lResponse && lResponse.status == 200)
        {
            console.log("Successfully auto logged-in user.");
            setUserData(lResponse.data.user);
            setAuthToken(lAuthToken);
            lLoggedIn = true;
        }
        else
        {
            console.log("Failed to auto log-in user.");
            setAuthToken("");
        }

        // Wait just in case the setState functions take too long to finish updating the states.
        await utils.sleepFor(100);

        return { calledDatabase: true, loggedIn: lLoggedIn };
    };

    const isQuizComplete = () =>
    {
        return userData && userData.pvqAnswers && ("results" in userData.pvqAnswers && userData.pvqAnswers.results);
    };

    // Store the authToken within the ApiRequestor.
    useEffect(
        () => 
        {
            if (!authToken)
                return;

            ApiRequestor.sAuthToken = authToken;
            utils.SetInAsyncStorage("authToken", authToken);
            console.log("Updated ApiRequestor's web token.")
        },
        [ authToken ]
    );

    return (
        <AuthContext.Provider 
            value = {{ 
                authToken, userData, setUserData, reloadMatches, setReloadMatches, logOut, logIn, logInAuto, 
                isQuizComplete
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() 
{
    return useContext(AuthContext);
}