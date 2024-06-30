import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, ScrollView, Image, StyleSheet, Platform, Animated } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';

import propsHeaderButtons from '../../components/props_header_buttons.js';
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../../styles_global.js';
import TextStandard from "../../components/TextStandard.js";
import TextInputStandard from '../../components/TextInputStandard.js';
import ButtonStandard from "../../components/ButtonStandard.js";
import PageContainer from "../../components/PageContainer.js";
import ThemeContext from '../../contexts/ThemeContext.js';
import ApiRequestor from '../../ApiRequestor.js';
import { useAuth } from '../../AuthContext';
import defaults from '../../defaults.js';
import { ImageTools } from 'expo-image-manipulator';
import utils from '../../utils/utils.js';
import { heightRange } from '../../shared_data.js';

import * as Location from 'expo-location'; 
import HeaderButton from '../../components/HeaderButton.js';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundCircle from '../../components/BackgroundCircleComponent.js';

// The maximum number of characters that may be entered.
const maxNumImages = 6;

/*
* The account-creation page in which the user uploads one or more images.

* Props:
    > navigation: The navigation object.
*/
function CreateAccountImages({ navigation, route })
{
    const { logIn } = useAuth();
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const [ hasPermission, setHasPermission ] = useState(null);

    const [ images, setImages ] = useState(Array(maxNumImages).fill(""));

    const [ isLoading, setIsLoading ] = useState(false);

    const [animationsComplete, setAnimationsComplete] = useState(true); 
    const [contentOpacity] = useState(new Animated.Value(0));   
    const [circleScaleAnimation1] = useState(new Animated.Value(1));
    const [circleScaleAnimation2] = useState(new Animated.Value(1));
    const [circleScaleAnimation3] = useState(new Animated.Value(1));

    const startAnimation = () => {
        setAnimationsComplete(false) 
        Animated.parallel([ 
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false
            }),   
        ]).start(() => {
            //animations are finished
            setAnimationsComplete(true)
        });
    }

    useEffect(
        () => 
        {
            startAnimation();
            const asyncFunction = async () =>
            {
                if (Platform.OS == 'web')
                    return;

                const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

                setHasPermission(status == 'granted');

                if (status != 'granted')
                {
                    await requestPermission();
                }
            }

            asyncFunction();
        },
        []
    );

    // Prevent the user from going back when the page is loading (i.e. when the user's info is being sent).
    useEffect(
        () =>
        {
            const handleRemoveAction = (e) => 
            {
                if (e.data.action.type == "GO_BACK")
                {
                    e.preventDefault(); 
                    console.log("You shall not pass."); 
                    return;
                }

                navigation.dispatch(e.data.action);
            };

            const removeListener = navigation.addListener('beforeRemove', handleRemoveAction);

            return removeListener;
        },
        [ navigation ]
    );

    const requestPermission = async () =>
    {
        if (hasPermission)
            return;

        if (Platform.OS == 'web')
            return;

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        console.log(status);

        setHasPermission(status == 'granted');

        if (status != 'granted')
        {
            setPropsPopUpMsg(
                {
                    title: "Media Access is Required",
                    message: "This app requires file/media access permission. To continue, go to your device's settings and grant permissions for this app.",
                    buttons: [
                        { text: "OK" }
                    ],
                }
            );
        }

        return status == 'granted';
    }

    const removeImage = (indexImage) =>
    {
        setImages(
            (prev) => 
            {
                return prev.map(
                    (image, index) =>  
                    {
                        if (index != indexImage)
                            return image;

                        return "";
                    }
                )
            }
        );
    };

    /**
    * Returns a smaller version of the given image. This returned image is designed to be displayed on the search page.

    * Parameters:
        @param {string} firstImage Base64 uri of the first image.
    */
    const reduceFirstImage = async (firstImage) =>
    {
        if (firstImage.length < 500000)
        {
            console.log("Image is already sufficiently small, it will not be compressed further.");
            return firstImage;
        }

        try 
        {
            console.log('Original First Image Size (Bytes):', firstImage.length);

            // Get image width.
            let imgWidth = 540; 
            Image.getSize(firstImage, (width, height) => { imgWidth = width; }, () => { console.log("Couldn't get image size.") });
            console.log('Original First Image Width (Pixels): ', imgWidth);

            // Compress the image.
            let compressedImage = await ImageManipulator.manipulateAsync(
                firstImage,

                // Resize options
                [{ resize: { width: (imgWidth < 540) ? imgWidth : 540 } }],

                // Compression options
                { compress: 1, format: SaveFormat.JPEG, base64: true }
            );

            console.log('Compressed First Image Size (Bytes):', compressedImage.base64.length);

            const compressedBase64 = `data:image/png;base64,${compressedImage.base64}`;

            return compressedBase64;
        } 
        catch (error) 
        {
            console.error('Error while compressing first image: ', error);
        }

        return "";
    };

    const handlePickImage = async (indexImage) => {
        // ... Previous code for permissions and image picking ...
        if (!hasPermission)
        {
            // Ask for permission again (this doesn't work on Android, as an app can only request permissions once).
            const requestAccepted = await requestPermission();

            if (!requestAccepted)
            {
                return;
            }
        }

        try 
        {
            // Get the selected image as a base64 string
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                base64: true,
                aspect: [2, 3],
                quality: 1, // Set initial quality
            });

            if (!result.assets || result.assets.length === 0) {
                return;
            }

            // Get the base64 image
            const base64Image = result.assets[0].base64;

            // Log the size of the original image
            console.log('Original Image Size (Bytes):', base64Image.length);

            // Compress the image using "expo-image-manipulator"
            const compressedImage = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,//`data:image/jpeg;base64,${base64Image}`, // You can specify the correct format

                // Resize options
                [{ resize: { width: (result.assets[0].width < 800) ? result.assets[0].width : 800 } }],

                // Compression options
                { compress: (base64Image.length > 1000000) ? 0.5 : 1, format: SaveFormat.PNG, base64: true }
            );

            // Log the size of the compressed image
            console.log('Compressed Image Size (Bytes):', compressedImage.base64.length);

            // Update the state with the compressed image's URI
            const compressedBase64 = `data:image/png;base64,${compressedImage.base64}`;

            setImages((prev) =>
                prev.map((image, index) => (index !== indexImage ? image : compressedBase64))
            );
        } 
        catch (error) 
        {
            console.error('Error while compressing image:', error);
        }
    };
    const backAnimation = () => {
        navigation.goBack();
    }
    const loginAnimation = () => {
        console.log('login animation called!')
        
        setAnimationsComplete(false)
        Animated.stagger(100, [ 
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }),  
            Animated.timing(circleScaleAnimation1, {
                toValue: 0,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: false,
            }), 
            Animated.timing(circleScaleAnimation2, {
                toValue: 0,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: false,
            }), 
            Animated.timing(circleScaleAnimation3, {
                toValue: 0,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: false,
            }), 
        ]).start(() => {  
            
            setAnimationsComplete(true)
            // navigation.dispatch(StackActions.popToTop());
        })
    }
    const handleContinue = async () =>
    {
        setIsLoading(true);

        // Shift the images (i.e. the non-empty slots of the array) to the start of the array.
        let lImages = images.filter((letter) => { return letter != ""; });
        lImages = lImages.concat(Array(maxNumImages - lImages.length).fill(""));

        let firstImage = await reduceFirstImage(lImages[0]);

        if (firstImage == "")
        {
            console.log("There was a problem reducing the first image.");
            firstImage = lImages[0];
        }
        else
        {
            console.log("First image successfully reduced.");
        }

        const prefsDefault = generateDefaultPrefs(route.params.dob, route.params.gender, route.params.height);

        // Create the object that will be sent to the db.
        let user = { 
            images: lImages, 
            firstImage: firstImage,
            ...route.params, 
            preferences: { 
                ...defaults.prefs, sexualPreference: route.params.sexPref, ...prefsDefault
            }
        };

        // Delete unnecessary parameters.
        delete user.sexPref; delete user.verificationNumber;

        let { status: statusPermission } = await Location.getForegroundPermissionsAsync();
        console.log(statusPermission)
        if (statusPermission != 'granted')
        {
            const { status: statusRequest } = await Location.requestForegroundPermissionsAsync();

            if (statusRequest != 'granted')
            {
                setPropsPopUpMsg(
                    {
                        title: "Location Data Required",
                        message: "This app requires location data. To continue, go to your device's settings and grant permissions for this app.",
                        buttons: [
                            { text: "OK" }
                        ],
                    }
                );
                setIsLoading(false);
                return;
            }
        }

        console.log("checking location");

        // Get the device's current location.
        const location = await utils.getDeviceLocation();

        if (location)
        {
            // Save the device's location to the user's object.
            user.location = location;
            console.log("Location: ");
            console.log(user.location);

            try
            {
                // Create the user.
                const fetchResponseCreate = await ApiRequestor.createNewUser(user);

                if (fetchResponseCreate.insertedId)
                {
                    const lResponseStatus = await logIn(user.email, user.password);

                    if (lResponseStatus == 200)
                    {
                        navigation.navigate("createAccountQuizIntro");
                        return;
                    }
                }
            }
            catch (e)
            {
                // TODO: have a pop-up that explains that something went wrong when creating the account.
                console.log("failed creating an account")
                setIsLoading(false)
            }
        }

        setPropsPopUpMsg(
            {
                title: "A Problem Occurred",
                message: "We had trouble creating your account. Please try again later.",
                buttons: [
                    { text: "OK" }
                ]
            }
        );
        setIsLoading(false);
    };

    return (
        <PageContainer 
            navigation = { navigation } 
            style = {{ justifyContent: "space-between" }}
            showNavBar = { false }
            showHeader = { false }
            propsPopUpMsg = { propsPopUpMsg }
            isLoading = { isLoading }
        > 
        
        <BackgroundCircle 
            transformAnimation1={circleScaleAnimation1}
            transformAnimation2={circleScaleAnimation2}
            transformAnimation3={circleScaleAnimation3} 
        />
            <Animated.View style = {{alignItems: 'center', opacity: contentOpacity }}>
                <TextStandard 
                    text = "Images" 
                    size = { 3 }
                    isBold
                    style = {{ 
                        textAlign: "center", //marginBottom: globalProps.spacingVertBase 
                    }}
                />
                <TextStandard 
                    text = "Upload at least one image of yourself" 
                    size = { 0 }
                    style = {{ 
                        textAlign: "center", marginTop: utilsGlobalStyles.spacingVertN(-1)
                    }}
                />
            </Animated.View>

            <Animated.View style = { {...styles.conImages, opacity: contentOpacity } }>
                {
                    images.map(
                        (image, index) =>
                        {
                            return (
                                <View key = { index }>
                                    <ButtonStandard 
                                        icon = {
                                            image == "" ? 
                                                <Ionicons 
                                                    name = "add-circle-outline" size = { 50 } color = { theme.borders } 
                                                />
                                            :
                                                <Image 
                                                    source = {{ uri: image }}
                                                    style = {{ ...styles.imgUser, borderColor: theme.borders }}
                                                />
                                        }
                                        onPress = { () => handlePickImage(index) } 
                                        style = {{ 
                                            ...styles.btnAddImage, backgroundColor: theme.header, overflow: "hidden"
                                        }}
                                    />

                                    {
                                        image != "" && (
                                            <ButtonStandard
                                                text = "—"
                                                sizeText = { 1 }
                                                isBold
                                                style = {{ ...styles.btnRemoveImage, backgroundColor: theme.header }}
                                                styleText = {{ color: theme.borders }}
                                                onPress = { () => removeImage(index) }
                                            />
                                        )
                                    }
                                </View>
                            );
                        }
                    )
                }
            </Animated.View>

            <Animated.View style = { {...styles.conBottom, opacity: contentOpacity} }> 
                <LinearGradient 
                    colors={
                        images.filter((image) => image != "").length == 0  ? 
                        //inactive colours
                        [theme.buttonStandardInactive, theme.buttonStandardInactive] 
                        //active colours
                        : [theme.buttonMoreVibrant, theme.buttonStandard, theme.buttonLessVibrant ]
                    }
                    style={{
                        ...styles.linearGradientButton, 
                        //marginTop: globalProps.spacingVertBase
                    }}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }} 
                >  
                    <ButtonStandard 
                        text={"CONTINUE"} 
                        sizeText = { 1 }
                        isBold
                        style={{ ...styles.button, backgroundColor: 'transparent'}}
                        onPress = { handleContinue }  
                        inactive = { images.filter((image) => image != "").length == 0 }
                    />  
                </LinearGradient> 
            </Animated.View>

        </PageContainer>
    );
}

const styles = StyleSheet.create(
    {
        conBottom:
        {
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: utilsGlobalStyles.spacingVertN(1)
        },
        txtDescription: 
        {
            marginTop: utilsGlobalStyles.spacingVertN(1)
        },
        btnContinue:
        {
            width: "100%",
            padding: 10,
            borderRadius: globalProps.borderRadiusStandard
        },
        imgUser:
        {
            height: 150,
            width: 100,
        },
        btnAddImage:
        {
            height: 150,
            width: 100,
            borderRadius: globalProps.borderRadiusStandard,
            borderWidth: 2
        },
        btnRemoveImage:
        {
            height: 36,
            width: 36,
            position: 'absolute',
            // bottom: 0,
            alignSelf: "flex-end",
            borderRadius: globalProps.borderRadiusStandard,
            borderWidth: 2
        },
        conImages:
        {
            marginTop: utilsGlobalStyles.spacingVertN(),
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: utilsGlobalStyles.spacingVertN(),
            rowGap: utilsGlobalStyles.spacingVertN(),
            alignSelf: "center",
            justifyContent: "center",
        }, 
        linearGradientButton:
        {
            width: "80%", 
            alignContent: "center",
            borderRadius: 100,  
        },
        button:
        {
            width: "100%",
            padding: 10,
            alignContent: "center",
            borderRadius: 100,  
            backgroundColor: 'transparent'
        },
    }
);

function generateDefaultPrefs(userDOB, userGender, userHeight)
{
    const prefsDefault = { };

    // The user's age.
    const userAge = utils.getAgeFromDate(userDOB);
    console.log(`Age: ${userAge} from DOB: ${userDOB}`);

    // Calculate default age preference (Distinguish between male and female preference).
    if (userGender == "M")
        prefsDefault.ageRange = { low: Math.max(18, userAge - 5), high: userAge + 2 };
    else
        prefsDefault.ageRange = { low: Math.max(18, userAge - 2), high: userAge + 5 };

    // Calculate default height preference (Distinguish between male and female preference).
    if (userGender == "M")
        prefsDefault.height = { low: Math.max(heightRange.min, userHeight - 30), high: userHeight };
    else
        prefsDefault.height = { low: userHeight, high: Math.min(heightRange.max, userHeight + 30) };

    console.log(prefsDefault);

    return prefsDefault;
}

export default CreateAccountImages;