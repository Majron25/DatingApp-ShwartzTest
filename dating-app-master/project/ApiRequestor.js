import axios from "axios";

// Whether or not you're testing/developing. If pushing to production, this should be false.
const gTesting = true;

class ApiRequestor
{
    // The Axios instance.
    static sAxios = axios.create(
        {
            baseURL: gTesting ? " https://75fc-115-64-190-130.ngrok-free.app" : "<insert-production-url>",
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 15000,

            // Axios won't through errors when the status code isn't 200.
            // This means that the caller of the method has to handle the errors (see Login page for an example).
            validateStatus: () => true
        }
    );

    // The authentication token.
    static sAuthToken = undefined;

    /*
    * Set the authentication token. This should be called when the user logs in.
    */
    static setAuthToken(pToken)
    {
        ApiRequestor.sAuthToken = pToken;
    }

    /*
    * Default endpoint.
    */ 
    static async findUser(email, password) 
    {
        try {
            const lResponse = await ApiRequestor.sAxios.post(
                '/findUser', {email, password}
            );
    
            return lResponse.data
        } catch (error)
        {
            console.log("An error has occurred: " + error);
            return undefined;
        }
    }

    static async getDefault()
    {
        try
        {
            const lResponse = await ApiRequestor.sAxios.get(
                `/`,
            );

            return lResponse.data;
        }
        catch(e)
        {
            console.log(e.stack);
            return undefined;
        }
    }

    /*
    * User Sign Up.
    */
    static async createNewUser(userData)
    {
        try
        {
            const lResponse = await ApiRequestor.sAxios.post(
                `/user/new`,
                userData
            );

            return lResponse.data;
        }
        catch(e)
        {
            console.log(e.stack);
            return undefined;
        }
    }

    static async putPVQAnswersIntoDatabase(userId, results)
    {
        try
        {
            const lResponse = await ApiRequestor.sAxios.post(
                `/authreq/user/send-pvq-results`,
                {userId, results},
                { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } } 
            );

            return lResponse;
        }
        catch(e)
        {
            console.log(e.stack);
            return undefined;
        }
    }

    static async getAllUsers()
    {
        try 
        {
            //this code goes to server.js and runs the function with /user/test 
            
            const lResponse = await ApiRequestor.sAxios.get(
                '/user/all', {} 
            );
            return lResponse.data
        }
        catch(e)
        {
            console.log("An error has occurred: " + e.stack);
            return undefined;
        }
    }

    static async getMatchedUsersFromId(userId) { 
        try {
            const lResponse = await ApiRequestor.sAxios.get(
                `/authreq/load-matches` ,
                { 
                    params: { userId },
                    headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } 
                }
            ); 
            return lResponse.data; 
        } catch (e) { 
            console.log("Failed lol: " + e)
            return undefined
        }
    }

    // Takes in an entered email (Signup page) and checks for its existence in the database. 
    static async checkEmail(email) 
    {
        try {
            const lResponse = await ApiRequestor.sAxios.post(
                '/checkEmail', {email}
            );
            return lResponse.data;
        } catch (error) 
        {
            console.log("An error has occurred: " + error);
            return undefined;
        }
    }

    static async getUsersForMatchesPage(numToSkip, maxNumMatches, loggedUserId, sortId, sortDirection)
    {
        try
        { 
            const lResponse = await ApiRequestor.sAxios.get(
                `/authreq/user/get-users-for-matches-page`,
                { 
                    params: { numToSkip, maxNumMatches, loggedUserId, sortId, sortDirection }, 
                    headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` }
                }
            );

            return lResponse.data;
        } 
        catch(e)
        {
            console.log("An error has occurred, here, have some useless information! " + e.stack);
            return undefined;
        }
    }

    static async getUsersForSearchPage(userId)
    {
        try
        { 
            const lResponse = await ApiRequestor.sAxios.get(
                `/authreq/user/get-users-for-search-page`,
                {
                    params: { userId }, 
                    headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` }
                }
            );

            return lResponse;
        } 
        catch(e)
        {
            console.log("An error has occurred, here, have some useless information! " + e.stack);
            return undefined;
        }
    }

    static async getUsersFirstImages(userIds)
    {
        try
        { 
            const lResponse = await ApiRequestor.sAxios.get(
                `/authreq/get-users-first-images`,
                {
                    params: { userIds }, 
                    headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` }
                }
            );

            return lResponse;
        } 
        catch(e)
        {
            console.log("An error has occurred, here, have some useless information! " + e.stack);
            return undefined;
        }
    }

    static async getUserFromId(userId) {
        console.log("getting user from id")
        try {
            const lResponse = await ApiRequestor.sAxios.get(
                `/authreq/user/${userId}`,
                { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } }
            );

            return lResponse.data;
        } catch (error) {
            // Handle errors here, such as network errors or 404 (user not found) responses
            console.error('Error getting user:', error);
            throw error; // Rethrow the error to be handled higher up the call stack
        }
    }

    static async getUserData() {
        try {
            const lResponse = await ApiRequestor.sAxios.get(
                `authreq/userData`,
                { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } }
            );

            return lResponse;
        } catch (error) {
            // Handle errors here, such as network errors or 404 (user not found) responses
            console.error("Error getting user's data: ", error);
            throw error; // Rethrow the error to be handled higher up the call stack
        }
    }

    static async likeProfile(loggedUser, likedUser) {
        try { 
            const lResponse = await ApiRequestor.sAxios.post(
                    `/authreq/user/like`, 
                    {loggedUser, likedUser},
                    { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } } 
                );
            return lResponse.data;
        } catch (e) {
            console.error('Error while liking: ', e)
            throw e;
        }
    }

    static async unlikeProfile(loggedUser, unlikedUser) {
        try { 
            const lResponse = await ApiRequestor.sAxios.post(
                `/authreq/user/unlike`, 
                {loggedUser, unlikedUser},
                { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } } 
            );
            return lResponse.data;
        } catch (e) {
            console.error('Error while unliking: ', e)
            throw e;
        }
    }

    // Takes in the user ID and sends to the backend for account deletion.
    static async DeleteAccount(userId)
    {
        const lResponse = await ApiRequestor.sAxios.post(
            `/authreq/user/delete/${userId}`, 
            { }, 
            { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } } 
        );

        // Not sure what else to do in here :L
        return lResponse.data;

    }

    static async updateUserPrefs(userId, prefs)
    {
        try
        {
            const lResponse = await ApiRequestor.sAxios.put(
                `/authreq/updatePreferences`,
                { userId: userId, prefs: prefs },
                { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } } 
            );

            return lResponse;
        }
        catch(e)
        {
            console.log(e.stack);
            return undefined;
        }
    }

    static async updateUser(userId, query)
    {
        try
        {
            const lResponse = await ApiRequestor.sAxios.put(
                `/authreq/updateUser`,
                { userId, query },
                { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } } 
            );

            return lResponse;
        }
        catch(e)
        {
            console.log(e.stack);
            return undefined;
        }
    }

    static async sendMessage(chatID, messageText, sender, reciever)
    {
        try
        {
            const lResponse = await ApiRequestor.sAxios.post(
                `/message/send`,
                {chatID, messageText, sender, reciever}
            );

            return lResponse.data;
        }
        catch(e)
        {
            console.log(e.stack);
            return undefined;
        }
    }


    static async getMessages(chatID)
    {
        try
        {
            const lResponse = await ApiRequestor.sAxios.post(
                `/messages/get`,
                { chatID }
            );

            return lResponse.data;
        }
        catch(e)
        {
            console.log(e.stack);
            return undefined;
        }
    }

    static async getConvosations(userID)
    {
        try
        {
            const lResponse = await ApiRequestor.sAxios.post(
                `/convosations/get`,
                { userID }
            );

            return lResponse.data;
        }
        catch(e)
        {
            console.log(e.stack);
            return undefined;
        }
    }

    static async getRandomPVQ()
    {
        try
        {
            const lResponse = await ApiRequestor.sAxios.get(`/random-pvq`);
            return lResponse.data;
        }
        catch(e)
        {
            console.log(e.stack);
            return undefined;
        }
    }

    // Takes the user entered email from the frontend and sends it to the backend. 
    // Returns the generated verification code.
    static async VerifyEmail(email) 
    {
        try {
            const lResponse = await ApiRequestor.sAxios.post('/verifyEmail', {email});

            return lResponse;
        } catch (error) {
            console.error('Error gettng email:', error);
            throw error
        }
    }

    // Pass userId, old and new passwords to the backend.
    static async updatePassword(userId, oldPassword, newPassword) {
        try 
        {
            const lResponse = await ApiRequestor.sAxios.patch(
                '/authreq/updatePassword', 
                {userId, oldPassword, newPassword},
                { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } } 
            );

            return lResponse;
        } catch (error) 
        {
        console.error('Error:', error);
        throw error; // Rethrow the error to be handled higher up the call stack
        }
    }

    // 
    static async updateProfile(userId, gender, childStatus, religion, description) {
        try {
            const lResponse = await ApiRequestor.sAxios.patch(
                '/authreq/updateProfile', 
                { userId, gender, childStatus, religion, description },
                { headers: { authorization: `Bearer ${ApiRequestor.sAuthToken}` } } 
            );
            return lResponse;
        } catch (error) {
            console.error('Error', error);
            throw error;
        }
    }

    // Takes the users email in and will return the newly generated code back to the frontend.
    static async generateVerificationCode(email) {
        try {
            const lResponse = await ApiRequestor.sAxios.get(
                '/generateVerificationCode', 
                { params: { email } }, 
            );
            return lResponse;
        } catch (error) {
            console.error('Error', error);
            throw error;
        }
    }
    
};

export default ApiRequestor;