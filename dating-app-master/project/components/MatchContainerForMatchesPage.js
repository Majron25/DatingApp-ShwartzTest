import { View, TouchableOpacity, Modal, StyleSheet, Dimensions, ImageBackground, useWindowDimensions, Image } from 'react-native';
import PropTypes from 'prop-types';
import { useContext } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import TextStandard from './TextStandard';
import ButtonStandard from './ButtonStandard';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { utilsGlobalStyles, globalThemes } from '../styles_global';
import { LinearGradient } from 'expo-linear-gradient';
import { religions } from '../shared_data'; 
import PVQ_BORDER from '../assets/PVQ_BORDER.png'
/**
* A preview of a user's account, which is designed to be displayed on the Search and/or Matches page.

* Props:
    * @param {Object} match - The user's object.
    * @param {function} handleClickMatch - A callback which is called when the component is clicked. The _id property of 
      the 'match' prop is passed in to this function when called.
    * @param {bool} isSelected - Whether the component is selected.
    * @param {bool} isLiked - Whether the user has liked this match.
*/
function MatchContainerForMatchesPage({ match, handleClickMatch, handleClickHeart, handleClickProfile, handleClickChat, isSelected })
{
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];
    
    const { height : heightWindow } = useWindowDimensions();
 
    return ( 
        <TouchableOpacity
            key={match._id}
            onPress={ () => handleClickMatch(match) }
        >
        <LinearGradient
            colors={[theme.content, theme.content, theme.content]}
            style={{ 
                width: "100%",
                height: heightWindow*0.3,
                flexGrow: 0, 
                backgroundColor: theme.content,
                borderRadius: 20, 
                padding: 10,
                flexDirection: "row", 
            }}
        >
            <View
                //key={match._id}
                style = {{ ...styles.matchContainer, borderWidth: 0, borderColor: theme.borders}} 
                //activeOpacity = { 1 }
                //onPress = { () => handleClickMatch(match) }
            >  
            <View style={styles.matchPhoto}>
                
                <ImageBackground 
                    source = {{ uri: match.images[0] }} 
                    style = {{ width: "100%", height: "100%"}} 
                    resizeMode = "cover"
                >
                <View style={{
                    backgroundColor: `${theme.header}88` 
                }}>
                    <TextStandard 
                        text={match.name}
                        size={1} 
                        style={{alignSelf: 'center'}} 
                    /> 
                </View>
                </ImageBackground>
                 
            </View>

            </View>
            <View
                style={{
                    paddingHorizontal: 10, 
                    flex: 1, 
                    alignItems: "flex-end"
                }}
            >
                
                <View style={{height: "100%", aspectRatio: 1, justifyContent: "center", alignItems: "center"}}>
                    <Image resizeMode='center' source={PVQ_BORDER} style={{height: '100%',  aspectRatio: 1, position: 'absolute'}}></Image> 
                    <Image source={{uri: match.pvqPNG}} style={{height: '76.92%', aspectRatio: 1, position: 'absolute'}}></Image> 
                </View> 
                {/*
                <View style={{
                    flexDirection: "row",
                    flexWrap: "wrap" 
                }}> 
                        <View style={styles.tableInfoLeftSide}>
                            <TextStandard text = {`Compatibility`} />
                        </View>

                        <View style={styles.tableInfoRightSide}>
                            <TextStandard text = {`${match.matchScore}%`} />
                        </View>
                        
                        <View style={styles.tableInfoLeftSide}> 
                            <TextStandard text = {`Distance`} />
                        </View>

                        <View style={styles.tableInfoRightSide}> 
                            <TextStandard text = {`${religions.find(religion => religion.key === match.religion)?.value}`} />
                        </View>
                        
                        <View style={styles.tableInfoLeftSide}>  
                            <TextStandard text = {`Religion`} />
                        </View>
                        <View style={styles.tableInfoRightSide}>
                            <TextStandard text = {`${match.religion}`} />
                        </View> 

                        <View style={styles.tableInfoLeftSide}>
                            <TextStandard text = {`Age`} />
                        </View>

                        <View style={styles.tableInfoRightSide}> 
                            <TextStandard text = {`${match.age}`} />
                        </View> 

                        <View style={styles.tableInfoLeftSide}> 
                            <TextStandard text = {`Gender`} />
                        </View>

                        <View style={styles.tableInfoRightSide}>  
                            <TextStandard text = {`${match.gender}`} />
                        </View> 

                </View>
            */}
            </View>
        </LinearGradient>
        </TouchableOpacity>
    );
}

MatchContainerForMatchesPage.propTypes =
{
    match: PropTypes.object.isRequired, 
    handleClickMatch: PropTypes.func.isRequired, 
    isSelected: PropTypes.bool,
    isLiked: PropTypes.bool,
};

MatchContainerForMatchesPage.defaultProps =
{
    isSelected: false,
    isLiked: false
};

const styles = StyleSheet.create(
    {
        matchContainer: 
        {
            width: "30%", borderRadius: 10, overflow: "hidden",  
            height: "100%"
        }, 
        matchPhoto: 
        {
            width: "100%", 
            
            alignSelf: 'center'
        }, 
        tableInfoRightSide: {
            flexBasis: "50%",
            alignItems: 'center', 
            
        },
        tableInfoLeftSide: {
            flexBasis: "50%",
            paddingHorizontal: 0,  
            alignItems: 'flex-start', 
        },
        tableRow:
        {
            flexBasis: "100%",
            backgroundColor: 'red'
        }
    }
);

export default MatchContainerForMatchesPage;