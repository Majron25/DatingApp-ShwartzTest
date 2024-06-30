
import { View, ScrollView, StyleSheet } from "react-native";

import propsHeaderButtons from '../components/props_header_buttons.js';
import globalProps from '../styles_global.js';
import TextStandard from "../components/TextStandard.js";
import ButtonStandard from "../components/ButtonStandard.js";
import PageContainer from "../components/PageContainer.js";
import Header from '../components/Header.js'; 

/*
* The 'advanced' account page. This page displays additional information and options to the user regarding their 
  account. This may not be necessary, but if there's too much stuff on the Account page, it's here if need be.

* Props:
    > navigation: the navigation object.
*/
function AccountAdvanced({ navigation })
{
    return (
        <PageContainer
            navigation = { navigation } 
            propsLeftHeaderButtons = { [ propsHeaderButtons.back ] }
            // style = {{ justifyContent: "center", alignItems: "center" }}
        > 
            <TextStandard 
                text = "This page shows 'advanced' account settings (just an example, might not be necessary)" 
                style = {{ 
                    textAlign: "center", marginBottom: globalProps.spacingVertBase 
                }}
            />

            <ButtonStandard 
                text = "Back" 
                onPress = { () => navigation.goBack() } 
                style = {{ 
                    marginBottom: globalProps.spacingVertBase,
                    width: 80,
                    padding: 10,
                    borderRadius: globalProps.fontSizeBase / 2,
                    alignSelf: "center"

                }}
            />

            {
                Array.from({ length: 50 }, (el, index) => index).map(
                    (num) =>
                    {
                        return (
                            <TextStandard key = {num} text = { `${num}` }/>
                        )
                    }
                )
            } 
        </PageContainer>
    );
}

const styles = StyleSheet.create(
    {
        container: 
        {
            // alignItems: "center",
            backgroundColor: globalProps.colourContent, 
            paddingVertical: globalProps.spacingVertBase,
            paddingHorizontal: 10
        }
    }
);

export default AccountAdvanced;