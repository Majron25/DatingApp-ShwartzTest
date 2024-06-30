import { View, StyleSheet, FlatList, Modal, useWindowDimensions, TouchableOpacity } from "react-native";

import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import RadioGroup from 'react-native-radio-buttons-group';
import CheckBox from 'react-native-check-box'

import globalProps, { utilsGlobalStyles, globalThemes } from '../styles_global.js';
import ThemeContext from "../contexts/ThemeContext.js";
import TextStandard from "../components/TextStandard.js";
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import MatchContainer from "../components/MatchContainer.js";
import utils from "../utils/utils.js";

import ApiRequestor from '../ApiRequestor.js';
import { useAuth } from '../AuthContext';
import { useCache } from "../contexts/CacheContext.js";
import { LinearGradient } from "expo-linear-gradient";

/*
* The search page. This page displays all of the user's who match the user's preferences.

* Props:
    > navigation: the navigation object.
*/
function Search({ navigation })
{
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    // Used to have the page update when it's returned to. e.g. if the user changes their preferences and comes back.
    const isFocused = useIsFocused();

    const { height : heightWindow, width: widthWindow } = useWindowDimensions();

    const { cacheFirstImages, updateCacheFirstImages } = useCache();

    const { userData, setUserData, reloadMatches, setReloadMatches, isQuizComplete } = useAuth();

    // The matches (from rfMatches.current) that are currently being displayed.
    const [ matches, setMatches ] = useState(undefined);

    // The _id of the match that the user has selected/clicked.
    const [ selectedMatch, setSelectedMatch ] = useState("");

    const [ isLoading, setIsLoading ] = useState(false);

    const [ displaySortOptions, setDisplaySortOptions ] = useState(false);

    // The id that corresponds to the current sort selection.
    const [ sortIdSelected, setSortIdSelected ] = useState("matchScore");

    // The user's current selection for the sorting direction.
    const [ sortDirection, setSortDirection ] = useState(0);

    /* A cache of the users' (first) images. Each key is a user's ID and the corresponding value their first image. */
    //const [ cacheImages, setCacheImages ] = useState({});

    // All of the matches that were returned from the server.
    const rfMatches = useRef(undefined);

    // Whether the server has yet to respond to additional data.
    const rfIsLoadingMore = useRef(false);

    // The value that determines how the data is sorted.
    const rfSortId = useRef("matchScore");

    /* 
    * The value that determines how the data is sorted.
    * One of three values:
        * -1: descending
        *  0: default sorting direction
        *  1: ascending
    */
    const rfSortDirection = useRef(0);

    // A ref to the FlatList.
    const rfFlatList = useRef(null);

    /* 
    * The position of the FlatList when the user leaves the page. This value is used to move the FlatList into the 
      correct position when the user returns to the page (assuming they haven't changed their preferences).
    * Note that rfFlatListScrollPosition.current has to be stored in the state variable flatListScrollPosition when the
      user leaves the page in order to retain the value upon returning. Not too sure why.
    */
    const rfFlatListScrollPosition = useRef(0);
    const [ flatListScrollPosition, setFlatListScrollPosition ] = useState(0);

    // The props which define the radio buttons. Colour Updates automatically when themes change.
    const radioButtonProps = useMemo(
        () => (
            sortData.map(
                (sortDataI) =>
                {
                    return {
                        ...sortDataI, color: theme.borders, 
                        labelStyle: { ...styles.lblRadioButton, color: theme.font }, 
                        containerStyle: { ...styles.conRadioButton, borderColor: theme.borders }
                    }
                }
            )
        ),
        [ themeName ]
    );

    useEffect(
        () => 
        {
            // If the user is leaving the page.
             if (!isFocused)
             {
                // Save the current scroll position to a state variable so that it's preserved.
                setFlatListScrollPosition(rfFlatListScrollPosition.current);
                return;
             }

            if (matches && rfFlatList.current) // If there are matches and the FlatList reference isn't null.
            {
                /*
                * In App.js, the Stack.Navigator has a screenOptions prop. One property of this prop is animationEnabled.
                  When animationEnabled is false (i.e. no animation when moving between screens) the position of scrollable
                  elements (such as the FlatList used on this screen) aren't saved when returning. This requires us to 
                  manually save and load this position when returning to the page.
                * Although, when animationEnabled is true, this presents a problem in that when the user changes their 
                  preferences and returns (which triggers an auto reload below this if statement), the scroll position is 
                  remembered, which is undesired; thus, we must manually scroll to the top.
                */
                if (reloadMatches) // If the matches are to be reloaded.
                {
                    // Scroll to top.
                    rfFlatList.current.scrollToOffset({ offset: 0, animated: false });
                }
                else
                {
                    // Scroll to the previous position.
                    rfFlatList.current.scrollToOffset({ offset: flatListScrollPosition, animated: false });
                    return;
                }
            }

            // for (let i = 0; i < validatedUser.notifications.length; i++)
            // {
            //     if (validatedUser.notifications[i].type == "matched_with_user")
            //     {
            //         if (!validatedUser.notifications[i].viewed)
            //         {
            //             alert(validatedUser.notifications[i].message)
            //             validatedUser.notifications[i].viewed = true;
            //             console.log("Need to update the notification in the database to be true")
            //         }
            //     }
            // }

            if (reloadMatches && isQuizComplete())
            {
                handleReloadMatches(); 
                setReloadMatches(false);
            }
        }, 
        [ isFocused ]
    );

    useEffect(
        () =>
        {
            if (!matches)
                return;

            // Delay unsetting rfIsLoadingMore.current so that more users aren't loaded unnecessarily. This occurs without the
            // delay due to the FlatList taking some time to load in the new users.
            setTimeout(() => { rfIsLoadingMore.current = false }, 1000);

            const loadMoreImages = async () =>
            {
                // The indexes which define the range of users' images that are to be returned.
                const indexStart = Math.max(0, matches.length - usersPerLoad);
                const indexEnd = indexStart + usersPerLoad - 1;

                let userIds = matches.slice(indexStart, indexEnd + 1).map((match) => { return match._id; });

                console.log("Number of ids (pre cache-check): " + userIds.length);

                // Remove the ids of the users that are already in the cache.
                userIds = userIds.filter((id) => { return !(id in cacheFirstImages.images) });

                console.log("Number of ids (post cache-check): " + userIds.length);

                await updateCacheFirstImages(userIds, matches.map((match) => { return match._id }));
            };

            loadMoreImages();
        },
        [ matches ]
    );

    // Prevent the user from going back.
    useEffect(
        () =>
        {
            const handleRemoveAction = (e) => 
            {
                // console.log(e.data.action);

                if (e.data.action.type == "GO_BACK")
                {
                    e.preventDefault(); 
                    console.log("You shall not pass."); 
                    return;
                }

                // navigation.dispatch(e.data.action);
            };

            const removeListener = navigation.addListener('beforeRemove', handleRemoveAction);

            return removeListener;
        },
        [ navigation ]
    );

    // Update the user's location.
    useEffect(
        () =>
        {
            const updateLocation = async () =>
            {
                // Get the device's current location.
                let location = await utils.getDeviceLocation();

                if (!location)
                {
                    console.log("Couldn't update location.");
                    return;
                }

                // Construct update query.
                const queryUpdate = {
                    $set: { "location": location }
                };

                const response = await ApiRequestor.updateUser(userData._id, queryUpdate);

                if (response.status == 200)
                {
                    console.log("Successfully updated user's location.");
                    // Synchronise local user data with that of the server.
                    setUserData((prev) => { return { ...prev, location: location } });
                }
                else
                {
                    console.log("Error updating user's location.");
                }
            };

            updateLocation();
        },
        []
    );

    const getUsersFromDatabase = async () =>
    {
        return await ApiRequestor.getUsersForSearchPage(userData._id);
    };

    const sortMatches = () =>
    {
        // Whether to sort in ascending or descending order (use default if sortAscend == 0).
        const ascend = (rfSortDirection.current == 0) ? defaultSortDirection[rfSortId.current] : rfSortDirection.current == 1;

        console.log(rfSortId.current);

        // The function that's used to sort the matches.
        const sortFunction = (a, b) => 
        {
            if (a[rfSortId.current] == b[rfSortId.current]) 
                return 0;
            else if (a[rfSortId.current] > b[rfSortId.current]) 
                return ascend ? 1 : -1;
            else (a[rfSortId.current] < b[rfSortId.current]) 
                return ascend ? -1 : 1;
        };

        rfMatches.current = rfMatches.current.sort(sortFunction);

        setMatches(rfMatches.current.slice(0, usersPerLoad));
    };

    const handleReloadMatches = async () =>
    {
        setIsLoading(true);

        const lMatches = await getUsersFromDatabase();

        if (lMatches.status == 200) 
        {
            console.log(lMatches.data.length);

            rfMatches.current = lMatches.data;
            sortMatches();
        }

        rfIsLoadingMore.current = false;

        setIsLoading(false);

        console.log("Finished reloading users");
    };

    const loadMoreMatches = async () =>
    {
        // For some reason this function was being called when a different page was navigated to. This if statement 
        // prevents the unnecessary fetch.
        if (!isFocused)
        {
            console.log("Don't load more");
            return;
        }

        if (rfIsLoadingMore.current)
        {
            //console.log("Already loading more.");
            return;
        }
        else
        {
            rfIsLoadingMore.current = true;
        }

        if(matches.length == rfMatches.current.length)
        {
            console.log("All matches loaded.");
            return;
        }

        if (matches.length % usersPerLoad != 0)
        {
            console.log("There cannot be anymore matches to load.");
        }
        else
        {
            // console.log("Calling server for more users.");
            console.log("Loading more users from the cache.");
            const lMatchesMore = rfMatches.current.slice(matches.length, matches.length + usersPerLoad);

            if (lMatchesMore.length == 0)
            {
                console.log("No more matches to load.");
            }
            else
            {
                setMatches(
                    (prev) =>
                    {
                        return [ ...prev, ...lMatchesMore ];
                    }
                );
            }
        }
    };

    const handleScroll = async (e) =>
    {
        // The distance from the bottom of the FlatList's viewport to the bottom of the FlatList's content.
        // i.e. This will be 0 when the user scrolls all the way to the bottom.
        const distanceFromBottom =  e.nativeEvent.contentSize.height - e.nativeEvent.contentOffset.y - e.nativeEvent.layoutMeasurement.height;

        rfFlatListScrollPosition.current =  e.nativeEvent.contentOffset.y;

        if (distanceFromBottom <= heightWindow)
        {
            await loadMoreMatches();
        }
    }

    const handleClickMatch = (idMatch) =>
    {
        setSelectedMatch(
            (prev) =>  { return prev === idMatch ? "" : idMatch }
        );
    };

    const handleClickHeart = async (idMatch) =>
    {
        // TODO: Maybe implement unliking. 
        if (userData.likes.includes(idMatch))
        {
            console.log("Already likes this person.");
            return;
        }

        // Update the state immediately so that the app is responsive.
        setUserData((prev) => { return { ...prev, likes: [ ...prev.likes, idMatch ] } });

        // Update database.
        const fetchResponse = await ApiRequestor.likeProfile(userData._id, idMatch);

        if (fetchResponse)
        {
            // Re-update the user.
            setUserData(
                (prev) => {
                     return { 
                        ...prev, 
                        likes: fetchResponse.updatedLikes, 
                        matches: fetchResponse.updatedMatches, 
                        analytics: { ...prev.analytics, likesFromYou: prev.analytics.likesFromYou + 1 } 
                    }
                }
            );
        }
    };

    const handleClickProfile = (match) =>
    {
        navigation.navigate('userProfile', { user: match });
    }

    const handleClickChat = (match) =>
    {
        // TODO: The user should only be able to do this if the person allows unmatched users to message them.
        navigation.navigate("chat", { reciever: { ...match, images: [ cacheFirstImages.images[match._id] ] } });
    }

    const handleChangeSort = async () =>
    {
        setDisplaySortOptions(false);

        // Return if the sort Id hasn't changed.
        if (rfSortId.current == sortIdSelected && rfSortDirection.current == sortDirection)
            return;

        rfFlatList.current.scrollToOffset({ offset: 0, animated: false });

        rfSortId.current = sortIdSelected;
        rfSortDirection.current = sortDirection;

        sortMatches();
    };

    const handleSortCancel = () =>
    {
        setDisplaySortOptions(false); 
        setSortIdSelected(rfSortId.current);
        setSortDirection(rfSortDirection.current);
    };

    const handleShuffle = () =>
    {
        if (rfFlatList.current)
            rfFlatList.current.scrollToOffset({ offset: 0, animated: false });

        handleReloadMatches();
    }

    // Props that define the 'sort' header button .
    const headerButtonSort = 
    {
        icon: (size, colour) =>
        {
            return (
                <MaterialCommunityIcons 
                    name = "sort" color = { colour } 
                    size = { size } 
                />
            )
        },
        onPress: () =>
        {
            if (matches && matches.length > 1)
                setDisplaySortOptions(true);
        }
    };

    // Props that define the 'reload' header button .
    const headerButtonReload = 
    {
        icon: (size, colour) =>
        {
            return (
                <Ionicons 
                    name = "reload-outline" color = { colour } 
                    size = { size } 
                />
            )
        },
        onPress: handleShuffle
    };

    if (!(isQuizComplete()))
    {
        return (
            <PageContainer 
                navigation={navigation} style = { styles.conIncompletePVQ }
                // propsLeftHeaderButtons = { [ headerButtonFilter ] }
                // propsRightHeaderButtons = { [ headerButtonSort ] }
            >
                <TextStandard 
                    text = "You must complete the values quiz before you can start matching" 
                    size = { 0 }
                    style = { styles.textBody }
                />
                <LinearGradient
                    colors={[theme.buttonMoreVibrant, theme.buttonStandard, theme.buttonLessVibrant ]}
                    style={{
                        ...styles.linearGradientButton, 
                        marginBottom: globalProps.spacingVertBase/2,
                    }}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }} 
                > 
                    <ButtonStandard 
                        text = "Complete Quiz"
                        sizeText = { 1 } isBold
                        onPress = { () => navigation.navigate("pvqPage") } 
                        style = { styles.btn }
                    />
                </LinearGradient> 
            </PageContainer>
        )
    }

    return (
        <PageContainer 
            navigation = {navigation} 
            style = { styles.container } 
            isLoading = { isLoading || matches === undefined || userData === undefined } isLoadingScreenTransparent isScrollable = { false }
            propsLeftHeaderButtons = { [ headerButtonFilter ] } 
            propsRightHeaderButtons = { [ headerButtonReload, headerButtonSort ] }
        >

            {
                (matches && matches.length != 0) && (
                    <View style={{ ...styles.matchesContainer }}>

                        <FlatList
                            scrollsToTop = { false }
                            ref = { rfFlatList }
                            data = { matches }
                            renderItem = {
                                ({item}) =>
                                {
                                    const image = (cacheFirstImages?.images && item._id in cacheFirstImages?.images) ? cacheFirstImages.images[item._id] : undefined;
                                    return (
                                        <MatchContainer
                                            match = { item } image = { image }
                                            handleClickMatch = { handleClickMatch } handleClickHeart = { handleClickHeart }
                                            handleClickProfile = { handleClickProfile } handleClickChat = { handleClickChat }
                                            isSelected = { selectedMatch === item._id } 
                                            isLiked = { userData.likes.includes(item._id) }
                                            doesUserLikeMatch = { userData.likes.includes(item._id) }
                                            doesMatchLikeUser = { item.likes.includes(userData._id) }
                                        />
                                    )
                                }
                            }
                            keyExtractor = { (match) => match._id }
                            showsVerticalScrollIndicator = { false }
                            numColumns = { 2 }
                            contentContainerStyle = { styles.matchesContainerScroll }
                            columnWrapperStyle = {{ justifyContent: 'space-between' }}
                            onScroll = { (e) => { handleScroll(e); } }
                        />

                    </View>
                )
            }

            {
                (matches && matches.length == 0) && (
                    <View style = { styles.conNoMatches }>
                        <TextStandard text = { "Looks like you don't have any matches :(" } style = { styles.textNoMatches } />
                        <TextStandard text = { "You might want to change your preferences to broaden your search." } style = { styles.textNoMatches } />
                        <TextStandard text = { "Press the filter button above to modify your preferences." } style = { styles.textNoMatches } />
                    </View>
                )
            }

            {
                displaySortOptions && (
                    <Modal visible = { true } transparent animationType = "fade">
                        <TouchableOpacity
                            onPress = { () => { setDisplaySortOptions(false); setSortIdSelected(rfSortId.current) } }
                            style = {{ 
                                backgroundColor: theme.header + "7A",
                                ...styles.conSortOptions,
                            }}
                            activeOpacity = { 1 }
                        >
                            <TouchableOpacity 
                                style = {{
                                    backgroundColor: `${theme.content}DD`, borderColor: theme.borders,
                                    width: widthWindow * 0.8,
                                    ...styles.sortOptions,
                                }}
                                activeOpacity = { 1 }
                            >
                                <TextStandard
                                    text = { sortDescriptions[sortIdSelected] } italicise isBold
                                />
                                <RadioGroup
                                    radioButtons = { radioButtonProps }
                                    onPress = { (id) => { setSortIdSelected(id); } }
                                    selectedId = { sortIdSelected }
                                    containerStyle = { styles.radioGroupSort }
                                />
                                <CheckBox
                                    style = {{ ...styles.chkSortDirection, borderColor: theme.borders }}
                                    onClick = { () => setSortDirection((sortDirection <= 0) ? 1 : -1) }
                                    isChecked = { sortDirection == 1 }
                                    leftText = "Sort Low to High"
                                    leftTextStyle = {{ ...styles.chkSortDirectionText, color: theme.font }}
                                    checkBoxColor = { theme.borders }
                                />
                                <View style = {{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <ButtonStandard
                                        text = "CANCEL" sizeText = { 1 } isBold
                                        style = {{ ...styles.btnSortOptions, backgroundColor: theme.buttonLessVibrant }}
                                        onPress = { handleSortCancel }
                                    />
                                    <ButtonStandard
                                        text = { "SORT" } sizeText = { 1 } isBold 
                                        style = {{ ...styles.btnSortOptions, backgroundColor: theme.buttonLessVibrant }}
                                        onPress = { handleChangeSort }
                                    />
                                </View>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
                )
            }

        </PageContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        // justifyContent: 'flex-start', alignItems: 'center', 
        paddingVertical: 15, paddingHorizontal: 15, 
        rowGap: 10, flex: 1
    },
    conTopButtons: {
        flexDirection: "row", justifyContent: "space-between"
    },
    btnIcon: {
        width: globalProps.sizeIconHeaderFooter + 10, height: globalProps.sizeIconHeaderFooter + 10,
        borderRadius: 5, backgroundColor: "transparent"
    },
    matchesContainer: {
        flex: 1, flexGrow: 1,
        width: '100%',
        justifyContent: 'center', 
        //alignItems: 'center', 
        borderRadius: 10, 
        //padding: 15,
        overflow: "hidden",
    },
    matchesContainerScroll: {
        width: "100%",
        flexDirection: 'column', 
        // flexWrap: 'wrap', 
        flexGrow: 1,
        rowGap: 12,
        justifyContent: "space-between",
    },
    matchContainer: {
      width: "48%", borderRadius: 10, overflow: "hidden"
    },
    matchContainerTop: {
        padding: 10, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1
    },
    matchContainerBottom: {
        padding: 10, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1
    },
    matchPhoto: {
      width: '100%',
      height: 200,
    },
    conSelectedMatch: {
        height: "100%", width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 5
    },
    conSelectedMatchTop: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    conSelectedMatchBottom: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    nameContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderBottomLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    scoreContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    nameText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    textNoMatches: {
        textAlign: "center"
    },
    conNoMatches: {
        width: "100%",
        rowGap: utilsGlobalStyles.spacingVertN(-1)
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    expandedPhoto: {
        width: "90%",
        height: "90%",
        borderRadius: 8,
    },
    conIncompletePVQ: {
        rowGap: utilsGlobalStyles.spacingVertN()
    },
    textBody: {
        textAlign: "center"
    },
    btn: {
        width: "100%",
        padding: 20,
        borderRadius: 100, borderWidth: 1,
        backgroundColor: 'transparent'
    },
    linearGradientButton:
    {
        width: "100%", 
        //alignContent: "center",
        borderRadius: 100,  
    }, 
    conSortOptions: {
        alignItems: "center",
        justifyContent: "center", 
        flex: 1,
    },
    sortOptions: {
        borderWidth: 1,
        rowGap: utilsGlobalStyles.spacingVertN(-1),
        padding: utilsGlobalStyles.fontSizeN(),
        borderRadius: globalProps.borderRadiusStandard
    },
    radioGroupSort: {
        alignItems: "center", rowGap: 5
    },
    chkSortDirection: {
        width: "75%", 
        borderWidth: 1, 
        borderRadius: 100,
        alignSelf: "center",
        padding: 7, paddingHorizontal: utilsGlobalStyles.fontSizeN()
    },
    chkSortDirectionText: {
        fontSize: utilsGlobalStyles.fontSizeN(),
        fontWeight: globalProps.fontWeightBold
    },
    conRadioButton: {
        width: "75%", 
        borderWidth: 1, borderRadius: 100, 
        justifyContent: "space-between", 
        padding: 7, paddingRight: utilsGlobalStyles.fontSizeN(),
    },
    lblRadioButton: {
        fontWeight: globalProps.fontWeightBold, 
        fontSize: utilsGlobalStyles.fontSizeN() 
    },
    btnSortOptions: 
    {
        paddingVertical: 15,
        width: "45%",
        borderRadius: globalProps.borderRadiusStandard,
    },
});

const usersPerLoad = 10;

// Props that define the 'filter' (preferences) header button.
const headerButtonFilter =
{
    icon: (size, colour) =>
    {
        return (
            <MaterialCommunityIcons 
                name = "filter" color = { colour } 
                size = { size } 
            />
        )
    },
    onPress: (navigation) =>
    {
        navigation.navigate("settingsPrefs");
    }
};

const sortData = [
    { id: 'matchScore', label: "Values", }, // color: "#ffffff", labelStyle: { color: "#ffffff" }
    { id: 'distance', label: "Distance" },
    { id: 'age', label: "Age" },
];

const sortDescriptions = {
    matchScore: "Your results will be sorted according to how similar your values are to theirs.",
    distance: "Your results will be sorted based on your distance to them.",
    age: "Your results will be sorted according to their age."
};

// The default sorting direction for each sort type (true is ascending).
const defaultSortDirection = { 
    matchScore: false, distance: true, age: true
};

export default Search;