import React, { useState } from "react";
import { View, StyleSheet, Alert, Modal, Pressable, Text } from "react-native";
import PropTypes from 'prop-types';
import { useContext } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import propsHeaderButtons from '../components/props_header_buttons.js';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import TextInputStandard from '../components/TextInputStandard.js';
import ButtonStandard from "../components/ButtonStandard.js";
import ButtonNextPage from "../components/ButtonNextPage.js";
import PageContainer from "../components/PageContainer.js";
import Container from "../components/Container.js";
import ApiRequestor from "../ApiRequestor.js";
import { useAuth } from '../AuthContext';

/*
* The page on which the user can choose to delete their profile.

* Props:
    > navigation: the global navigation object.
*/
function DeleteAccount({ navigation })
{
    const { themeName, updateTheme } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    const [ text, setText ] = useState('');
    const [ modalVisible, setModalVisible ] = useState(false);
    const [ deleteSuccess, setDeleteSuccess ] = useState(true);

    const { userData } = useAuth();

    // Executes if the user presses the delete button in the modal.
    const continueDelete = async () => 
    {
        // Checks to see if entered text is "DELETE"
        let deleteText = text;

        // If entered text matches, the modal closes, the account is deleted and the user is redirected to the landing page.
        if (deleteText == "DELETE") {
            setModalVisible(!modalVisible);
            await ApiRequestor.DeleteAccount(userData._id);
            
            console.log("User has been deleted.");

            // TODO: The redirection is very awkward. Some sort of feedback about successful deletion would be handy.
            // Maybe a page listing the account was deleted, and a link to create another account??
            navigation.navigate("landing");
            
        }
        else {
            console.log("You did not enter 'DELETE'.");
            setModalVisible(true);
            setDeleteSuccess(false);
        }
    }
    
    // Executes when the user presses the cancel button in the modal.
    const cancelDelete = () => 
    {
        setModalVisible(false);
        setText("");
        setDeleteSuccess(true);
    }

    return (
        <PageContainer
            navigation = { navigation } 
            propsLeftHeaderButtons = { [ propsHeaderButtons.back ] }
        > 
            {/* Modal will only pop up if the corresponding button is pressed. */}
            <Modal 
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>If you wish to delete your account, enter "DELETE" below:</Text>
                        <TextInputStandard
                            text = { text } textAlignment = "center"
                            placeholder = "..."
                            // maxLength = { 20 }
                            onChangeText = { (newText) => setText(newText) }
                            multiline
                            maxHeight = { 100 }
                            // numLines =  { 6 }
                            style = { styles.textInputStyle }
                        />
                        {!deleteSuccess && <Text style={styles.deleteUnsuccessful}>You did not enter "DELETE"</Text>}
                        <Pressable 
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => { continueDelete() }}>
                            <Text style={styles.textStyle}>Delete Account</Text>
                        </Pressable>
                        {/* This button will both close the modal and set the text back to clear, to avoid accidental account deletion */}
                        <Pressable 
                            style={[styles.button, styles.buttonCancel]}
                            onPress={() => { cancelDelete() }}>
                            <Text style={styles.textStyle}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <TextStandard
                text = "Thinking of deleting your account?"
                style = {{
                    textAlign: "center", marginBottom: globalProps.spacingVertBase
                }}
            />

            <ButtonNextPage 
                text = "Delete Account" 
                sizeText = { 1 } isBold
                icon = { 
                    <MaterialCommunityIcons 
                        name = "delete-outline" color = { theme.fontButton } 
                        size = { globalProps.sizeIconHeaderFooter } 
                    /> 
                }
                onPress = { () => setModalVisible(true) }
                style = {{ marginBottom: utilsGlobalStyles.spacingVertN() }}
            />

        </PageContainer>
    );
}


DeleteAccount.propTypes =
{
    navigation: PropTypes.object.isRequired,
};

DeleteAccount.defaultProps =
{
};

const styles = StyleSheet.create(
    {
        title:
        {
            marginBottom: utilsGlobalStyles.spacingVertN(-2)
        },
        description:
        {
            marginTop: utilsGlobalStyles.spacingVertN(-4)
        },
        centeredView: 
        {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 22,
        },
        modalView: 
        {
            margin: 20,
            backgroundColor: 'black',
            borderRadius: 20,
            padding: 35,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          },
          button: 
          {
            borderRadius: 20,
            padding: 12,
            elevation: 2,
            margin: 5
          },
          buttonOpen: 
          {
            backgroundColor: '#F194FF',
          },
          buttonClose: 
          {
            backgroundColor: 'red',
          },
          buttonCancel:
          {
            backgroundColor: '#14bceb',
          },
          textStyle: 
          {
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
          },
          modalText: 
          {
            color: "white",
            marginBottom: 15,
            textAlign: 'center',
          },
          textInputStyle:
          {
            margin: 10
          },
          deleteUnsuccessful: 
          {
            color: 'red',
          }
          
    }
);

export default DeleteAccount;