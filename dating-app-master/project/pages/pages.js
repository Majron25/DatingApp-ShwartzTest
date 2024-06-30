import Account from "./Account";
import AccountAdvanced from "./AccountAdvanced";

import UserProfile from "./UserProfile";

import Landing from "./Landing";

import Login from "./Login";

import CreateAccountEmail from "./CreateAccount/CreateAccountEmail";
import CreateAccountVerifyEmail from "./CreateAccount/CreateAccountVerifyEmail";
import CreateAccountPassword from "./CreateAccount/CreateAccountPassword";
import CreateAccountName from "./CreateAccount/CreateAccountName";
import CreateAccountDOB from "./CreateAccount/CreateAccountDOB";
import CreateAccountGender from "./CreateAccount/CreateAccountGender";
import CreateAccountReligion from "./CreateAccount/CreateAccountReligion";
import CreateAccountChildren from "./CreateAccount/CreateAccountChildren";
import CreateAccountHeight from "./CreateAccount/CreateAccountHeight";
import CreateAccountDescription from "./CreateAccount/CreateAccountDescription";
import CreateAccountImages from "./CreateAccount/CreateAccountImages";
import CreateAccountQuizIntro from "./CreateAccount/CreateAccountQuizIntro";
import CreateAccountCompleted from "./CreateAccount/CreateAccountCompleted";

import Matches from "./Matches";

import Messages from "./Messages";
import PvqPage from "./PvqPage";
import Chat from "./Chat";

import Search from "./Search";

import Settings from "./Settings";

import SettingsThemes from "./SettingsThemes";

import SettingsPrefs from "./SettingsPrefs";

import SettingsPrivacy from "./SettingsPrivacy";

import DeleteAccount from "./DeleteAccount";

import ChangePassword from "./ChangePassword";

import UpdateProfile from "./UpdateProfile";

import Analytics from "./Analytics";


/* 
* An instance of the Settings page that is available when the user isn't logged-in.
*/
const SettingsLoggedOut = (props) => 
{ 
    return (
        <Settings
            {...props} loggedOut = { true } 
        /> 
    )
}

/*
* An instance of the SettingsThemes page that is available when the user isn't logged-in.
*/
const SettingsThemesLoggedOut = (props) => 
{ 
    return (
        <SettingsThemes
            {...props} loggedOut = { true } 
        /> 
    )
}

// An array of all the page names that shouldn't have animations when transitioning to another page.
const pagesNoAnimations = 
[
    "landing",
    "login",
    "createAccountEmail",
    "createAccountVerifyEmail",
    "createAccountPassword",
    "createAccountName",
    "createAccountDOB",
    "createAccountGender",
    "createAccountReligion",
    "createAccountChildren",
    "createAccountHeight",
    "createAccountDescription",
    "createAccountImages",
    "createAccountQuizIntro",
    "createAccountCompleted"
];

/*
* All of the pages that are rendered in App.js. This object is imported by App.js.
*/
const pages = 
{
    account: Account,
    accountAdvanced: AccountAdvanced,
    userProfile: UserProfile,

    analytics: Analytics,

    landing: Landing,

    login: Login,

    createAccountEmail: CreateAccountEmail,
    createAccountVerifyEmail: CreateAccountVerifyEmail,
    createAccountPassword: CreateAccountPassword,
    createAccountName: CreateAccountName,
    createAccountDOB: CreateAccountDOB,
    createAccountGender: CreateAccountGender,
    createAccountReligion: CreateAccountReligion,
    createAccountChildren: CreateAccountChildren,
    createAccountHeight: CreateAccountHeight,
    createAccountDescription: CreateAccountDescription,
    createAccountImages: CreateAccountImages,
    createAccountQuizIntro: CreateAccountQuizIntro,
    createAccountCompleted: CreateAccountCompleted,

    matches: Matches,
    messages: Messages,
    pvqPage: PvqPage,
    chat: Chat,
    search: Search,
    settings: Settings,
    settingsLoggedOut: SettingsLoggedOut,
    settingsThemes: SettingsThemes,
    settingsThemesLoggedOut: SettingsThemesLoggedOut,
    settingsPrefs: SettingsPrefs,
    settingsPrivacy: SettingsPrivacy,
    deleteAccount: DeleteAccount,
    changePassword: ChangePassword,
    updateProfile: UpdateProfile,
};

export { pages as default, pagesNoAnimations };