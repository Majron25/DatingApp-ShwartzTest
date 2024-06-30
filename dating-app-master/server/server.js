import http from 'http';
import path from 'path';
import fs from 'fs'
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {MongoClient, ObjectId, ServerApiVersion} from "mongodb";
import  bcrypt from 'bcrypt'; 
import nodemailer from 'nodemailer';
import { createCanvas } from 'canvas';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import utils from './utils.js';
import { match } from 'assert';

// Configure environment variables.
dotenv.config();

const app = express()
const connectionString = process.env.MONGODB_URI;

let mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'myonedevelopers@gmail.com',
    pass: 'kfxenhizxmfcmejp'
  }
})

app.use(cors());
app.use(bodyParser.json({limit: '10MB'}));
// app.get ENDPOINTS
///user/Login
///user/new
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    res.json({error: err})
  });
};


app.get("/", (req, res) => {

  res.json("hello there")
})

function validUser(user) {
  if (!user.hasOwnProperty("email" ))
    throw new Error("no email")
  if (!user.hasOwnProperty("password" ))
    throw new Error("no password")
  // if (!user.hasOwnProperty("gender" ))
  //   throw new Error("no gender")
  // if (!user.hasOwnProperty("sexualPreference" ))
  //   throw new Error("no sexualPreference")
}

async function database() {
  const client = new MongoClient(connectionString, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  let mongo = await client.connect();

  const gTesting = false;
  // The backend URL.
  let dbString = gTesting ? "dating-app" : "myone-dating";
  let db = mongo.db(dbString)

  return {db, client}
}

/*
* The authorisation endpoint.
* This is called before any endpoint that begins with "/authreq" is called; if the user is authenticated, the desired
  endpoint is called.
*/
app.use(
    "/authreq",
    asyncMiddleware(
        async (req, res, next) => 
        {
            const lAuthorisation = req.headers.authorization;

            // console.log(req.headers);
        
            if (!lAuthorisation)
                return res.status(401).json({ error: "An authorisation token is required to access this API." });
        
            // Extract the token. Expected to be of the form "Bearer <token>".
            const lToken = lAuthorisation.split(' ')[1];

            const {db, client} = await database();

            try
            {
                const lCollUsers = db.collection("users");

                const lId = jwt.verify(lToken, process.env.SECRET_JWT)._id;

                // console.log("ID from token: " + lId);
        
                // Check if user exists
                const lResultFind = await lCollUsers.find({ _id: new ObjectId(lId) }, { projection: { _id : 1 } }).toArray();
                console.log(lResultFind);

                if (!lResultFind)
                    return res.status(401).json({ error: "This account no longer exists." });

                req._id = lId;
                next();
            }
            catch(e)
            {
                res.status(401).json({ error: "The provided authorisation token is invalid." }); 
            }
            finally 
            {
                client.close();
            }
        }
    )
);

app.post("/user/new", asyncMiddleware(async (req, res) => {

  let user = req.body;
  
  // TODO: Does this need to be here? Delete if not
  // console.log(user);
  
  user.email = user.email.toLowerCase();
  user.likes = [];
  user.matches = [];
  user.notifications = [];
  user.blocks = [];
  user.settings = { privacy: { allowUnmatchedMessages: true } };
  user.analytics = { accountViews: 0, likesFromYou: 0, likesFromThem: 0 };
  // validUser(user);

  // we only store the password hash, for security reasons
  user.passwordHash = await bcrypt.hash(user.password, 10);
  //delete user.password;
  //UNCOMMENT THIS DELETE LATER ON

 const {db, client} = await database();
   try {
     const collection = db.collection('users');

     const result = await collection.insertOne(user);

     res.json(result)

   } finally {
     client.close();
   }

})) 

app.post('/findUser', asyncMiddleware(async (req, res) => {
  const {db, client} = await database();
  let {email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({status: 400, message: "BAD_REQUEST"});
  }
  
  try {
    const collection = db.collection('users');

    const entry = await collection.findOne({email: email});
    if (entry !== null) {
      let passwordHash = entry.passwordHash;
      let passwordCheck = await bcrypt.compare(password, passwordHash);
      
      if (passwordCheck) {
        const token = jwt.sign({ _id: entry._id }, process.env.SECRET_JWT);
        res.send({status: 200, message: "MATCH_FOUND", user: entry, token: token});
      } else
      {
        res.send({status: 401, message: "INCORRECT_PASSWORD"});
      }
    } else {
      res.send({status: 404, message: "NO_MATCH_FOUND"});
    }
  } catch (error) {
    console.log("Error: " + error);
  } finally {
    client.close();
  }
}))

app.post('/checkEmail', asyncMiddleware(async (req, res) => {
  const {db, client} = await database();
  let { email } = req.body;

  try {
    const collection = db.collection('users');
    const entry = await collection.findOne({email: email});

    if (entry !== null) {
      console.log("Email already exists");
      res.send({status: 409, message: "EMAIL_EXISTS"});
    } else {
      console.log("Email does not exist!");
      res.send({status: 200, message: "EMAIL_VALID"});
    }
  } catch (error) {
    console.log("Error: " + error);
  } finally {
    client.close();
  }
}))

//returns all users
app.get("/user/all", asyncMiddleware(async (req, res) => { 
  const {db, client} = await database();
  try {
    const collection = db.collection('users');
    const result = await collection.find().toArray();
    res.json(result);
  } finally {
    client.close();
  }
}))

//returns users from matches array of a defined user
app.get("/authreq/load-matches", asyncMiddleware(async (req, res) => {

    const userId = req.query.userId;

    if (!userId) {
        console.log("Invalid data, cannot get messages.");
        return;
    }
     
  const {db, client} = await database(); 
  try {
    const collection = db.collection('users'); 
    const user = await collection.findOne({ "_id": new ObjectId(userId) }); 
    
    const matchesArray = [];
    for (let i = 0; i < user.matches.length; i++)
    {
      try{
        const matchedUser = await collection.findOne({"_id": new ObjectId(user.matches[i])})
        const chatID = matchedUser._id < user._id.toString() ? matchedUser._id.toString() + "_" + user._id.toString() : user._id.toString() + "_" + matchedUser._id.toString();
        const messageCollection = db.collection('messages');
        let lMessage = await messageCollection.find({ "chatID": chatID }).sort({ sentAt: 1 }).toArray();
        if (lMessage.length === 0) { lMessage = [{message: "No messages yet", sentAt: null}] }
        if (matchedUser)
        {
          // Calculate the match scores (should be a whole number between 0 and 100). 
          matchedUser.matchScore = utils.calculateMatchScore(user.pvqAnswers.results, matchedUser.pvqAnswers.results);
   
          if (user.location && matchedUser.location) {
            matchedUser.distance = utils.distance(user.location, matchedUser.location);
          } else {
            matchedUser.distance = 10;
          }
 
          // The match's age.
          matchedUser.age = utils.getAgeFromDate(matchedUser.dob); 
          matchesArray.push({...matchedUser, latestMessage: {content: lMessage[0].message, time: lMessage[0].sentAt} })
        }
      } catch (e) {
        console.log("error finding user: " + e);
        console.log("matched user was not found in db. This might be fine, could be a deactivated/deleted user, Dont remove from matches array.") 
      }
    } 
    
    res.json(matchesArray);
  } finally {
    client.close(); 
  }
}));

app.get(
    "/authreq/user/get-users-for-search-page", 
    asyncMiddleware(
        async (req, res) => 
        {
            const { userId } = req.query;

            const { db, client } = await database(); 

            try {
                const collection = db.collection('users');

                let matches = await getMatches(collection, userId);

                console.log("Pre limit: " + matches.length);

                // Limit the number of users that can be returned.
                // Return maxNumMatches random matches.
                const maxNumMatches = 50;
                if (matches.length > maxNumMatches)
                {
                    matches = matches.sort(
                        () => {
                            const randomNumber = utils.getRandom(1, 100);

                            if (randomNumber == 50)
                                return 0;
                            else if (randomNumber < 50)
                                return -1;
                            else
                                return 1;
                        }
                    );
                    matches = matches.slice(0, maxNumMatches);
                }

                console.log("Post limit: " + matches.length);

                res.json(matches);

            } catch(e) {
                console.log(e);
                res.status(400).json({ message: "Something went wrong when looking for matches. Please try again later." });
            } finally {
                client.close();
            }
        }
    )
);

app.get(
    "/authreq/get-users-first-images", 
    asyncMiddleware(
        async (req, res) => 
        {
            const { userIds } = req.query;

            const { db, client } = await database(); 

            try {
                const collection = db.collection('users');

                let userImages = { };

                // Get the images (the queries are made concurrently to save time).
                await Promise.all(
                    userIds.map(
                        (userId) =>
                        {
                            return collection.findOne(
                                { "_id": new ObjectId(userId) }, 
                                {  projection: { firstImage: 1 }  } // Only get the first image.
                            )
                        }
                    )
                ).then( 
                    (results) => 
                    {
                        for (let i = 0; i < userIds.length; ++i)
                        {
                            userImages[userIds[i]] = results[i].firstImage;
                        }
                    }
                );

                console.log("Number of ids: " + userIds.length);
                console.log("Number of images: " + Object.keys(userImages).length);

                res.json(userImages);

            } catch(e) {
                console.log(e);
                res.status(400).json({ message: "Something went wrong when looking for matches. Please try again later." });
            } finally {
                client.close();
            }
        }
    )
);

// Returns users for the matches page
app.get("/authreq/user/get-users-for-matches-page", asyncMiddleware(async (req, res) => {

    const { numToSkip, maxNumMatches, loggedUserId, sortId, sortDirection } = req.query;

    const {db, client} = await database(); 

    try {
        const collection = db.collection('users');

        let matches = await getMatches(collection, loggedUserId);

        // The properties that correspond to the sortId.
        const properties = { 
            name: { name: "name", ascend: true }, values: { name: "matchScore", ascend: false }, 
            distance: { name: "distance", ascend: true }, age: { name: "age", ascend: true }
        };

        // The property to sort by.
        const propToSortBy = properties[sortId].name;

        // Whether to sort in ascending or descending order (use default if sortAscend == 0).
        const ascend = (sortDirection == 0) ? properties[sortId].ascend : sortDirection == 1;

        //console.log("Property to sort by: " + propToSortBy);

        // A function that sorts matches by id.
        const sortFunctionId = (a, b) => { return a._id.toString().localeCompare(b._id.toString()); };

        // The function that's used to sort the matches.
        const sortFunction = (a, b) => 
        {
            if (a[propToSortBy] > b[propToSortBy]) 
                return ascend ? 1 : -1;
            else if (a[propToSortBy] < b[propToSortBy]) 
                return ascend ? -1 : 1;
            else
                return sortFunctionId(a, b);
        };

        matches = matches.sort(sortFunction);

        // Limit the results.
        matches = matches.slice(parseInt(numToSkip), parseInt(numToSkip) + parseInt(maxNumMatches));
        console.log(`Number of matches to return: ${matches.length}.`);

        // Get the images (the queries are made concurrently to save time).
        await Promise.all(
            matches.map(
                (match) =>
                {
                    return collection.findOne(
                        { "_id": match._id }, 
                        {  projection: { images: { $slice: 1 } }  } // Only get the first image.
                    )
                }
            )
        ).then( 
            (results) => 
            {
                //console.log("Results length: " + results.length);
                for (let i = 0; i < results.length; ++i)
                {
                    matches[i].images = results[i].images;
                }
            }
        );

        res.json(matches);

    } catch(e) {
        console.log(e);
        res.status(400).json({ message: "Something went wrong when looking for matches. Please try again later." });
    } finally {
        client.close();
    }
}))

/**
* Gets all of the users who match the user's preferences.

* Parameters:
    @param {object} collection - The 'users' collection from the MongoDB database.
    @param {string} userId     - The id of the the user whose matches are to be returned.

* @returns {Promise<array>} An array of objects, where each object contains the data necessary to display the user's information
  on the Search page of the client app (via the MatchContainer component).
*/
async function getMatches(collection, userId)
{
    // Get the user's relevant data (i.e. the data to filter the other users).
    const userData = await collection.findOne({ "_id": new ObjectId(userId) }, { projection: { gender: 1, "pvqAnswers.results": 1, preferences: 1, location: 1 } });

    // An array form of the user's 'preferences.sexualPreference' field (used for the 'find' query).
    const arraySexualPreference = userData.preferences.sexualPreference.split("");

    let searchQuery = 
    {
        // Only users who have completed the PVQ can show up in a user's matches.
        "pvqAnswers.results": { $exists: true },

        // Do not included the user himself (i.e. the user might match their own preferences, in which case 
        // they should be excluded).
        _id: { $ne: new ObjectId(userId) },
    };

    if (userData.preferences.likeFilter === 0 || userData.preferences.likeFilter === 1)
    {
        // Add preference filters.
        searchQuery = { 
            ...searchQuery, 
            height: { $lte: userData.preferences.height.high, $gte: userData.preferences.height.low },
            
            // Do not include people with conflicting sexual preference.
            // i.e. the user must match their matches' sexual preference, and vice-verse.
            "preferences.sexualPreference": { $regex: userData.gender },
            gender: { $in: arraySexualPreference },
        };
    }

    if (userData.preferences.likeFilter === 1 || userData.preferences.likeFilter === 2)
    {
        // Add 'like filter'.
        searchQuery = { 
            ...searchQuery, 
            likes: userData._id.toString()
        };
    }

    //console.log(searchQuery);

    // Get matches according to user's preferences. Unable to filter by age, distance, or values in the mongodb query.
    // The additional filters can be applied on the server after the query returns.
    let matches = await collection.find(
        searchQuery,
        { 
            // Only get certain properties.
            projection: 
            {
                name: 1, 
                dob: 1, 
                "pvqAnswers.results": 1,
                location: 1,
                likes: 1,
                religion: 1,
                childStatus: 1,
                'settings.privacy.allowUnmatchedMessages': 1
            },
        }
    ).toArray();

    console.log(`Matches length (after query): ${matches.length}.`);

    // Calculate additional values for the user's matches.
    for (const match of matches)
    { 

        // Calculate the match scores (should be a whole number between 0 and 100).
        match.matchScore = utils.calculateMatchScore(userData.pvqAnswers.results, match.pvqAnswers.results);

        // TODO: Calculate the distance between the user and each of their matches.
        if (userData.location && match.location)
        {
            match.distance = Math.ceil(utils.distance(userData.location, match.location));
            if (match.name == "Chad")
            {
                console.log("Chad's distance: " + match.distance);
            }
        }
        else
            match.distance = 10;

        // The match's age.
        match.age = utils.getAgeFromDate(match.dob);

        delete match.pvqAnswers;
        delete match.dob;
        delete match.location;
    }

    if (userData.preferences.likeFilter != 2 && userData.preferences.likeFilter != 3)
    {
        // Apply further filters.
        matches = matches.filter(
            (match) =>
            {
                const isAgeSuitable = match.age <= userData.preferences.ageRange.high && match.age >= userData.preferences.ageRange.low;

                const isDistanceSuitable = match.distance <= userData.preferences.maxDistance;

                const areValuesSuitable = match.matchScore <= userData.preferences.values.high && 
                                        match.matchScore >= userData.preferences.values.low;

                const isReligionSuitable = userData.preferences.religiousStatus === 0 || (match.religion === userData.preferences.religiousStatus);

                const isChildStatusSuitable = userData.preferences.childStatus === 0 || (match.childStatus === userData.preferences.childStatus);

                // This shouldn't be necessary (see mongodb query above), but add just in case.
                const hasCompletedPVQ = match.matchScore >= 0;

                return isAgeSuitable && areValuesSuitable && isDistanceSuitable && isReligionSuitable && 
                    isChildStatusSuitable && hasCompletedPVQ;
            }
        )
    }

    console.log(`Matches length (after additional filters): ${matches.length}.`);

    return matches;
}

app.get("/authreq/user/:id", asyncMiddleware(async (req, res) => {
  const userId = req.params.id;  // Get the user ID from the URL parameter
  const { db, client } = await database();
  try {
    const collection = db.collection('users'); 
    const user = await collection.findOne({ "_id": new ObjectId(userId) });
    if (user) {
      //Analytics stuff
      await collection.updateOne({ "_id": new ObjectId(userId)}, {$inc: {"analytics.accountViews":1}});
      

      // const inputs = Array.from({ length: 10 }, () => Math.floor(Math.random() * 91) + 10);

      res.setHeader('Content-Type', 'text/plain');
      // user.svg = generatePVQ_PNG(inputs);
      //res.send(generatePVQ_PNG(inputs));

      // Delete unnecessary/sensitive data.
      delete user.dob;
      delete user.location;

      res.json(user);



    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (e) {
    console.log("error finding user HUH: " + e);
  } finally {
    client.close();
  }
}));

app.get(
    "/authreq/userData", 
    asyncMiddleware(async (req, res) => 
    {
        console.log("Getting user's data.");
        const userId = req._id;
        console.log("User Id from Auth Middleware: " + userId);

        const { db, client } = await database();

        try
        {
            const collection = db.collection('users'); 
            const user = await collection.findOne({ "_id": new ObjectId(userId) });
            if (user) 
            {
                res.status(200).json({ user });
            }
            else 
            {
                res.status(404).json({ message: 'User not found' });
            }
        } 
        catch (e) 
        {
            console.log("error finding user: " + e);
        } 
        finally 
        {
            client.close();
        }
    })
);


app.post("/authreq/user/like", asyncMiddleware(async (req, res) => {
  //Things are going to get dark here, stay calm
  //we are modifying both users twice here, this could be done better
  //but I am tired, and cannot be fucked right now. 
  const { loggedUser, likedUser } = req.body;
  const { db, client } = await database();

  try {
    const collection = db.collection('users'); 


    const loggedUserObject = new ObjectId(loggedUser);
    const likedUserObject = new ObjectId(likedUser); 
    const query = {
      "_id": loggedUserObject,
      "likes": { $ne: likedUser } // Check if likedUser is not in likes array
    }; 
    const update = {
      $addToSet: { likes: likedUser }
    };
 
    const result = await collection.updateOne(query, update);

    //Analytics stuff
    await collection.updateOne({ "_id": new ObjectId(likedUser)}, {$inc: {"analytics.likesFromThem":1}});
    await collection.updateOne({ "_id": new ObjectId(loggedUser)}, {$inc: {"analytics.likesFromYou":1}});
    
    if (result.modifiedCount === 1) {
      // The update was successful, and likedUser was added to the likes array 
      const likedUserQuery = {
        "_id": likedUserObject,
        "likes": loggedUser
      };
      
      const likedUserResult = await collection.countDocuments(likedUserQuery);
      
      if (likedUserResult === 1) {
        // Both users have liked each other 
        const updatedLoggedUser = await collection.findOneAndUpdate(
          {"_id": loggedUserObject}, 
          { $addToSet: {matches: likedUser} },
          { 
            returnOriginal: false, 
            projection: { name: 1,  matches: 1,  likes: 1 } 
          }
        );
        console.log(updatedLoggedUser.value)
        //console.log("done")
        const name = updatedLoggedUser.value.name;  
        const test = await collection.updateOne(
          {"_id": likedUserObject}, 
          { 
            $addToSet: {matches: loggedUser},
            $push: {
              notifications: {
                type: "matched_with_user",
                message: "You have matched with " + name + "! Start a conversation now!",
                redDotIconPosition: "messages_page",
                associatedUser: loggedUser, 
                viewed: false
              }
            }
          }
        );
        
        console.log("testing")
        console.log(test)

        //const updatedLoggedUser = await collection.findOne({"_id": loggedUserObject});
        
        res.status(200).json(
          {
             message: "User liked successfully and liked back",
             updatedLikes: updatedLoggedUser.value.likes,
             updatedMatches: updatedLoggedUser.value.matches,
             matchedNotification: likedUser
          }
        );
      } else {
        // Only loggedUser has liked likedUser
        const updatedLoggedUser = await collection.findOne({"_id": loggedUserObject}, { projection: { name: 1,  matches: 1,  likes: 1 } });
        res.status(200).json(
          {
             message: "User liked successfully, but they haven't liked you back yet",
             updatedLikes: updatedLoggedUser.likes,
             updatedMatches: updatedLoggedUser.matches, //not changed, but should be simpler.
             matchedNotification: null
          }
        );
      }
    } else if (result.matchedCount === 0) {
      // No documents matched the query, i.e., the loggedUser was not found
      res.status(404).json({ message: "User not found" });
    } else {
      // The likedUser is already in the likes array
      res.status(400).json({ message: "User already liked" });
    }
  } catch (e) {
    console.error("Error: " + e);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.close();
  }
}));


app.post("/authreq/user/unlike", asyncMiddleware(async (req, res) => {
  const { loggedUser, unlikedUser } = req.body;
  const { db, client } = await database();

  try {
    const collection = db.collection('users');

    // Define the update operation using $pull to remove unlikedUser from likes
    const update = {
      $pull: { likes: unlikedUser }
    };

    // Find the user by their _id and update their likes field
    const query = { "_id": new ObjectId(loggedUser) };
    const result = await collection.updateOne(query, update);
    console.log(result);

    if (result.modifiedCount === 1) {
      // The update was successful
      res.status(200).json({ message: "User unliked successfully" });
    } else {
      // No documents matched the query, or the update didn't modify any documents
      res.status(404).json({ message: "User not found or user not liked before" });
    }
  } catch (e) {
    console.log("error: " + e);
  } finally {
    client.close();
  }
}));


app.post("/message/send", asyncMiddleware(async (req, res) => {
    
  let {chatID, messageText, sender, reciever} = req.body;

  console.log(new Date());

  const {db, client} = await database();
  try {
      const collection = db.collection('messages');

      const result = await collection.insertOne({
          chatID: chatID,
          message: messageText,
          sender: sender,
          reciever: reciever,
          sentAt: new Date()
      });

      res.json(result)

  } finally {
      client.close();
  }

}));

app.post("/messages/get", asyncMiddleware(async (req, res) => {

  let { chatID } = req.body;

  const {db, client} = await database();
  try {
      const messageCollection = db.collection('messages');
      const result = await messageCollection.find({ "chatID": chatID }).sort({ sentAt: 1 }).toArray();  // sort by date ascending

      res.json(result)

  } finally {
      client.close();
  }

}))

app.post("/messages/get-latest", asyncMiddleware(async (req, res) => {

  let { chatID } = req.body;

  const {db, client} = await database();
  try {
      const messageCollection = db.collection('messages');
      const result = await messageCollection.find({ "chatID": chatID }).sort({ sentAt: 1 }).toArray(); 
      res.json(result[0])

  } finally {
      client.close();
  }

}))



app.post("/authreq/user/send-pvq-results", asyncMiddleware(async (req, res) => {

    let {userId, results} = req.body;  
    const {db, client} = await database();
    try {
        let graphResults = results.results && Object.values(results.results).map(value => value * 20);
        console.log("Graph Results: " + graphResults);
        const collection = db.collection('users');
        //find the user 
        const query = { "_id": new ObjectId(userId) }
        const pvqPNG = graphResults && generatePVQ_PNG(graphResults);
        const pvqOutlinePNG = graphResults && generatePVQ_Outline_PNG(graphResults);
        const update = { 
            $set : { pvqAnswers: results, pvqPNG: pvqPNG, pvqOutlinePNG: pvqOutlinePNG }
        }
        const result = await collection.updateOne(query, update);

        res.json({ pvqPNG, pvqOutlinePNG }); 
    } catch (error) {

    console.error("Error updating PVQ answers:", error);
    res.status(500).json({ message: 'An error occurred while updating PVQ answers' });

    } finally {
        await client.close();
    }

}))

// Patch method used when applying partial updates to a resource.
app.patch("/authreq/updatePassword", asyncMiddleware(async (req, res) => {
  let {userId, oldPassword, newPassword} = req.body;

  const {db, client} = await database();

  try {
    const collection = db.collection('users');

    const query = { "_id" : new ObjectId(userId) };
    const options = {projection: { _id: 0, passwordHash: 1 }};
    const user = await collection.findOne(query, options);

    let currentPasswordHash = user.passwordHash;
    // Hash new password for storage.
    let newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Checks the hash of the password already in the database in comparison to the new hash from the 
    // password gathered from the frontend.
    let passwordCheck = await bcrypt.compare(oldPassword, currentPasswordHash);

    console.log(passwordCheck);

    if (passwordCheck) {
      // TODO: Remove password insertion.
      // Plaintext password storage for testing purposes only. Remove once project is complete.
      await collection.updateOne({"_id" : new ObjectId(userId)}, { $set: {password: newPassword, passwordHash: newPasswordHash}})
      // TODO: This log is for testing only, should be removed before assessment.
      console.log("User password has been changed. Check database for confirmation.");
      res.send({status: 200, message: "PASSWORD_CHANGED"})
    } else {
      res.send({status: 401, message: "INCORRECT_PASSWORD"});
      console.log("Password was not changed.");
    }
    
  } catch (error) {
    console.log("Error:", error);
    res.sendStatus(500).json({message: 'An error occurred when trying to update password.'});
  } finally {
    await client.close();
  }
}))

app.patch("/authreq/updateProfile", asyncMiddleware(async (req, res) => {
  let {userId, gender, childStatus, religion, description} = req.body;

  const {db, client} = await database();
  try {
    const collection = db.collection('users');

    await collection.updateOne({"_id" : new ObjectId(userId)}, { $set: {gender: gender, childStatus: childStatus, religion: religion, description: description}})
    
    // TODO: Does this need to be here anymore? Discuss.
    console.log("User profile details were updated!");
  } catch (error) {
    console.log("Error", error);
    res.sendStatus(500).json({message: 'An error occurred when trying to update profile.'});
  } finally {
    await client.close();
  }
  res.sendStatus(200);
}))


app.put("/authreq/updatePreferences", 
    asyncMiddleware(
        async (req, res) =>
        {
            const { userId, prefs } = req.body;

            if (!userId || !prefs)
            {
                console.log("Invalid data, cannot update preferences.");
                return;
            }

            const { db, client } = await database();

            try
            {
                const userCollection = db.collection('users');

                const queryFind = { "_id": new ObjectId(userId) };
                const queryUpdate = { $set: { preferences: prefs } };

                await userCollection.updateOne(queryFind, queryUpdate);

                res.status(200).json({ preferences: prefs });
            }
            catch(e)
            {
                console.log(e.stack)
                res.status(400).json({ message: 'Unable to update preferences.' });
            }
            finally 
            {
                client.close();
            }
        }
    )
);

app.put("/authreq/updateUser", 
    asyncMiddleware(
        async (req, res) =>
        {
            const { userId, query } = req.body;

            if (!userId || !query)
            {
                console.log("Invalid data, cannot update preferences.");
                return;
            }

            const { db, client } = await database();

            try
            {
                const userCollection = db.collection('users');

                const queryFind = { "_id": new ObjectId(userId) };

                await userCollection.updateOne(queryFind, query);

                res.status(200).json({ message: 'Updated user.' });
            }
            catch(e)
            {
                console.log(e.stack)
                res.status(400).json({ message: 'Unable to update user.' });
            } 
            finally 
            {
                client.close();
            }
        }
    )
);

// This route will generate a code for the user to use for verification, and will send the code to the user through email/sms.
app.post("/verifyEmail", asyncMiddleware(async (req, res) => {
  const {db, client} = await database();
  const { email } = req.body;
  const trimmedEmail = email.trim().toLowerCase();

  let verificationNumber = Math.floor(100000 + Math.random() * 900000);

  try {
    const collection = db.collection('users');
    const entry = await collection.findOne({email: trimmedEmail});

    if (entry === null) {
      // Setup for an email through Nodemailer
      let mailDetails = {
        from: 'myonedevelopers@gmail.com',
        to: trimmedEmail,
        subject: 'MyOne Verification',
        text: `Your verification code is: ${verificationNumber}`
      };

      // Sends the user an email with the verification code, assuming there are no problems with the configuration
      mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
          console.log('Error occurred', err);
        } else {
          console.log('Email sent successfully');
        };
      })
      // This response will have the verification number inside to be pulled out at the front end, alongside the status message.
      res.send({status: 200, message: "NEW_EMAIL_CONFIRMED", number: verificationNumber})

    } else {
      res.send({status: 409, message: "ALREADY_EXISTS"})
    }
  } catch (error) {
    console.log("Error: " + error);
  } finally {
    client.close();
  }
}))

// This is purely for generating a new code when the first attempted code entered doesn't work on signup.
// Should not be used outside of account creation.
app.get("/generateVerificationCode", asyncMiddleware(async (req, res) => {
  const { email } = req.query;
  let verificationNumber = Math.floor(100000 + Math.random() * 900000);

  let mailDetails = {
    from: 'myonedevelopers@gmail.com',
    to: email,
    subject: 'MyOne Verification',
    text: `Your verification code is: ${verificationNumber}`
  };

  // Sends the user an email with the verification code, assuming there are no problems with the configuration
  mailTransporter.sendMail(mailDetails, function(err, data) {
    if(err) {
      console.log('Error occurred', err);
    } else {
      console.log('Email sent successfully');
    };
  })

  res.send({status: 200, code: verificationNumber});
}))

// Queries the database and drops an entry based on the ID provided.
app.post("/authreq/user/delete/:id", asyncMiddleware(async (req, res) => {
  
  const userId = req.params.id;
  const { db, client } = await database();

  try {
    // TODO: Implement a check on a user's existence before deleting the entry in the table.
    // Probably unnecessary but feels like there should be at least one check before deleting.
    const collection = db.collection('users');
    const user = await collection.findOne({ "_id": new ObjectId(userId)})
    
    // TODO: May need to be removed. Discuss.
    console.log("User found!");
    
    await collection.deleteOne({ "_id": new ObjectId(userId)});
    
    // TODO: May need to be removed. Discuss.
    console.log("User Deleted!");
    
    res.sendStatus(200);

  } catch (err) {
    console.log("User not found!:" + err);
    res.sendStatus(404);
  } finally {
    client.close();
  }
}))

app.use(express.static("public"));

const server = http.Server(app);
const port = process.env.PORT;

server.listen(port, () => console.log(`server.js, process id: ${process.pid}, listening on port: ${port}`))



app.get('/load-user', (req, res) => {
  //load the user
  const inputs = Array.from({ length: 10 }, () => Math.floor(Math.random() * 91) + 10);

  res.setHeader('Content-Type', 'text/plain');
  res.send(generatePVQ_PNG(inputs));

});

app.get('/testPVQ', (req, res) => {

  // const inputs = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0];
  const inputs = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100];


  const base64_PVQ_PNG = generatePVQ_PNG(inputs);
  const base64_PVQ_Outline_PNG = generatePVQ_Outline_PNG(inputs);

  res.send(base64_PVQ_Outline_PNG);

});


app.post("/convosations/get", asyncMiddleware(async (req, res) => {

  console.log("convosations/get called");

  let { userID } = req.body;

  const {db, client} = await database();
  try {
      let matchesArray = []

      const recievedMessages = await db.collection('messages').find( { "reciever": userID }, { projection: {sender: 1, _id: 0} } ).toArray()
      const sentMessages = await db.collection('messages').find( { "sender": userID }, { projection: {reciever: 1, _id: 0} } ).toArray()
      const matches = await db.collection('users').findOne( { "_id": new ObjectId(userID) }, { projection: {matches: 1, _id: 0} } )
      const allUsers = [...new Set([...recievedMessages.map(message => message.sender), ...matches.matches, ...sentMessages.map(message => message.reciever)])]
      
      for (let i = 0; i < allUsers.length; i++) {

        const chatID = allUsers[i] < userID ? allUsers[i] + "_" + userID : userID + "_" + allUsers[i];
        let lMessage = await db.collection('messages').find({ "chatID": chatID }).sort({ sentAt: -1 }).toArray();
        if (lMessage.length === 0) { lMessage = [{message: "No messages yet", sentAt: null}] }  

        const collection = db.collection('users'); 
        const user = await collection.findOne({ "_id": new ObjectId(allUsers[i]) });

        matchesArray.push({...user, latestMessage: {content: lMessage[0].message, time: lMessage[0].sentAt} })

      }

    res.json(matchesArray)

  } catch (error) {
    console.log("Error: " + error);
  } finally {
      client.close();
  }

}))


function generatePVQ_PNG(inputs) {

  const size = 500;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const innerRadius = 100;

  slice(0, '#FF6CA2', parseInt(inputs[0]))
  slice(1, '#A1B5C0', parseInt(inputs[1]))
  slice(2, '#F99C73', parseInt(inputs[2]))
  slice(3, '#B877D5', parseInt(inputs[3]))
  slice(4, '#60CBFF', parseInt(inputs[4]))
  slice(5, '#233748', parseInt(inputs[5]))
  slice(6, '#FFD766', parseInt(inputs[6]))
  slice(7, '#49D7BD', parseInt(inputs[7]))
  slice(8, '#F9ABA7', parseInt(inputs[8]))
  slice(9, '#6C9DFC', parseInt(inputs[9]))

  function slice(index, colour, score) {
    let radius = ((score/100) * ((size - (2*innerRadius))/2)) + innerRadius;
    let maxRadius = (size/2 - 10);;
    let counterClockwise = false;
    let startAngle = ((index-1) / 10) * Math.PI * 2;
    let endAngle = (index / 10) * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, counterClockwise);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, !counterClockwise);
    ctx.closePath();
    ctx.fillStyle = colour;
    ctx.fill()

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, counterClockwise);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, !counterClockwise);
    ctx.closePath();
    ctx.setLineDash([1, 0]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size/200;
    ctx.stroke();
  }

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.setLineDash([1, 0]);
  ctx.stroke();


  const png = canvas.toBuffer("image/png");
  const base64png = `data:image/png;base64,${png.toString('base64')}`;
  return base64png;

}

function generatePVQ_Outline_PNG(inputs) {

  const size = 500;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const innerRadius = 100;

  userLines(0, parseInt(inputs[0]))
  userLines(1, parseInt(inputs[1]))
  userLines(2, parseInt(inputs[2]))
  userLines(3, parseInt(inputs[3]))
  userLines(4, parseInt(inputs[4]))
  userLines(5, parseInt(inputs[5]))
  userLines(6, parseInt(inputs[6]))
  userLines(7, parseInt(inputs[7]))
  userLines(8, parseInt(inputs[8]))
  userLines(9, parseInt(inputs[9]))

  function userLines(index, score) {

    let counterClockwise = false;
    let startAngle = ((index-1) / 10) * Math.PI * 2;
    let endAngle = (index / 10) * Math.PI * 2;

    let outlineRadius = (((score/100) * ((size - (2*innerRadius))/2)) + innerRadius)

    ctx.beginPath();
    ctx.arc(centerX, centerY, outlineRadius, startAngle, endAngle, counterClockwise);
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; 
    ctx.lineWidth = 2; 
    ctx.setLineDash([5, 3]);
    ctx.stroke();

    var xOuterStart = centerX + Math.cos(startAngle) * outlineRadius;
    var yOuterStart = centerY + Math.sin(startAngle) * outlineRadius;
    var xInnerStart = centerX + Math.cos(startAngle) * innerRadius;
    var yInnerStart = centerY + Math.sin(startAngle) * innerRadius;

    var xOuterEnd = centerX + Math.cos(endAngle) * outlineRadius;
    var yOuterEnd = centerY + Math.sin(endAngle) * outlineRadius;
    var xInnerEnd = centerX + Math.cos(endAngle) * innerRadius;
    var yInnerEnd = centerY + Math.sin(endAngle) * innerRadius;

    
    ctx.beginPath();
    ctx.moveTo(xInnerStart, yInnerStart);
    ctx.lineTo(xOuterStart, yOuterStart);
    ctx.moveTo(xInnerEnd, yInnerEnd);
    ctx.lineTo(xOuterEnd, yOuterEnd);
    ctx.setLineDash([1, 0]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size/200;
    ctx.stroke();

  }

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.setLineDash([1, 0]);
  ctx.stroke();


  const png = canvas.toBuffer("image/png");
  const base64png = `data:image/png;base64,${png.toString('base64')}`;
  return base64png;

}

app.post("/user/add-field", asyncMiddleware(async (req, res) => {
//this code will add a field to all users in the db. 
  const { db, client } = await database();

  try {
    const collection = db.collection('users');  
    const updateOperation = {
      //use this endpoint to add a field to all users in db.
      //$set: { notifications: [] }
    };
 
    const result = await collection.updateMany({}, updateOperation); 
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Successfully added field to all users." });
    } else {
      res.status(200).json({ message: "No users were updated." });
    }

  } catch (e) {
    console.error("Error: " + e);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.close();
  }
}));

export default app;