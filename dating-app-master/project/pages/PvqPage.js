import React, { useState, useContext, useRef, useEffect } from "react"; 
import PropTypes from 'prop-types';

import PageContainer from "../components/PageContainer";
import TextStandard from "../components/TextStandard";
import ButtonStandard from "../components/ButtonStandard";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import {Slider} from '@miblanchard/react-native-slider'; // A (more flexible) alternative slider.
import ThemeContext from "../contexts/ThemeContext";
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global.js';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import ApiRequestor from '../ApiRequestor.js';
import { useAuth } from '../AuthContext';
import { LinearGradient } from "expo-linear-gradient";
import HeaderButton from "../components/HeaderButton";
 
function PvqPage({ navigation, usePersonalPronouns }) {

    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const { userData, setUserData } = useAuth();

    const [ isLoading, setIsLoading ] = useState(false);

    // The slider values.
    const [sliderValues, setSliderValues] = useState(userData.pvqAnswers ? [...userData.pvqAnswers.answers] : Array(numQuestions).fill(-1));

    const [currentPage, setCurrentPage] = useState(0);
    const [questionsCompleted, setQuestionsCompleted] = useState(0);
    const [pageCompletion, setPageCompletion] = React.useState(Array(totalPages).fill(false));

    // The PVQ prompts (Slider values and statements) (useRef avoids recreating the statements object each time.).
    const statements = useRef(
        getStatements(usePersonalPronouns ? "P" : userData.gender)
    );

    // A reference to the ScrollView element in which the questions of the current 'page' reside.
    // This is used to have the ScrollView auto-scroll to the top when the page is changed.
    const rfScrollPage = useRef(null); 

    const rfScrollPageButtons = useRef(null);

    // Whether the user can go back.
    const rfCanGoBack = useRef(true);

    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    // When the user opens the PVQ page, automatically go to the page with the earliest unanswered question.
    useEffect(
        () => 
        {
            // The page that the user will be taken to. If they've completed every question, remain on page 1 (index 0).
            let pageNextQuestion = 0;

            for (let i = 0; i < totalPages; ++i)
            {
                let indexFirstQ = i * questionsPerPage;
                let indexLastQ = indexFirstQ + questionsPerPage - 1;

                let foundUnansweredQ = false;

                for (let j = i * questionsPerPage; j <= indexLastQ; ++j)
                {
                    if (sliderValues[j] < 0)
                    {
                        pageNextQuestion = i;
                        foundUnansweredQ = true;
                        break;
                    }
                }

                if (foundUnansweredQ)
                    break;
            }

            setCurrentPage(pageNextQuestion);
        },
        []
    );

    useEffect(
        () =>
        {
            // Set questionsCompleted.
            setQuestionsCompleted(
                sliderValues.filter(
                    (value) => { return value >= 0 }
                ).length
            );

            // Set pageCompletion.
            setPageCompletion(
                (prev) =>
                {
                    let prevCopy = [ ...prev ];

                    for (let i = 0; i < totalPages; ++i)
                    {
                        const minIndexOfPage = questionsPerPage * i;
        
                        let maxIndexOfPage = minIndexOfPage + (questionsPerPage - 1);
                        if (maxIndexOfPage > sliderValues.length - 1) { maxIndexOfPage = sliderValues.length - 1 };
        
                        let isPageComplete = true;
        
                        for (let j = minIndexOfPage; j <= maxIndexOfPage; ++j)
                        {
                            if (sliderValues[j] < 0)
                            {
                                isPageComplete = false;
                                break;
                            }
                        }

                        prevCopy[i] = isPageComplete;
                    }

                    return prevCopy;
                }
            );
        },
        [ sliderValues ]
    );

    // Prevent the user from going back when the page is loading (i.e. when the user's info is being sent).
    useEffect(
        () =>
        {
            const handleRemoveAction = (e) => 
            {
                if (e.data.action.type == "GO_BACK" && !(rfCanGoBack.current))
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

    // Auto-scroll the page buttons as the user moves between pages.
    useEffect(
        () =>
        {
            if (!(rfScrollPageButtons.current))
                return;

            // The desired position of the button.
            const posOfButton = (currentPage - 4) * styles.pageButton.width + (currentPage - 4) * styles.conPageButtons.columnGap;

            rfScrollPageButtons.current.scrollTo({ x: posOfButton, y: 0, animated: false })
        },
        [ currentPage ]
    )

    // Props for the 'save and exit' header button.
    const propsHeaderButtonExit = {
        icon: (size, colour) =>
        {
            return (
                <MaterialCommunityIcons 
                    name = "content-save" color = { colour }  
                    size = { size } 
                />
            )
        },
        onPress: (navigation, setPropsPopUp) =>
        {
            setPropsPopUp({
                title: 'Save & Exit',
                message: "If you exit, your answers will be saved and you can continue with the quiz at your leisure.",
                buttons: [
                    { text: "Save & Exit", onPress: async () => { await updateDatabase(); navigation.goBack(); } },
                    { text: "Cancel" }
                ]
            });
        }
    };

    // The object that defines the pop-up that comes up when the user presses the 'finish' button without having 
    // completed every question.
    const popupFinishButton = {
        title: "Quiz Not Finished",
        message: "You haven't finished every question. Would you like to save and exit or continue?",
        buttons: [
            { text: "Save & Exit", onPress: async () => { await updateDatabase(); navigation.goBack(); } },
            { text: "Continue" }
        ]
    };

    const progress = (questionsCompleted / statements.current.length) * 100; 
  
    const handleSliderValueChange = (index, value) => {
        if (value[0] < 0)
            return;

        setSliderValues((prevValues) => {
            const newValues = [...prevValues];

            //check if the value was 0 before changing
            if (newValues[index] === 0) {
                //completed a question
                if (questionsCompleted < statements.current.length) {
                    setQuestionsCompleted((prevCompleted) => prevCompleted + 1);
                } else {
                    console.log("ERROR: total questions is " + statements.current.length.toString() + ", but user has somehow answered more, something is wrong.")
                }
                setPageCompletion((prevCompletion) => {
                const newCompletion = [...prevCompletion];
                    if (newCompletion[currentPage] + 1 <= questionsPerPage) {
                        newCompletion[currentPage] += 1;
                    } else {
                        console.log("ERROR: questions per page is " + questionsPerPage.toString() + ", but user has somehow answered more, something is wrong.");
                    }
                    return newCompletion;
                });
                
            }
            
            newValues[index] = value[0]; 
            return newValues;
        });
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    const goToNextPage = async () => {
        //alert("id is " + userId + " - user is " + JSON.stringify(user));
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            scrollToTop();
        } else { // This is the last page and the user has pressed finish. 

            if (questionsCompleted != statements.current.length)
            {
                setPropsPopUpMsg(popupFinishButton);
                return;
            }

            await updateDatabase();

            // Not 'navigate("matches")' as we might not always want to go to the matches page. e.g. if the user access
            // the PVQ page from the settings it would make more sense to simply go back to the settings.
            navigation.goBack()
        }
    };

    const updateDatabase = async () => 
    {
        setIsLoading(true);

        // Prevent user from swiping back while loading.
        rfCanGoBack.current = false;

        let results = undefined;

        if (questionsCompleted == statements.current.length)
        {
            results = JSON.parse(JSON.stringify(values));

            // An intermediate results object.
            const resultsIntermediate = JSON.parse(JSON.stringify(values));
            for (let value of Object.keys(resultsIntermediate))
            {
                resultsIntermediate[value] = { sumScores: 0, numQuestions: 0 };
            }
            console.log(resultsIntermediate);

            // Set resultsIntermediate.
            for (let i = 0; i < sliderValues.length; ++i)
            {
                let valueText = valuesArray[statements.current[i].value];
                resultsIntermediate[valueText].sumScores += sliderValues[i];
                resultsIntermediate[valueText].numQuestions += 1;
            }
            console.log(resultsIntermediate);

            // Set results.
            for (let value of Object.keys(results))
            {
                results[value] = resultsIntermediate[value].sumScores / resultsIntermediate[value].numQuestions;
            }
        }
        console.log(results);

        // The object defining thd data to store in the user's database object.
        const pvqAnswers = { answers: sliderValues, results: results };

        const fetchResponse = await ApiRequestor.putPVQAnswersIntoDatabase(userData._id, pvqAnswers);

        if (fetchResponse && fetchResponse.status == 200)
        {
            console.log("Success");
            setUserData(
                (prev) => 
                {
                    return { 
                        ...prev, pvqAnswers: pvqAnswers, pvqPNG: fetchResponse.data.pvqPNG,
                        pvqOutlinePNG: fetchResponse.data.pvqOutlinePNG 
                    };
                }
            );
        }

        // Allow the user to go back again now that loading is finished.
        rfCanGoBack.current = true;

        setIsLoading(false);
    };

    const handlePageSelection = (pageIndex) => {
        setCurrentPage(pageIndex);
        scrollToTop();
    };  
    const renderPageButtons = () => {

        const pageButtons = [];
    
        for (let i = 0; i < totalPages; i++) { 
            const isActive = i === currentPage;
            const isComplete = pageCompletion[i];

            let styleDynamic; 
            let styleTextDynamic = undefined;

            if (isActive)
            {
                styleDynamic = { borderWidth: 1 }
                if (isComplete)
                {
                    tickIcon = "✓"
                }
            }
            else
            {
                if (isComplete) // If this page is incomplete.
                {
                    styleDynamic = { backgroundColor: "#e396e0" }
                    styleTextDynamic = { color: "#000000" }
                    tickIcon = "✓"
                }
                else
                {
                    styleDynamic = { backgroundColor: theme.buttonStandardInactive }
                    styleTextDynamic = { color: theme.fontButtonInactive }
                }
            }

            let buttonStyle = [styles.pageButton, styles.incomplete];
            if (isComplete) // Page is complete
            {
                if (isActive) {
                    buttonStyle = [styles.pageButton, styles.completeActive]
                } else {
                    buttonStyle = [styles.pageButton, styles.complete]
                }
            }
            else // This page is incomplete
            {
                if (isActive) {
                    buttonStyle = [styles.pageButton, styles.incompleteActive]
                } else {
                    buttonStyle = [styles.pageButton, styles.incomplete]
                }
            }
            //const buttonStyle = isActive ? styles.activePageButton : styles.pageButton;
            
            pageButtons.push( 
                <ButtonStandard
                    text={(i + 1).toString()}
                    key={i}
                    style={{ ...styles.pageButton, ...styleDynamic }}
                    styleText = { styleTextDynamic }
                    sizeText = {1}
                    isBold 
                    onPress={() => {  
                        handlePageSelection(i)
                    }}
                />  
            );
        }
    
        return pageButtons;
    };

    // Scrolls the page to the top.
    const scrollToTop = () =>
    {
        rfScrollPage.current.scrollTo({ x: 0, y: 0, animated: false }); // Scroll to top.
    };

    return (  
        <PageContainer
            navigation={navigation}
            propsLeftHeaderButtons={[propsHeaderButtonExit]}
            propsRightHeaderButtons = {[]}
            style = {{ paddingHorizontal: 0, paddingVertical: 0 }}
            showNavBar = { false } 
            propsPopUpMsg = { propsPopUpMsg }
            isLoading = { isLoading } isLoadingScreenTransparent = { true }
        > 
            {/* PROGRESS BAR */}
            <View style = {{ ...styles.conProgress, backgroundColor: "transparent", borderBottomColor: theme.borders }}>
                <View style = {{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                }}> 
                </View>
                <ScrollView 
                    horizontal
                    contentContainerStyle = { 
                        styles.conPageButtons
                    }
                    ref = { rfScrollPageButtons }
                >
                    {renderPageButtons()}
                </ScrollView>
                <TextStandard 
                    style={styles.overallProgress} size = {-1} text={Math.ceil(progress) + '% complete'}
                    italicise isBold
                /> 
            </View>

            {/* WHO IS LOGGED IN (DEBUG) */}
            {/* {validatedUser && (
                <View style={{ ...styles.conProgress, backgroundColor: theme.header, borderBottomColor: theme.borders }}>
                    <TextStandard 
                        style={styles.overallProgress} size={-1} 
                        text={'Logged in user: ' + validatedUser.name}
                        italicise
                    /> 
                </View>
            )} */}

            {/* The statements to answer on this page */}
            <ScrollView
                vertical = { true }
                style = {{ height: 1 }}
                contentContainerStyle = { styles.conStatements }
                ref = { rfScrollPage }
            >
                {
                    statements.current.slice(
                        currentPage * questionsPerPage, 
                        (currentPage + 1) * questionsPerPage).map((statement, index) => {

                            const indexOfValue = index + currentPage * questionsPerPage;

                            let value = sliderValues[indexOfValue];

                            return (
                                <View key={index}>
                                    <LinearGradient
                                        style={{...styles.conStatement, borderColor: value < 0 ? 'red' : theme.borders}}
                                        colors={
                                            [theme.decorative1,   theme.decorative2]
                                        }
                                        start={{ x: 0, y: 0.5 }}
                                        end={{ x: 1, y: 0.5 }}
                                    >
                                        <View
                                        key={index} 
                                        style = {{  backgroundColor: 'transparent', borderColor: 'transparent' }}>
                                        <TextStandard
                                            text={statement.prompt} // the question being asked!
                                            size={0}
                                            isBold={true}
                                            style={ styles.lblStatement }
                                        />

                                        

                                            <View style={{ flex: 1, justifyContent: "center", marginLeft: 20, 
                                                        marginRight: 20 }}>
                                                <Slider
                                                    //style={{ marginLeft: 10, marginRight: 10 }}
                                                    minimumValue={0}
                                                    maximumValue={5} 
                                                    step={1}
                                                    minimumTrackTintColor = {theme.borders}
                                                    maximumTrackTintColor = {theme.sliders.trackInactive}
                                                    thumbStyle = {{ 
                                                        backgroundColor: theme.borders, 
                                                        width: 25, 
                                                        height: 25, 
                                                        borderRadius: 12.5,
                                                    }}
                                                    renderTrackMarkComponent = {
                                                        () => { return (<View height = {12} width = {2} style = {{ backgroundColor: theme.borders, left: 10}}></View>) }
                                                    }
                                                    trackMarks = {[1,2,3,4].filter((num) => num != value)}
                                                    value = { value < 0 ? 0 : value }
                                                    onValueChange={(value) => handleSliderValueChange(indexOfValue, value)}
                                                /> 
                                            </View>

                                            <TextStandard 
                                            text = {value < 0 ? answerDefault : answers[value]} 
                                            size = {1}
                                            style={ styles.lblAnswer } 
                                            italicise
                                            />
                                        </View> 
                                    </LinearGradient>

                                 
                                </View>
                            )
                        }
                    )
                }
            </ScrollView>

            <View style={{ ...styles.buttonContainer, backgroundColor: "transparent", borderColor: theme.borders }}>
                 
                <LinearGradient
                        colors={['transparent', 'transparent'  ]}
                        style={{
                            ...styles.linearGradientButton, 
                            marginBottom: globalProps.spacingVertBase/2,
                        }}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }} 
                    >  
                <ButtonStandard
                        text = {currentPage === 0 ? "" : "BACK"}
                        style = {{ ...styles.button, 
                            backgroundColor: currentPage === 0 ? 'transparent' : theme.buttonLessVibrant, 
                            borderWidth: currentPage === 0 ? 0 : 1 ,
                            width: "100%" }}
                        isBold 
                        inactive={currentPage === 0}
                        onPress={goToPreviousPage}
                    />
                </LinearGradient> 
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
                        text = { currentPage === totalPages - 1 ? "FINISH" : "NEXT PAGE" }
                        style = {{ ...styles.button, backgroundColor: 'transparent', borderWidth: 1 }}
                        isBold 
                        onPress={goToNextPage}
                    />
                </LinearGradient>
            </View>
            
        </PageContainer> 
    );
}

PvqPage.propTypes = {
    navigation: PropTypes.object.isRequired,
    usePersonalPronouns: PropTypes.bool,
};

PvqPage.defaultProps = {
    usePersonalPronouns: true
};


const styles = StyleSheet.create(
    {
        overallProgress: {
            justifyContent: 'flex-end'
        },

        conProgress:
        {
            borderBottomWidth: 1,
            padding: utilsGlobalStyles.spacingVertN(-2),
        },
        conPageButtons:
        {
            flexDirection: 'row',
            columnGap: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: utilsGlobalStyles.spacingVertN(-3)
        },

        //bottom buttons
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: utilsGlobalStyles.spacingVertN(-2),
            borderTopWidth: 2,
            
        },
        button: {
            //flex: 1,
            //marginHorizontal: 10,
            width: "100%",
            padding: 10,
            alignContent: "center",
            borderRadius: 100,  
            backgroundColor: 'transparent'
        },
        linearGradientButton:
        {
            width: "40%", 
            //alignContent: "center",
            borderRadius: 100,  
        }, 

        // Container for the statements of the current page.
        conStatements:
        {
            // height: 1,
            flexGrow: 1,
            paddingVertical: utilsGlobalStyles.spacingVertN(-1),
            rowGap: utilsGlobalStyles.spacingVertN()
        },

        // Container for each statement.
        conStatement:
        {
            borderRadius: globalProps.borderRadiusStandard,
            borderWidth: 1,
            marginHorizontal: utilsGlobalStyles.spacingVertN(-1),
            padding: 10
        },

        lblStatement:
        {
            textAlign: "center"//, marginBottom: utilsGlobalStyles.spacingVertN(-2)
        },
        lblAnswer:
        {
            textAlign: "center"//, marginBottom: utilsGlobalStyles.spacingVertN(-2)
        },

        //page selector
        pageButtonsContainer: {
            flexDirection: 'row',
        }, 
        pageButtonText: {
            color: '#fff',
            fontSize: 16,
        }, 
        pageButton: {
            height: 38,
            width: 38,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
        },
        incomplete: {
            backgroundColor: '#ccc',
        },
        complete: {
            backgroundColor: '#0f0',
        },
        active: {
            backgroundColor: '#00f',
        },
        incompleteActive: {
            backgroundColor: '#f00',
        },
        completeActive: {
            backgroundColor: '#ff0',
        },

    }
);

// The values.
const values = {
    selfDirection: 0,
    stimulation: 1,
    hedonism: 2,
    achievement: 3,
    power: 4,
    security: 5,
    confirmity: 6,
    tradition: 7,
    benevolence: 8,
    universalism: 9,
};

const valuesArray = [
    "selfDirection",
    "stimulation",
    "hedonism",
    "achievement",
    "power",
    "security",
    "confirmity",
    "tradition",
    "benevolence",
    "universalism",
];

function getStatements(pronounId)
{
    const pronounsSubjective = 
    { M: "he", F: "she", P: "I" };

    const pronounsPossessive = 
    { M: "his", F: "her", P: "my" };

    const pronounsObjective = 
    { M: "him", F: "her", P: "me" };

    const pronounsReflexive = 
    { M: "himself", F: "herself", P: "myself" };

    const isPersonal = pronounId == "P";

    return [
        { prompt: `It is important to ${pronounsObjective[pronounId]} to form ${pronounsPossessive[pronounId]} views independently.`, value: values.selfDirection }, // 1
        { prompt: `It is important to ${pronounsObjective[pronounId]} that ${pronounsPossessive[pronounId]} country is secure and stable.`, value: values.security }, // 2
        { prompt: `It is important to ${pronounsObjective[pronounId]} to have a good time.`, value: values.hedonism }, // 3
        { prompt: `It is important to ${pronounsObjective[pronounId]} to avoid upsetting other people.`, value: values.confirmity }, // 4 
        { prompt: `It is important to ${pronounsObjective[pronounId]} that the weak and vulnerable in society be protected.`, value: values.universalism }, // 5
        { prompt: `It is important to ${pronounsObjective[pronounId]} that people do what ${pronounsSubjective[pronounId]} ${isPersonal ? "say" : "says"} they should.`, value: values.power }, // 6
        { prompt: `It is important to ${pronounsObjective[pronounId]} never to think ${pronounsSubjective[pronounId]} ${isPersonal ? "deserve" : "deserves"} more than other people.`, value: values.power }, // 7
        { prompt: `It is important to ${pronounsObjective[pronounId]} to care for nature.`, value: values.universalism }, // 8
        { prompt: `It is important to ${pronounsObjective[pronounId]} that no one should ever shame ${pronounsObjective[pronounId]}.`, value: values.power }, // 9
        { prompt: `It is important to ${pronounsObjective[pronounId]} always to look for different things to do.`, value: values.stimulation }, // 10
        { prompt: `It is important to ${pronounsObjective[pronounId]} to take care of people ${pronounsSubjective[pronounId]} ${isPersonal ? "am" : "is"} close to.`, value: values.benevolence }, // 11
        { prompt: `It is important to ${pronounsObjective[pronounId]} to have the power that money can bring.`, value: values.power }, // 12
        { prompt: `It is very important to ${pronounsObjective[pronounId]} to avoid disease and protect ${pronounsPossessive[pronounId]} health.`, value: values.security }, // 13
        { prompt: `It is important to ${pronounsObjective[pronounId]} to be tolerant toward all kinds of people and groups.`, value: values.universalism }, // 14
        { prompt: `It is important to ${pronounsObjective[pronounId]} never to violate rules or regulations.`, value: values.confirmity }, // 15
        { prompt: `It is important to ${pronounsObjective[pronounId]} to make ${pronounsPossessive[pronounId]} own decisions about ${pronounsPossessive[pronounId]} life.`, value: values.selfDirection }, // 16
        { prompt: `It is important to ${pronounsObjective[pronounId]} to have ambitions in life.`, value: values.achievement }, // 17
        { prompt: `It is important to ${pronounsObjective[pronounId]} to maintain traditional values and ways of thinking.`, value: values.tradition }, // 18
        { prompt: `It is important to ${pronounsObjective[pronounId]} that people ${pronounsSubjective[pronounId]} know have full confidence in ${pronounsObjective[pronounId]}.`, value: values.benevolence }, // 19
        { prompt: `It is important to ${pronounsObjective[pronounId]} to be wealthy.`, value: values.power }, // 20
        { prompt: `It is important to ${pronounsObjective[pronounId]} to take part in activities to defend nature.`, value: values.universalism }, // 21
        { prompt: `It is important to ${pronounsObjective[pronounId]} never to annoy anyone.`, value: values.confirmity }, // 22
        { prompt: `It is important to ${pronounsObjective[pronounId]} to develop ${pronounsPossessive[pronounId]} own opinions.`, value: values.selfDirection }, // 23
        { prompt: `It is important to ${pronounsObjective[pronounId]} to protect ${pronounsPossessive[pronounId]} public image.`, value: values.power }, // 24
        { prompt: `It is very important to ${pronounsObjective[pronounId]} to help the people dear to ${pronounsObjective[pronounId]}.`, value: values.benevolence }, // 25
        { prompt: `It is important to ${pronounsObjective[pronounId]} to be personally safe and secure.`, value: values.security }, // 26
        { prompt: `It is important to ${pronounsObjective[pronounId]} to be a dependable and trustworthy friend.`, value: values.benevolence }, // 27
        { prompt: `It is important to ${pronounsObjective[pronounId]} to take risks that make life exciting.`, value: values.stimulation }, // 28
        { prompt: `It is important to ${pronounsObjective[pronounId]} to have the power to make people do what ${pronounsSubjective[pronounId]} ${isPersonal ? "want" : "wants"}.`, value: values.power }, // 29
        { prompt: `It is important to ${pronounsObjective[pronounId]} to plan ${pronounsPossessive[pronounId]} activities independently.`, value: values.selfDirection }, // 30
        { prompt: `It is important to ${pronounsObjective[pronounId]} to follow rules even when no one is watching.`, value: values.confirmity }, // 31
        { prompt: `It is important to ${pronounsObjective[pronounId]} to be very successful.`, value: values.achievement }, // 32
        { prompt: `It is important to ${pronounsObjective[pronounId]} to follow ${pronounsPossessive[pronounId]} family's customs or the customs of a religion.`, value: values.tradition }, // 33
        { prompt: `It is important to ${pronounsObjective[pronounId]} to listen to and understand people who are different from ${pronounsObjective[pronounId]}.`, value: values.universalism }, // 34
        { prompt: `It is important to ${pronounsObjective[pronounId]} to have a strong state that can defend its citizens.`, value: values.security }, // 35
        { prompt: `It is important to ${pronounsObjective[pronounId]} to enjoy life's pleasures.`, value: values.hedonism }, // 36
        { prompt: `It is important to ${pronounsObjective[pronounId]} that every person in the world have equal opportunities in life.`, value: values.universalism }, // 37,
        { prompt: `It is important to ${pronounsObjective[pronounId]} to be humble.`, value: values.tradition }, // 38,
        { prompt: `It is important to ${pronounsObjective[pronounId]} to figure things out ${pronounsReflexive[pronounId]}.`, value: values.selfDirection }, // 39,
        { prompt: `It is important to ${pronounsObjective[pronounId]} to honor the traditional practices of ${pronounsPossessive[pronounId]} culture.`, value: values.tradition }, // 40,
        { prompt: `It is important to ${pronounsObjective[pronounId]} to be the one who tells others what to do.`, value: values.power }, // 41
        { prompt: `It is important to ${pronounsObjective[pronounId]} to obey all the laws.`, value: values.confirmity }, // 42
        { prompt: `It is important to ${pronounsObjective[pronounId]} to have all sorts of new experiences.`, value: values.stimulation }, // 43
        { prompt: `It is important to ${pronounsObjective[pronounId]} to own expensive things that show ${pronounsPossessive[pronounId]} wealth.`, value: values.power }, // 44
        { prompt: `It is important to ${pronounsObjective[pronounId]} to protect the natural environment from destruction or pollution.`, value: values.universalism }, // 45
        { prompt: `It is important to ${pronounsObjective[pronounId]} to take advantage of every opportunity to have fun.`, value: values.hedonism }, // 46
        { prompt: `It is important to ${pronounsObjective[pronounId]} to concern ${pronounsReflexive[pronounId]} with every need of ${pronounsPossessive[pronounId]} dear ones.`, value: values.benevolence }, // 47
        { prompt: `It is important to ${pronounsObjective[pronounId]} that people recognize what ${pronounsSubjective[pronounId]} ${isPersonal ? "achieve" : "achieves"}.`, value: values.achievement }, // 48
        { prompt: `It is important to ${pronounsObjective[pronounId]} never to be humiliated.`, value: values.power }, // 49
        { prompt: `It is important to ${pronounsObjective[pronounId]} that ${pronounsPossessive[pronounId]} country protect itself against all threats.`, value: values.security }, // 50
        { prompt: `It is important to ${pronounsObjective[pronounId]} never to make other people angry.`, value: values.confirmity }, // 51
        { prompt: `It is important to ${pronounsObjective[pronounId]} that everyone be treated justly, even people ${pronounsSubjective[pronounId]} ${isPersonal ? "don't" : "doesn't"} know.`, value: values.universalism }, // 52
        { prompt: `It is important to ${pronounsObjective[pronounId]} to avoid anything dangerous.`, value: values.security }, // 53
        { prompt: `It is important to ${pronounsObjective[pronounId]} to be satisfied with what ${pronounsSubjective[pronounId]} ${isPersonal ? "have" : "has"} and not ask for more.`, value: values.tradition }, // 54
        { prompt: `It is important to ${pronounsObjective[pronounId]} that all ${pronounsPossessive[pronounId]} friends and family can rely on ${pronounsObjective[pronounId]} completely.`, value: values.benevolence }, // 55
        { prompt: `It is important to ${pronounsObjective[pronounId]} to be free to choose what ${pronounsSubjective[pronounId]} ${isPersonal ? "do" : "does"} by ${pronounsReflexive[pronounId]}.`, value: values.selfDirection }, // 56
        { prompt: `It is important to ${pronounsObjective[pronounId]} to accept people even when ${pronounsSubjective[pronounId]} ${isPersonal ? "disagree" : "disagrees"} with them.`, value: values.universalism }, // 57
    ];
}

const numQuestions = 57;
const questionsPerPage = 4;
const totalPages = Math.ceil(numQuestions / questionsPerPage); 

// The default 'answer': i.e. what is displayed when the user hasn't answered a question before.
const answerDefault = "Please select an answer";

// The answers that correspond to each of the slider values.
const answers = [
    'Not like me at all',
    'Not like me',
    'A little like me',
    'Moderately like me',
    'Like me',
    'Very much like me' 
];

export default PvqPage;