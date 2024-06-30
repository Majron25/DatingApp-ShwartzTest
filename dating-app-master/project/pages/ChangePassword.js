import React, { useState } from "react";
import { View, StyleSheet, Alert, Modal, Pressable, Text } from "react-native";
import PropTypes from 'prop-types';
import { useContext } from "react";

import propsHeaderButtons from '../components/props_header_buttons.js';
import ThemeContext from "../contexts/ThemeContext.js";
import globalProps, { globalThemes, utilsGlobalStyles, globalStyles } from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import TextInputStandard from '../components/TextInputStandard.js';
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import ApiRequestor from "../ApiRequestor.js";
import { useAuth } from "../AuthContext.js";

/*
* The page on which the user can change their password.

* Props:
    > navigation: the global navigation object.
*/

const minLengthPassword = 8;

function ChangePassword({ navigation })
{
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];

    // Props for a pop-up message.
    const [ propsPopUpMsg, setPropsPopUpMsg ] = useState(undefined);

    const [ oldPassword, setOldPassword ] = useState("");
    const [ newPassword, setNewPassword ] = useState("");
    const [ confirmNewPassword, setConfirmNewPassword ] = useState("");

    const { userData } = useAuth();

    // Allows the setting of popup title and message per inclusion, insteading of requiring setting everything
    // each time the popup is used. Provides a cleaner, more readable implementation of the popup.
    const handlePopupMessage = (title, message) => {
        setPropsPopUpMsg({
          title,
          message,
          buttons: [{ text: "OK" }],
        });
      };

    // A number of if statements to check on status of the text fields.
    const handleContinue = async () => {
        if (oldPassword === "") {
          handlePopupMessage("Invalid Details!", "Please enter your old password!");
          return;
        }
      
        if (!isPasswordValid(newPassword)) {
          handlePopupMessage(
            "Invalid Details!",
            "Password is not long enough! (Must be longer than 8 characters)"
          );
          return;
        }
      
        if (oldPassword === newPassword) {
          handlePopupMessage(
            "Invalid Details!",
            "Old password and new password are the same!"
          );
          return;
        }
      
        if (newPassword !== confirmNewPassword) {
          handlePopupMessage(
            "Invalid Details!",
            "New password entries don't match!"
          );
          return;
        }

        const userId = userData._id;
        const fetchResponse = await ApiRequestor.updatePassword(
            userId,
            oldPassword,
            newPassword
        );
        const status = fetchResponse.data.status;

        if (status === 200) {
            setPropsPopUpMsg(
                {
                    title: "Password changed!",
                    message: "Your password was successfully changed!",
                    buttons: [
                        { text: "Return to profile",
                            onPress: () => {navigation.navigate('account')} }
                    ]
                }
            );
        } else if (status === 401) {
            handlePopupMessage("Incorrect password!", "Please enter your old password correctly!");
          } else {
            return undefined;
          }
        };
    
    return (
        <PageContainer
            navigation = { navigation } 
            propsLeftHeaderButtons = { [ propsHeaderButtons.back ] }
            propsPopUpMsg = { propsPopUpMsg }
        > 
            <View style = {{ marginTop: utilsGlobalStyles.spacingVertN(1) }}>
                <TextStandard
                    text = "Change your password below."
                    style = {{
                        textAlign: "center", marginBottom: globalProps.spacingVertBase
                    }}
                />

                <TextInputStandard 
                    text = { oldPassword }
                    size = { 1 }
                    placeholder = "Enter current password"
                    onChangeText = { (text) => setOldPassword(text) }
                    style = { { ...globalStyles.textboxSingleLine, backgroundColor: theme.header } }
                    secureTextEntry
                />
            </View>

            <View style = {{ marginTop: utilsGlobalStyles.spacingVertN(1) }}>
                
                <TextStandard
                    text = "Please enter a new password."
                    style = {{
                        textAlign: "center", marginBottom: globalProps.spacingVertBase
                    }}
                />

                <TextInputStandard 
                    text = { newPassword }
                    size = { 1 }
                    placeholder = "New Password"
                    onChangeText = { (text) => setNewPassword(text) }
                    style = { { ...globalStyles.textboxSingleLine, backgroundColor: theme.header } }
                    secureTextEntry
                />

                <TextInputStandard 
                    text = { confirmNewPassword }
                    size = { 1 }
                    placeholder = "Confirm New Password"
                    onChangeText = { (text) => setConfirmNewPassword(text) }
                    style = {{ 
                        ...globalStyles.textboxSingleLine, backgroundColor: theme.header, 
                        marginTop: utilsGlobalStyles.spacingVertN() 
                    }}
                    secureTextEntry
                />

            </View>

            <View>
                <ButtonStandard 
                    text = "CONTINUE" 
                    sizeText = { 1 }
                    isBold
                    onPress = { handleContinue } 
                    style = {{ 
                        ...styles.btnContinue
                    }}
                    inactive = { confirmNewPassword == "" }
                />
            </View>
        </PageContainer>
    );
}


ChangePassword.propTypes =
{
    navigation: PropTypes.object.isRequired,
};

ChangePassword.defaultProps =
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
          button: 
          {
            borderRadius: 20,
            padding: 12,
            elevation: 2,
            margin: 5
          },
          btnContinue:
          {
            width: "100%",
            padding: 10,
            borderRadius: globalProps.borderRadiusStandard,
            marginTop: utilsGlobalStyles.spacingVertN()
          },
          button: {
            borderRadius: 20,
            padding: 10,
            elevation: 2,
          },
          buttonOpen: {
            backgroundColor: '#F194FF',
          },
          buttonClose: {
            backgroundColor: '#2196F3',
          },
          textStyle: {
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
          },
    }
);

export default ChangePassword;

/*
* A utility function that determines if a user's password is 'valid', meaning that it accords with our rules: e.g. is 
  higher than the minimum length.
*/
function isPasswordValid(password)
{
    return (password.length >= minLengthPassword)
}