import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from 'prop-types';
import { Slider } from '@miblanchard/react-native-slider';

import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global.js';
import TextStandard from "./TextStandard.js";

/*
* A slider that allow the user to define a range of values from a minimum to a maximum value along defined range.

* Props:
    > values: the current value of the slider.
    > valuesFormatted: an optional object that contains formatted versions of values. If valuesFormatted is defined, its
      properties will be displayed, rather than those of 'values'.
    > min: the minimum value.
    > max: the maximum value.
    > step: the slider's increment.
    > onChange: the function that's called when the slider's position changes. This function should accept one parameter
      , which is the new value of the slider.
*/
function SliderRangeStandard({ values, valuesFormatted, min, max, step, onChange })
{
    // The name of the current theme and the function that handles updating it.
    const { themeName, updateTheme } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const progressLength = getProgressPercentRange(values.low, values.high, min, max);

    const progressStart = getProgressPercent(values.low, min, max);

    const progressEnd = 100 - (progressStart + progressLength);

    return (
        <View style = {{ ...styles.container, borderColor: theme.borders }}>

            <View 
                style = {{ ...styles.containerInner, borderColor: theme.borders }}
            >
                <Slider 
                    minimumValue = { min }
                    maximumValue = { max }
                    step = { step }
                    value = { [ values.low, values.high ] }
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
                        ...styles.progress, width: `${progressLength}%`, 
                        backgroundColor: theme.borders, //theme.buttonLessVibrant
                        borderColor: theme.borders, 
                        left: `${progressStart}%`
                    }}
                >
                </View>

                <View 
                    style = {{ 
                        ...styles.thumbCustom, ...styles.thumbCustomLeft, backgroundColor: theme.borders, left: `${progressStart}%`
                    }}
                >
                </View>

                <View 
                    style = {{ 
                        ...styles.thumbCustom, ...styles.thumbCustomRight, backgroundColor: theme.borders, right: `${progressEnd}%`
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
                    text = { valuesFormatted ? valuesFormatted.low : values.low } isBold
                    size = { 1 }
                    style = {{ ...styles.sliderVal, ...styles.sliderValLeft, left: `${progressStart}%` }}
                />

                <TextStandard 
                    text = { valuesFormatted ? valuesFormatted.high : values.high } isBold
                    size = { 1 }
                    style = {{ ...styles.sliderVal, ...styles.sliderValRight, right: `${progressEnd}%` }}
                />

            </View> 


        </View>
    );
}


SliderRangeStandard.propTypes =
{
    values: PropTypes.shape(
        {
            low: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired,
            high: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired,
        }
    ).isRequired,
    valuesFormatted: PropTypes.shape(
        {
            low: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired,
            high: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired,
        }
    ),
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    step: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};

SliderRangeStandard.defaultProps = 
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
            width: "87%",
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
            // height: "100%",
            // textAlignVertical: "center", textAlign: "center",
            // position: "absolute",
            // zIndex: 1
        },
        sliderValRight:
        {
            top: 0,
            transform: [ { translateX: 30 } ]
        },
        sliderValLeft:
        {
            bottom: 0,
            transform: [ { translateX: -30 } ]
        },
        thumbCustom:
        {
            // width: 20, height: 20, 
            // borderRadius: 10,
            width: 10, height: 20, 
            // borderRadius: 10,
            position: "absolute",
            top: "50%", zIndex: 1
        },
        thumbCustomLeft:
        {
            borderTopLeftRadius: 10, borderBottomLeftRadius: 10,
            transform: [ { translateX: -10 }, { translateY: -10 } ]
        },
        thumbCustomRight:
        {
            borderTopRightRadius: 10, borderBottomRightRadius: 10,
            transform: [ { translateX: 10 }, { translateY: -10 } ]
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

function getProgressPercentRange(valLow, valHigh, min, max)
{
    const lRange = max - min;

    const lDistance = valHigh - valLow;

    const lPercentage = (lDistance / lRange) * 100;

    return lPercentage;
};

function getProgressPercent(val, min, max)
{
    const lRange = max - min;

    const lDistance = val - min;

    const lPercentage = (lDistance / lRange) * 100;

    return lPercentage;
};

export default SliderRangeStandard;