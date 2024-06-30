import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/*
* These are the button components available to be placed in the Header component.
*/
const propsHeaderButtons = 
{
    back:
    {
        icon: (size, colour) =>
        {
            return (
                <Ionicons 
                    name = "chevron-back-sharp" color = { colour } 
                    size = { size } 
                />
            )
        },
        onPress: (navigation) =>
        {
            navigation.goBack();
        }
    },

    account:
    {
        icon: (size, colour) =>
        {
            return (
                <MaterialCommunityIcons 
                    name = "account-circle-outline" color = { colour } 
                    size = { size } 
                />
            )
        },
        onPress: (navigation) =>
        {
            navigation.navigate("account");
        }
    },

    settings:
    {
        icon: (size, colour) =>
        {
            return (
                // <Ionicons 
                //     name = "settings" color = { colour } 
                //     size = { size } 
                // />
                <MaterialCommunityIcons 
                    name = "cog-outline" color = { colour } 
                    size = { size } 
                />
            )
        },
        onPress: (navigation) =>
        {
            navigation.navigate("settings");
        }
    },

    settingsLoggedOut:
    {
        icon: (size, colour) =>
        {
            return (
                <MaterialCommunityIcons 
                    name = "cog-outline" color = { colour } 
                    size = { size } 
                />
            )
        },
        onPress: (navigation) =>
        {
            navigation.navigate("settingsLoggedOut");
        }
    },

};

export default propsHeaderButtons;