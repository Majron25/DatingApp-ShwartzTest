// Testing framework.
import test from 'ava';

// The functions to test.
import utils from '../utils.js';


// Utility Functions ===================================================================================================

// Returns PVQ results from a given 'results' array (i.e. an array of integers of length 10 where each integer is [0,5]).
function generateResults(results)
{
    return {
        selfDirection: results[0],
        stimulation: results[1],
        hedonism: results[2],
        achievement: results[3],
        power: results[4],
        security: results[5],
        confirmity: results[6],
        tradition: results[7],
        benevolence: results[8],
        universalism: results[9]
    }
}


// utils.calculateMatchScore (3) =======================================================================================

test(
    "utils.calculateMatchScore #1",
    (t) =>
    {
        const lResultsA = generateResults(new Array(10).fill(5));
        const lResultsB = generateResults(new Array(10).fill(0));

        const lMatchScore = utils.calculateMatchScore(lResultsA, lResultsB);

        t.is(lMatchScore, 0, "These two result sets completely different. The match score should be 0.");
    }
);

test(
    "utils.calculateMatchScore #2",
    (t) =>
    {
        const lResultsA = generateResults(new Array(10).fill(3));
        const lResultsB = generateResults(new Array(10).fill(3));

        const lMatchScore = utils.calculateMatchScore(lResultsA, lResultsB);

        t.is(lMatchScore, 100, "These two result sets are exactly the same. The match score should be 100.");
    }
);

test(
    "utils.calculateMatchScore #3",
    (t) =>
    {
        const lResultsA = generateResults(new Array(10).fill(5));
        const lResultsB = generateResults(new Array(10).fill(2.5));

        const lMatchScore = utils.calculateMatchScore(lResultsA, lResultsB);

        t.is(lMatchScore, 50, "These two results are exactly 50% different. The match score should be 50.");
    }
);


// utils.calculateMatchScoreRanked (3) =================================================================================

test(
    "utils.calculateMatchScoreRanked #1",
    (t) =>
    {
        const lResultsA = generateResults([ 0,   0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9 ]);
        const lResultsB = generateResults([ 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0 ]);

        const lMatchScore = utils.calculateMatchScoreRanked(lResultsA, lResultsB);

        t.is(lMatchScore, 0, "These two result sets completely different. The match score should be 0.");
    }
);

test(
    "utils.calculateMatchScoreRanked #2",
    (t) =>
    {
        const lResultsA = generateResults([ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9 ]);
        const lResultsB = generateResults([ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9 ]);

        const lMatchScore = utils.calculateMatchScoreRanked(lResultsA, lResultsB);

        t.is(lMatchScore, 100, "These two result sets are exactly the same. The match score should be 100.");
    }
);

test(
    "utils.calculateMatchScoreRanked #3",
    (t) =>
    {
        const lResultsA = generateResults(new Array(10).fill(3));
        const lResultsB = generateResults(new Array(10).fill(3));

        const lMatchScore = utils.calculateMatchScoreRanked(lResultsA, lResultsB);

        t.is(lMatchScore, 100, "These two result sets are exactly the same. The match score should be 100.");
    }
);

// utils.distance (4) ==================================================================================================

// Short distance calculation.
test(
    "utils.distance #1 (Short Distance)",
    (t) =>
    {
        // Southern Cross Station
        const lLocationA = { lat: -37.818767125801784, long: 144.95274173367736 };

        // Parliament Station
        const lLocationB = { lat: -37.81178249197999, long: 144.97316717700676 };

        // The distance was measured to be approx 2km on Google Maps.
        const lDistance = utils.distance(lLocationA, lLocationB);

        t.is(Math.ceil(lDistance), 2, "This distance (rounded up) should be 2km.");
    }
);

// Medium distance calculation.
test(
    "utils.distance #2 (Medium Distance)",
    (t) =>
    {
        // Footscray
        const lLocationA = { lat: -37.80356057975425, long: 144.88683470508784 }; // -37.80356057975425, 144.88683470508784

        // Doncaster
        const lLocationB = { lat: -37.79298048268348, long: 145.1257873191362 }; // -37.79298048268348, 145.1257873191362

        // The distance was measured to be approx 21.2km on Google Maps.
        const lDistance = utils.distance(lLocationA, lLocationB);

        t.is(Math.ceil(lDistance), 22, "This distance (rounded up) should be 22km.");
    }
);

// Intermediate distance calculation.
test(
    "utils.distance #3 (Intermediate Distance)",
    (t) =>
    {
        // Mount Eliza
        const lLocationA = { lat: -38.177467903533405, long: 145.09518375546708 }; // -38.177467903533405, 145.09518375546708

        // Torquay
        const lLocationB = { lat: -38.173413338198216, long: 144.34875381264493 }; // -38.173413338198216, 144.34875381264493

        // The distance was measured to be approx 65.23km on Google Maps.
        const lDistance = utils.distance(lLocationA, lLocationB);
        // console.log(lDistance);

        t.is(Math.ceil(lDistance), 66, "This distance (rounded up) should be 66km.");
    }
);


// Long distance calculation.
test(
    "utils.distance #4 (Long Distance)",
    (t) =>
    {
        // Doncaster
        const lLocationA = { lat: -37.79544714878673, long: 145.12437984325905 }; // -37.79544714878673, 145.12437984325905

        // Point Addis
        const lLocationB = { lat:  -38.389473708052044, long: 144.2492808202728 }; // -38.389473708052044, 144.2492808202728

        // The distance was measured to be approx 101.37km on Google Maps.
        const lDistance = utils.distance(lLocationA, lLocationB);
        // console.log(lDistance);

        t.is(Math.ceil(lDistance), 102, "This distance (rounded up) should be 102km.");
    }
);


// utils.getAgeFromDate (3) ============================================================================================

// A user who is exactly 18 years old.
test(
    "utils.getAgeFromDate #1 (18 exact)",
    (t) =>
    {
        const today = new Date();

        const todayString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        // console.log("Today: " + todayString);

        const birthDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() - 18}`;
        // console.log("Birthday: " + birthDate);

        const age = utils.getAgeFromDate(birthDate);

        t.is(age, 18, "This user should be 18, as they were born exactly 18 years ago.");
    }
);

// A user who is one day off being 18.
test(
    "utils.getAgeFromDate #2 (one day off 18)",
    (t) =>
    {
        const today = new Date();

        const todayString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        // console.log("Today: " + todayString);

        const birthDate = `${today.getDate() + 1}/${today.getMonth()+1}/${today.getFullYear() - 18}`;
        // console.log("Birthday: " + birthDate);

        const age = utils.getAgeFromDate(birthDate);

        t.is(age, 17, "This user should be 17, as they are still one day off 18.");
    }
);

// A user who has been 18 for one day.
test(
    "utils.getAgeFromDate #3 (one day ahead of 18)",
    (t) =>
    {
        const today = new Date();

        const todayString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        // console.log("Today: " + todayString);

        const birthDate = `${today.getDate() - 1}/${today.getMonth()+1}/${today.getFullYear() - 18}`;
        // console.log("Birthday: " + birthDate);

        const age = utils.getAgeFromDate(birthDate);

        t.is(age, 18, "This user should be 18.");
    }
);