import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from 'prop-types';
import { Slider } from '@miblanchard/react-native-slider';

import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";

/*
* A standard slider component which allows the user to set a value over a given range.

* Props:
    > value: the current value of the slider.
    > valueFormatted: an optional formatted version of 'value'. If valueFormatted is defined, it will be displayed 
      instead of 'value'.
    > min: the minimum value.
    > max: the maximum value.
    > step: the slider's increment.
    > onChange: the function that's called when the slider's position changes. This function should accept one parameter
      , which is the new value of the slider.
*/
function SliderSingleStandard({ value, valueFormatted, min, max, step, onChange })
{
    // The name of the current theme and the function that handles updating it.
    const { themeName, updateTheme } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const progressStart = getProgressPercent(value, min, max);

    return (
        <View style = {{ ...styles.container, borderColor: theme.borders }}>

            <View 
                style = {{ ...styles.containerInner, borderColor: theme.borders }}
            >
                <Slider 
                    minimumValue = { min }
                    maximumValue = { max }
                    step = { step }
                    value = { value }
                    onValueChange = { onChange }
                    thumbStyle = { styles.sliderThumb }
                    containerStyle = {{ ...styles.sliderContainer }}
                    minimumTrackTintColor = { "transparent" } 
                    maximumTrackTintColor = { "transparent" }
                    // minimumTrackTintColor = { theme.borders } 
                    // maximumTrackTintColor = { theme.buttonMoreVibrant }
                />

                <View 
                    style = {{ 
                        ...styles.progress, width: `${progressStart}%`, 
                        backgroundColor: theme.borders, //theme.buttonLessVibrant
                        borderColor: theme.borders, 
                        left: 0
                    }}
                >
                </View>

                <View 
                    style = {{ 
                        ...styles.thumbCustom, ...styles.thumbCustomRight, backgroundColor: theme.borders, left: `${progressStart}%`
                    }}
                >
                </View>

                <View 
                    style = {{ 
                        ...styles.trackCustom, backgroundColor: theme.sliders.trackInactive
                    }}
                >
                </View>

                <TextStandard 
                    text = { valueFormatted ? valueFormatted : value } isBold
                    size = { 1 }
                    style = {{ ...styles.sliderVal, ...styles.sliderValRight, left: `${progressStart}%` }}
                />

            </View> 


        </View>
    );
}


SliderSingleStandard.propTypes =
{
    value: PropTypes.number.isRequired,
    valuesFormatted: PropTypes.string,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    step: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};

SliderSingleStandard.defaultProps = 
{
    valueFormatted: undefined
};

const styles = StyleSheet.create(
    {
        container:
        {
            position: "relative", 
            alignItems: "center",
            height: 60,
            // borderWidth: 1, 
        },
        containerInner:
        {
            position: "relative", 
            justifyContent: "center",
            height: "100%",
            width: "85%",
            // borderWidth: 1,
        },
        sliderThumb:
        {
            // height: "100%", 
            // width: 5, 
            // borderRadius: globalProps.borderRadiusStandard,
            backgroundColor: "transparent"
        },
        sliderContainer:
        {
            // flexGrow: 1,
            backgroundColor: "transparent",
            zIndex: 100
        },
        sliderVal:
        {
            position: "absolute",
            flexGrow: 0,
            fontSize: 16,
            paddingHorizontal: 5,
            // backgroundColor: "red"
            // height: "100%",
            // textAlignVertical: "center", textAlign: "center",
            // position: "absolute",
            // zIndex: 1
        },
        sliderValRight:
        {
            top: 0,
            transform: [ { translateX: -15 } ]
        },
        sliderValLeft:
        {
            bottom: 0,
            transform: [ { translateX: -40 } ]
        },
        thumbCustom:
        {
            width: 20, height: 20, borderRadius: 10,
            position: "absolute",
            top: "50%", zIndex: 1
        },
        thumbCustomLeft:
        {
            transform: [ { translateX: -20 }, { translateY: -10 } ]
        },
        thumbCustomRight:
        {
            transform: [{ translateX: -10 }, { translateY: -10 } ]
        },
        trackCustom:
        {
            height: 5, width: "100%",
            borderRadius: 100,
            flexGrow: 0,
            position: "absolute", 
            top: "50%", 
            transform: [ { translateY: -2.5 } ],
            left: 0, 
            zIndex: 0, 
        },
        progress:
        {
            height: 5, 
            borderRadius: 100,
            flexGrow: 0,
            position: "absolute", 
            top: "50%", 
            transform: [ { translateY: -2.5 } ],
            left: 0, 
            zIndex: 1,
            // borderWidth: 1,
        },
    }
);

function getProgressPercent(val, min, max)
{
    const lRange = max - min;

    const lDistance = val - min;

    const lPercentage = (lDistance / lRange) * 100;

    return lPercentage;
};

export default SliderSingleStandard;