import React, { useContext } from 'react';
import { Animated, Dimensions, useWindowDimensions, View } from 'react-native';
import ThemeContext from '../contexts/ThemeContext.js';

import { globalThemes } from '../styles_global.js';
const BackgroundCircle = ({transformAnimation1=1, transformAnimation2=1, transformAnimation3=1}) => {
  
  const { themeName } = useContext(ThemeContext);
  let theme = globalThemes[themeName];
  
  const { height , width } = useWindowDimensions();
  //const { height, width } = Dimensions.get('screen');
  const smallCircleSize = Math.min(height, width) * 0.5 * 0.62;
  const bigCircleSize = Math.min(height, width) * 0.78;

  //const circleSize = isSmall ? smallCircleSize : bigCircleSize;
  
  return (
    <View style={{width: "100%", height: "100%", position: 'absolute'}}>
      <Animated.View
        style={{
          width: smallCircleSize,
          height: smallCircleSize,
          borderRadius: smallCircleSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.decorative3, 
          position: 'absolute',
          right: "21%",
          top: "8%",
          //transform: transformAnimation === null ? [{scale: 1}] : [{scale: transformAnimation}],
          transform: [{scale: transformAnimation3}]
        }}
      ></Animated.View>
      <Animated.View
        style={{
          width: bigCircleSize,
          height: bigCircleSize,
          borderRadius: bigCircleSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.decorative1, 
          position: 'absolute',
          right: "-33%",
          top: "-25%",
          //transform: transformAnimation === null ? [{scale: 1}] : [{scale: transformAnimation}],
          transform: [{scale: transformAnimation1}]
        }}
      ></Animated.View>
      <Animated.View
        style={{
          width: bigCircleSize,
          height: bigCircleSize,
          borderRadius: bigCircleSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.decorative2, 
          position: 'absolute',
          left: "-20%",
          top: "-13%",
          //transform: transformAnimation === null ? [{scale: 1}] : [{scale: transformAnimation}],
          transform: [{scale: transformAnimation2}]
        }}
      ></Animated.View>
    </View>
  );
};

export default BackgroundCircle;
