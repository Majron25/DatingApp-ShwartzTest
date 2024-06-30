import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'; 

/*
* This function returns a random number between aMin and aMax (inclusive of both, i.e. [aMin, aMax]).

* Parameters:
    > aMin: the minimum value of the random number.
    > aMax: the maximum value of the random number.
*/
function GetRandom(aMin, aMax)
{
    return Math.floor(Math.random() * (aMax - aMin + 1)) + aMin;
}

/*
* Randomises the order of the given array.

* Parameters:
    > aArray: the array to randomise.
*/
function RandomiseArray(aArray)
{
    if (!Array.isArray(aArray))
    {
        console.log("The parameter is not an array.");
        return;
    }

    for (let i = aArray.length - 1; i > 0; --i)
    {
        const lIndexRandom = GetRandom(0, i);

        let lValueI = aArray[i];
        aArray[i] = aArray[lIndexRandom];
        aArray[lIndexRandom] = lValueI;
    }

}

/**
* Pauses function execution for sleepDuration ms.

* Parameters:
    * @param {number} sleepDuration - The number of ms to sleep for.

* @returns {Promise} The promise (resolves to undefined).
*/
function sleepFor(sleepDuration)
{
    if (typeof sleepDuration !== 'number')
    {
        console.log("sleepDuration must be a number, not " + typeof sleepDuration);
        return;
    } 
    else if (sleepDuration < 0)
    {
        console.log("sleepDuration can't be negative.");
        return;
    }

    return new Promise(resolve => setTimeout(resolve, sleepDuration));
}

/*
* Stores data in the device's internal storage through React Native's AsynStorage API.

* Parameters:
    > aKey: the key that corresponds to the data.
    > aAlt: the value that will be returned should the key have no corresponding value.
*/
async function SetInAsyncStorage(aKey, aValue)
{
    try 
    {
        await AsyncStorage.setItem(aKey, JSON.stringify(aValue));
    } 
    catch (error)
    {
        console.log(error);
    }

}

/*
* Retrieves data from device's internal storage through React Native's AsynStorage API.

* Parameters:
    > aKey: the key that corresponds to the data.
    > aAlt: the value that will be returned should the key have no corresponding value.
*/
async function GetFromAsyncStorage(aKey, aAlt = "")
{
    try 
    {
        const lData = await AsyncStorage.getItem(aKey);

        return lData ? JSON.parse(lData) : aAlt;
    } 
    catch (error) 
    {
        console.log(error);
        return "";
    }
}

/*
* Returns the suffix for oridinal numbers. e.g. the 'st' in 1st, 'rd' in 23rd.
*/
function OrdinalSuffix(aNum)
{
    if (typeof aNum !== 'number')
        return;

    const lNumAbs = Math.abs(aNum);

    if (lNumAbs > 3 && lNumAbs < 21)
        return "th";
    
    const lNumMod10 = lNumAbs % 10;

    if (lNumMod10 === 1)
        return "st";
    else if (lNumMod10 === 2)
        return "nd"
    else if (lNumMod10 === 3)
        return "rd"
    else
        return "th";
}

/**
* A conversion function for converting cm to feet+inches.

* Parameters:
    @param {number} cm The input height/length in cm.
    @param {number} roundUp Whether to round the inches up or down.

* @returns {string} The conversion to feet+inches, of the form "<feet>'<inches>", e.g. 5'7.

*/
function cmToFeetAndInch(cm, roundUp = true)
{
    if (typeof cm != 'number')
    {
        console.log("This isn't a number.");
        return undefined;
    }

    const lFeetExact = cm / 30.48;

    const lFeetWhole = Math.floor(lFeetExact);

    const lInchesUnrounded = (lFeetExact - lFeetWhole) * 12;

    const lInches = (roundUp && (Math.floor(lInchesUnrounded) != 11)) ? Math.ceil(lInchesUnrounded) : Math.floor(lInchesUnrounded);

    return `${lFeetWhole}'${lInches}`;
}

/**
* Determines whether a given date represents the birthday of someone 18 years or older.

* Parameters:
    @param {number} birthDate The birth-date to check (instance of Date object).

* @returns {boolean} Whether the birth-date is that of someone 18 years or older.

*/
function isOver18(birthDate)
{
    if (!(birthDate instanceof Date))
    {
        console.log("This isn't a date!");
        return false;
    }

    const date18YearsAfterBirthDate = new Date(birthDate.getFullYear() + 18, birthDate.getMonth(), birthDate.getDate());

    const dateCurrent = new Date();

    return date18YearsAfterBirthDate <= dateCurrent;
}

/**
* A conversion function for converting cm to feet+inches.

* Parameters:
    @param {Date} date An instance of the Date class.

* @returns {string} The formatted string of the form "D/M/Y"

*/
function formatDateDMY(date)
{
    if (!(date instanceof Date))
    {
        console.log("This isn't a date!");
        return false;
    }

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/**
* Returns the age of the user (integer) based on the given date.

* Parameters:
    @param {String} dateString A string representaion of a date in the form "D/M/Y".

* @returns {number} The age based on the date.
*/
function getAgeFromDate(dateString) 
{
    if (!(typeof dateString === 'string'))
    {
        console.log("This isn't a string!");
        return 0;
    }

    const today = new Date();

    const birthDate = new Date(dateString.split('/').reverse().join('-'));

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    // If the birth month hasn't occurred this year or it's the birth month but the birth day hasn't occurred yet, subtract 1 from the age.
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        --age;
    }

    return age;
}

/**
* Adds a time-limit to a given promise.
* If the time-limit elapses before the async function resolves, an error is thrown.

* Parameters:
    @param {Promise} promise   An asynchronous promise to resolve
    @param {number}  timeLimit The maximum length of time (ms) before an error is thrown.

* @returns {Promise | undefined} Resolved promise for async function call, or an error if time limit reached
*/
async function promiseTimeLimited(promise, timeLimit)
{
    let lTimeoutHandle;

    const timeLimitPromise = new Promise((_resolve, reject) => {
        lTimeoutHandle = setTimeout(
            () => reject(new Error('Time-limit has been reached!')),
            timeLimit
        );
    });

    return Promise.race([promise, timeLimitPromise]).then(
        (result) => 
        {
            clearTimeout(lTimeoutHandle);
            return result;
        }
    );
}

/**
* Attempts to return the devices current location.

* @returns {Promise | undefined} A resolved promise with either the device's location or - in the event it couldn't be 
  found - undefined.
*/
async function getDeviceLocation()
{
    // Get the device's current location.
    let location;

    for (let i = 0; i < 3; ++i)
    {
        try {
            location = await utils.promiseTimeLimited(Location.getCurrentPositionAsync({}), 2000)
        } catch (err) {
            console.log("getCurrentPositionAsync has timed-out!");
            continue;
        }

        break;
    }

    // If the location couldn't be loaded with getCurrentPositionAsync, use getLastKnownPositionAsync.
    if (!location)
    {
        for (let i = 0; i < 3; ++i)
        {
            try {
                location = await utils.promiseTimeLimited(Location.getLastKnownPositionAsync({}), 2000)
            } catch (err) {
                console.log("getLastKnownPositionAsync has timed-out!");
            }

            break;
        }
    }

    if (location)
        return { alt: location.coords?.altitude, lat: location.coords?.latitude, long: location.coords?.longitude };
}

const utils =
{
    GetRandom: GetRandom,
    RandomiseArray: RandomiseArray,
    sleepFor: sleepFor,
    SetInAsyncStorage: SetInAsyncStorage,
    GetFromAsyncStorage: GetFromAsyncStorage,
    OrdinalSuffix: OrdinalSuffix,
    cmToFeetAndInch: cmToFeetAndInch,
    isOver18: isOver18,
    formatDateDMY: formatDateDMY,
    getAgeFromDate: getAgeFromDate,
    promiseTimeLimited: promiseTimeLimited,
    getDeviceLocation: getDeviceLocation
};

export { utils as default };
