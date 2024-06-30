import { View, TouchableOpacity, Modal, StyleSheet, useWindowDimensions, ImageBackground } from 'react-native';
import PropTypes from 'prop-types';
import { useContext } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import TextStandard from './TextStandard';
import ButtonStandard from './ButtonStandard';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { utilsGlobalStyles, globalThemes } from '../styles_global';
import LoadingArea from './LoadingArea';

/**
* A preview of a user's account, which is designed to be displayed on the Search and/or Matches page.

* Props:
    * @param {Object} match - The match's object.
    * @param {Object} image - The match's image.
    * @param {function} handleClickMatch - A callback which is called when the component is clicked. The _id property of 
      the 'match' prop is passed in to this function when called.
    * @param {bool} isSelected - Whether the component is selected.
    * @param {bool} isLiked - Whether the user has liked this match.
*/
function MatchContainer({ match, image, handleClickMatch, handleClickHeart, handleClickProfile, handleClickChat,
                          isSelected, isLiked, doesUserLikeMatch, doesMatchLikeUser })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const { height : heightWindow } = useWindowDimensions();

    const getHeartColour = () =>
    {
        if (doesUserLikeMatch || doesMatchLikeUser)
        {
            if (doesUserLikeMatch && doesMatchLikeUser)
                return "#9B65D5";
            else if (doesUserLikeMatch)
                return "red";
            else if (doesMatchLikeUser)
                return "#008CFF";
        }
        else
        {
            return theme.borders;
        }
    };

    const getHeartType = () =>
    {
        if (doesUserLikeMatch && doesMatchLikeUser)
            return "heart";
        else if (doesUserLikeMatch || doesMatchLikeUser)
            return "heart-half";
        else
            return "heart-outline";
    }

    const messagingAllowed = match.settings.privacy.allowUnmatchedMessages || (doesUserLikeMatch && doesMatchLikeUser);

    return (
        
        <TouchableOpacity
            style = {{ ...styles.matchContainer, height: heightWindow * 0.4, borderWidth: 1, borderColor: theme.borders }} 
            activeOpacity = { 1 }
            onPress = { () => handleClickMatch(match._id) }
        >
            <ImageBackground 
                source = {{ uri: image }} 
                style = {{ width: "100%", height: "100%" }} 
                resizeMode = "cover"
            >
                {
                    !image && (
                        <LoadingArea />
                    )
                }
                {
                    isSelected ? (
                        <View style = {{ ...styles.conSelectedMatch, backgroundColor: `${theme.header}88` }}>
                            <View style = { styles.conSelectedMatchTop }>
                                <ButtonStandard 
                                    style = { styles.btnIcon }
                                    icon = {
                                        <MaterialCommunityIcons 
                                            name = "block-helper"
                                            size = { globalProps.sizeIconHeaderFooter } 
                                            color = { theme.borders } 
                                        />
                                    }
                                    onPress = {
                                        () => { console.log("Implement 'block' functionality. Maybe a confirmation pop-up if the user has liked them."); }
                                    }
                                />
                                <ButtonStandard 
                                    style = { styles.btnIcon }
                                    icon = {
                                        <MaterialCommunityIcons 
                                            name = { messagingAllowed ? "message" : "message-off-outline" } 
                                            size = { globalProps.sizeIconHeaderFooter } 
                                            color = { theme.borders } 
                                        />
                                    }
                                    onPress = {
                                        () => { 
                                            if (messagingAllowed)
                                                handleClickChat(match) 
                                        }
                                    }
                                />
                            </View>

                            <View style = { styles.conSelectedMatchBottom }>
                                <ButtonStandard 
                                    style = { styles.btnIcon }
                                    icon = {
                                        <MaterialCommunityIcons 
                                            name = "cards-heart" size = 
                                            { globalProps.sizeIconHeaderFooter } 
                                            color = { isLiked ? "#ff0000" : theme.borders }
                                        />
                                    }
                                    onPress = {
                                        () => { handleClickHeart(match._id) }
                                    }
                                />
                                <ButtonStandard 
                                    style = { styles.btnIcon }
                                    icon = {
                                        <MaterialCommunityIcons name = "account-circle-outline" size = { globalProps.sizeIconHeaderFooter } color = { theme.borders } />
                                    }
                                    onPress = {
                                        () => { handleClickProfile(match) }
                                    }
                                />
                            </View>
                        </View>
                    ) : (
                        <View style = { styles.conMatchDetails }>
                            <View 
                                style = {{
                                    backgroundColor: `${theme.header}88` , ...styles.matchContainerTop,
                                    borderColor: 'transparent', 
                                }}
                            >
                                
                                <TextStandard style = {styles.scoreText} text = {`${match.matchScore}%`} isBold /> 
                                    <View style = { (!doesUserLikeMatch && doesMatchLikeUser) ? styles.reflectInYaxis : undefined }>
                                        <Ionicons 
                                            name = { getHeartType() } 
                                            size =   { 25 } 
                                            color = { getHeartColour() }
                                        />
                                    </View> 
                                <TextStandard style = {styles.scoreText} text = {`${match.distance}km`} isBold />
                            </View>
                            
                            
                            <View 
                                style = {{ 
                                    backgroundColor: `${theme.header}88` , ...styles.matchContainerBottom,
                                    borderColor: 'transparent'
                                }}
                            >
                                <TextStandard style={styles.nameText} text={match.name} isBold />
                                <TextStandard style={styles.nameText} text={match.age} isBold />
                            </View>
                        </View>
                    )
                }
            </ImageBackground>
        </TouchableOpacity>
    );
}

MatchContainer.propTypes =
{
    match: PropTypes.object.isRequired,
    image: PropTypes.string,
    handleClickMatch: PropTypes.func.isRequired,
    handleClickHeart: PropTypes.func.isRequired,
    handleClickProfile: PropTypes.func.isRequired,
    handleClickChat: PropTypes.func.isRequired,
    isSelected: PropTypes.bool,
    isLiked: PropTypes.bool,
};

MatchContainer.defaultProps =
{
    isSelected: false,
    isLiked: false
};

const styles = StyleSheet.create(
    {
        matchContainer: 
        {
            width: "48%", borderRadius: 10, overflow: "hidden",
            minHeight: 325,
            display: "flex",  
            flexDirection: "column",
        },
        matchContainerTop: 
        {
            padding: 10, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1
        },
        matchContainerBottom: 
        {
            padding: 10, 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            borderTopWidth: 1,
            marginTop: 'auto',
        },
        matchPhoto: 
        {
            width: '100%',
            //minHeight: 250,
        },
        conMatchDetails:
        {
            height: "100%", width: "100%", overflow: "hidden",
            flexDirection: "column", 
            justifyContent: "space-between",
        },
        conSelectedMatch: 
        {
            height: "100%", width: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            // padding: 5
        },
        conSelectedMatchTop: 
        {
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between"
        },
        conSelectedMatchBottom: 
        {
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between"
        },
        btnIcon: {
            // width: globalProps.sizeIconHeaderFooter + 10, height: globalProps.sizeIconHeaderFooter + 10,
            padding: 12, 
            backgroundColor: "transparent"
        },
        reflectInYaxis:
        {
            transform: [ { scaleX: -1 } ]
        }
    }
);

export default MatchContainer;