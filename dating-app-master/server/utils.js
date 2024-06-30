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
* Calculates the compatibility score between two users based on their respective PVQ results.

* Parameters:
    @param {Object} pvqResultsA One user's PVQ results.
    @param {Object} pvqResultsB Another user's of PVQ results

* @returns {number} A number between 0 and 100 representing how compatible the two users will be. A score of 100 means
  that the users answered the test exactly the same, whereas a score of 0 means they answered the test in the complete 
  opposite way. 
*/
function calculateMatchScore(pvqResultsA, pvqResultsB)
{
    let score = 100;


    // For each value, calculate how different their results are and subtract from 'score' the appropriate ammount. The
    // max that can be subtracted is 10, and the minimum is 0.
    for (const value in pvqResultsA)
    {
        score -= 10 * ( Math.abs(pvqResultsA[value] - pvqResultsB[value]) / 5 );
    }

    return Math.ceil(score);
}


/**
 * Calculates the compatibility score between two users based on their respective PVQ results.

 * Parameters:
 @param {Object} pvqResultsA One user's PVQ results.
 @param {Object} pvqResultsB Another user's of PVQ results

 * @returns {number} A number between 0 and 100 representing how compatible the two users will be. A score of 100 means
 that the users answered the test exactly the same, whereas a score of 0 means they answered the test in the complete
 opposite way.
 */

// please note that the scores can get a bit strange in extremely unlikely scenarios e.g. when trying to make completely opposite users. This is because the algorithm takes into account the alphabetical order of the values in order to settle same scores.
function calculateMatchScoreRanked(pvqResultsA, pvqResultsB) {
    let score = 100;

    // Sort properties in descending order by score and then alphabetically for both objects
    const sortedA = Object.keys(pvqResultsA).sort((a, b) => {
        if (pvqResultsA[b] === pvqResultsA[a]) {
            return a.localeCompare(b); // Sort alphabetically if scores are equal
        }
        return pvqResultsA[b] - pvqResultsA[a]; // Otherwise, sort by score
    });

    const sortedB = Object.keys(pvqResultsB).sort((a, b) => {
        if (pvqResultsB[b] === pvqResultsB[a]) {
            return a.localeCompare(b); // Sort alphabetically if scores are equal
        }
        return pvqResultsB[b] - pvqResultsB[a]; // Otherwise, sort by score
    });

    // console.log("A");
    // console.log(sortedA);
    // console.log("B");
    // console.log(sortedB);

    for (let j = 0; j < sortedA.length; j++) {
        for (let i = 0; i < sortedB.length; i++) {
            if (sortedA[j] === sortedB[i]) {
                score -= Math.abs((i - j) * 2);
                break;
            }
        }
    }

    return Math.ceil(score);
}

/**
* Calculates the approximate 'great-circle' (i.e. as-the-crow-files) distance between two lat/long coordinates on Earth.
* The Haversine formula is used: see https://en.wikipedia.org/wiki/Haversine_formula.

* Parameters:
    @param {Object} coordA A coordinate on Earth.
    @param {Object} coordB Another coordinate on Earth (same properties as coordA).
    @param {number} coordA.lat The latitude of coordinate A (in degrees).
    @param {number} coordA.long The longitude of coordinate A (in degrees).

* @returns {number} The distance between coordA and coordB (in km).
*/
function distance(coordA, coordB)
{
    // The radius of the Earth.
    const radiusEarth = 6371;

    // Convert lat and long angles to radians.
    const coordArad = { lat: degToRad(coordA.lat), long: degToRad(coordA.long) };
    const coordBrad = { lat: degToRad(coordB.lat), long: degToRad(coordB.long) };

    // The difference between the coordinates' lat and long values.
    const diffLong = coordBrad.long - coordArad.long;
    const diffLat = coordBrad.lat - coordArad.lat;

    // The argument of the formula's square-root.
    let h = Math.pow(Math.sin(diffLat / 2), 2) +
            Math.cos(coordArad.lat) * Math.cos(coordBrad.lat) * Math.pow(Math.sin(diffLong / 2), 2);

    return 2 * radiusEarth * Math.asin(Math.sqrt(h));
}

/**
* Converts degrees to radians.

* Parameters:
    @param {number} degrees - A number representing an angle in degrees.

* @returns {number} The angle converted to radians.
*/
function degToRad(degrees)
{
    return degrees * (Math.PI / 180);
}

/*
* This function returns a random number between aMin and aMax (inclusive of both, i.e. [aMin, aMax]).

* Parameters:
    > aMin: the minimum value of the random number.
    > aMax: the maximum value of the random number.
*/
function getRandom(aMin, aMax)
{
    return Math.floor(Math.random() * (aMax - aMin + 1)) + aMin;
}

const utils = 
{
    getAgeFromDate: getAgeFromDate,
    calculateMatchScore: calculateMatchScore,
    calculateMatchScoreRanked: calculateMatchScoreRanked,
    distance: distance,
    getRandom: getRandom
};

export default utils;