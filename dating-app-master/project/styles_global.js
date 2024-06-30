import { StyleSheet, } from "react-native";

/*
* Global styling properties that are used to style components throughout the app.
* These values aim to ensure that styling is consistent.
*/
const globalProps = 
{
    /*
    * The 'standard' value of vertical spacing between elements.
    * The vertical distance between two elements should equal this value, or this value multiplied by a multiple of
      spacingVertMultiplier.
    */
    spacingVertBase: 30,

    /*
    * The multiplier of spacingVertBase.
    * If you want the vertical distance between two elements to be higher than spacingVertBase, you multiply 
      spacingVertBase by spacingVertMultiplier; likewise, if you want two elements to be spaced less than 
      spacingVertBase, you divide spacingVertBase by spacingVertMultiplier.
    * If you want the vertical distance between two elements to be even higher, you multiply spacingVertBase by a 
      multiple of spacingVertMultiplier: i.e. verticalDistance = spacingVertBase * (spacingVertMultiplier)^n.
    * The 'spacingVertN' function can be used to calculate the nth biggest vertical spacing, which is exported via the 
      object 'utilsGlobalStyles' (see below).
    * The point of having spacingVertBase and spacingVertMultiplier is to ensure that vertical spacing between elements
      is standardised across the application.
    */
    spacingVertMultiplier: 1.5,

    // The default theme.
    themeDefault: "light",

    /*
    * The 'standard' fontSize value of Text elements.
    * The fontSize of a Text element should equal this value, or this value multiplied by a multiple of 
      fontSizeMultiplier.
    */
    fontSizeBase: 16,

    /*
    * The multiplier of fontSizeBase.
    * If you want the fontSize of a Text element to be higher than fontSizeBase, you multiply fontSizeBase by 
      fontSizeMultiplier; likewise, if you want the fontSize of a Text element to be lower than fontSize, you divide it
      by fontSizeMultiplier.
    * If you want a Text element's fontSize to be even higher, you multiply fontSizeBase by a multiple of 
      fontSizeMultiplier: i.e. fontSize = fontSizeBase * (fontSizeMultiplier)^n.
    * The point of having fontSizeBase and fontSizeMultiplier is to ensure that font sizes are standardised across the 
      application.
    */
    fontSizeMultiplier: 1.25,

    // The fontWeight of bold text.
    fontWeightBold: 700,

    // The height of the header.
    heightHeader: 60,

    // The height of the footer (i.e. navbar).
    heightFooter: 60,

    sizeIconHeaderFooter: 30,

    borderRadiusStandard: 10
};

/*
* The app's themes.
* IMPORTANT: each 'dark' theme must contain the word 'dark' (all lowercase) in order for the device's status bar to
  be set to the correct mode (i.e. either light or dark).
*/
const globalThemes =
{
    dark:
    {
        // The backgroundColour of the app's header.
        header: "#121212",

        // The backgroundColour of the app's navbar.
        navBar: "#121212",

        // The backgroundColour of the app's content (i.e. the part between the header and footer: the page itself).
        content: "#2D4147",//"#464646",

        // The default color (i.e. text colour) property of TextInputStandard and TextStandard elements.
        font: "#ffffff",

        // The colour of 'faded' font, used as the colour for placeholder text in the TextInputStandard component.
        fontFaded: "#9F9F9F",

        // The default color (i.e. text colour) property of ButtonStandard elements.
        fontButton: "#ffffff",

        // The default color (i.e. text colour) property of inactiveButtonStandard elements.
        fontButtonInactive: "#4F4F4F",

        // The colour of chatmessages 
        fontChatMessages: "#ffffff",

        // The backgroundColors of the ButtonStandard component.
        buttonMoreVibrant: "#1A2C32",
        buttonStandard: "#121212",
        buttonLessVibrant: "#17282D", // 17282D
        buttonStandardInactive: "#17282D",

        // The default border colour of various elements, such as the header, 'TextInputStandard' elements, etc.
        borders: "#7cc7fc",//"#C7C7C7",

        // The colour of the icon in the active tab of the navbar.
        iconNavBarActive: "#7cc7fc",//"#C7C7C7",

        // The colour of the icon in the inactive tabs of the navbar.
        iconNavBarInactive: "#616161",

        iconButtonNextPage: "#7cc7fc",

        // The colour of the icons in the header.
        iconHeader: "#7cc7fc",//"#C7C7C7",

        // The theme's name.
        name: "Dark",

        decorative1: "#121212",
        decorative2: "#17282D",//"#363636",
        decorative3: "#2E2E2E",

        sliders: {
            trackActive: "#7cc7fc",
            trackInactive: "#335B77",
        },

        chatBoxYou: "#7cc7fc",
        chatBoxThem: "#47ABF3",

    },
    light:
    {
        header: "#9DCFFD",
        navBar: "#9DCFFD",
        // content: "#acd6fc",
        content: "#D7ECFF",
        font: "#000",
        fontFaded: "#5C5C5C",
        fontButton: "#fafafc",
        fontButtonInactive: "#fafafc",
        fontChatMessages: "#ffffff",
        buttonMoreVibrant: "#6949f5",
        buttonStandard: "#5d79f5",
        buttonLessVibrant: "#7cc7fc",
        buttonStandardInactive: "#E6E6E6",
        borders: "#1D43EC",
        iconNavBarActive: "#3658F1",
        iconNavBarInactive: "#D6E5F3",
        iconButtonNextPage: "#ffffff",
        iconHeader: "#3658F1",
        name: "Light",
        decorative1: "#9DCFFD",
        decorative2: "#BCDAF6",
        decorative3: "#cce5fc",

        sliders: {
            trackActive: "#1D43EC",
            trackInactive: "#ffffff",
        },

        chatBoxYou: "#3B5BE7",
        chatBoxThem: "#1038EA",
    },
    // darkBlue:
    // {
    //     header: "#171931",
    //     navBar: "#171931",
    //     content: "#353C5E",
    //     font: "#fff",
    //     fontFaded: "#DAD8D8",
    //     fontButton: "#ffffff",
    //     fontButtonInactive: "#6E6E6E",
    //     buttonMoreVibrant: "#6949f5",
    //     buttonStandard: "#5d79f5",
    //     buttonLessVibrant: "#7cc7fc",
    //     buttonStandardInactive: "#E6E6E6",
    //     borders: "#868EF7",
    //     iconNavBarActive: "#868EF7",
    //     iconNavBarInactive: "#434A86",
    //     iconHeader: "#868EF7",
    //     name: "Ocean",
    //     decorative1: "#1F1E1E",
    //     decorative2: "#1F1E1E",
    //     decorative3: "#1F1E1E"
    // },
    // darkRed:
    // {
    //     header: "#311717",
    //     navBar: "#311717",
    //     content: "#5E3535",
    //     font: "#fff",
    //     fontFaded: "#DAD8D8",
    //     fontButton: "#ffffff",
    //     fontButtonInactive: "#6E6E6E",
    //     buttonMoreVibrant: "#6949f5",
    //     buttonStandard: "#5d79f5",
    //     buttonLessVibrant: "#7cc7fc",
    //     buttonStandardInactive: "#E6E6E6",
    //     borders: "#F78686",
    //     iconNavBarActive: "#F78686",
    //     iconNavBarInactive: "#864343",
    //     iconHeader: "#F78686",
    //     name: "Scarlet",
    //     decorative1: "#1F1E1E",
    //     decorative2: "#1F1E1E",
    //     decorative3: "#1F1E1E"
    // },
    // darkPurple:
    // {
    //     header: "#31172F",
    //     navBar: "#31172F",
    //     content: "#5E355C",
    //     font: "#fff",
    //     fontFaded: "#DAD8D8",
    //     fontButton: "#fff",
    //     fontButtonInactive: "#6E6E6E",
    //     buttonMoreVibrant: "#6949f5",
    //     buttonStandard: "#5d79f5",
    //     buttonLessVibrant: "#7cc7fc",
    //     buttonStandardInactive: "#E6E6E6",
    //     borders: "#E186F7",
    //     iconNavBarActive: "#E186F7",
    //     iconNavBarInactive: "#864386",
    //     iconHeader: "#E186F7",
    //     name: "Plum",
    //     decorative1: "#1F1E1E",
    //     decorative2: "#1F1E1E",
    //     decorative3: "#1F1E1E"
    // },
};

/*
* Returns the 'nth' biggest fontSize.
* When n is 0, the returned value is simply globalProps.fontSizeBase.
* If n < 0, the returned value will be less than globalProps.fontSizeBase.
* If n > 0, the returned value will be greater than globalProps.fontSizeBase.

* Parameters:
    > n: the 'rank' of the returned value.
*/
function fontSizeN(n = 0)
{
    return globalProps.fontSizeBase * Math.pow(globalProps.fontSizeMultiplier, n);
}

/*
* Returns the 'nth' biggest vertical spacing.
* The returned value is intended to be used as a marginTop/marginBottom value of an element.
* When n is 0, the returned value is simply globalProps.spacingVertBase.
* If n < 0, the returned value will be less than globalProps.spacingVertBase.
* If n > 0, the returned value will be greater than globalProps.spacingVertBase.

* Parameters:
    > n: the 'rank' of the returned value.
*/
function spacingVertN(n = 0)
{
    return globalProps.spacingVertBase * Math.pow(globalProps.spacingVertMultiplier, n);
}

/*
* Returns whether the theme associated with themeName is considered 'dark'.
* In order for this to work, every 'dark' theme must contain the word 'dark'.

* Parameters:
    > themeName: a string that should match one of the keys of globalStyles.themes.
*/
function isThemeDark(themeName)
{
    if (!themeName)
    {
        console.log("No theme name provided; assuming theme is dark.");
        return true;
    }
    else if (typeof themeName !== 'string')
    {
        console.log("The theme name must be a string; assuming theme is dark.");
        return true;
    }
    else if (!(Object.keys(globalThemes)).includes(themeName))
    {
        console.log("This theme name is invalid; assuming theme is dark.");
        return true;
    }

    return themeName.includes("dark");
}

const globalStyles = StyleSheet.create(
    {
        textboxSingleLine:
        {
            width: "80%",
            maxWidth: 350,
            borderWidth: 0,
            borderRadius: 0,
            borderBottomWidth: 1,
            textAlign: "center",
            alignSelf: "center"
        }
    }
)

/*
* Utility functions used throughout the application to assist with styling.
*/
const utilsGlobalStyles = 
{
    fontSizeN: fontSizeN, 
    spacingVertN: spacingVertN,
    isThemeDark: isThemeDark
};

export { globalProps as default, utilsGlobalStyles, globalThemes, globalStyles };