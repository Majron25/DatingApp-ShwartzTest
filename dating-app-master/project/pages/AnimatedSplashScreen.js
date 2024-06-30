import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import utils from '../utils/utils';

import { useAuth } from '../AuthContext';

/*
* The app's splash screen. This is displayed while data is loaded.
*/
function AnimatedSplashScreen({ onFinish })
{
    const { logInAuto } = useAuth();

    useEffect(
        () => 
        {
            const loadData = async () =>
            {
                const lFlags = await logInAuto();

                /*
                * logInAuto will return almost immediately if the server isn't called in lWasServerCalled; therefore, 
                  add a small delay.
                */
                if (!lFlags.calledDatabase)
                    await utils.sleepFor(1000);

                console.log("Finished loading data.")
                onFinish(lFlags.loggedIn ? 1 : -1);
            }

            loadData();
        },
        []
    );

    return (
        <View style={styles.container}>
            <LottieView
                source={require('../assets/MainAnimation.json')} //Change the path in case the animation name is changed!!
                autoPlay
                loop={true}
            />
        </View>
    );
};

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    }
);

export default AnimatedSplashScreen;
