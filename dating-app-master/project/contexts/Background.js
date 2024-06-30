import React, {useContext} from 'react';
import { LinearGradient } from 'expo-linear-gradient'; 
import { globalThemes } from '../styles_global.js';
import ThemeContext from '../contexts/ThemeContext.js';

const BackgroundGradient = () => {
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];
    return (
        <>
        <LinearGradient
            colors={[theme.decorative1, theme.decorative2, theme.content]}
            locations = { [ 0.15, 0.55, 0.99 ] }
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 5,
                height: '100%',
                width: '100%',
                position: 'absolute',
            }}
        ></LinearGradient>
        
        </>
    );
};

export default BackgroundGradient;
