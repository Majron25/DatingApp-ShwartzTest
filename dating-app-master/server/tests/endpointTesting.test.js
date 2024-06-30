import test from 'ava';
import request from 'supertest';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';

import app from '../server.js';
import testUser from './testUser.json' assert {type: 'json'};
import testUser2 from './testUser2.json' assert {type: 'json'};

// User id to be used for deletion test.
let userId;
let userTwoId;
let authToken;
let userTwoAuthToken; 

test.before(async t => {
    // Start MongoDB instance
    t.context.mongod = await MongoMemoryServer.create();
    // And connect
    await mongoose.connect(t.context.mongod.getUri());

    // Set the amount of time that can pass before a test times out.
    t.timeout(20000);
});

// Test expects user to be successfully created. Fails if user is not created.
test.serial('Create user', async t => {
    const res = await request(app)
                .post('/user/new')
                .send(testUser);
    t.is(res.status, 200, "Failed to create account!");
    
    // Extract and store the user ID for later tests.
    userId = res.body.insertedId;
});

// Test expects entered email address to exist in the database. Fails if email doesn't exist.
test.serial('Verify Email', async t => {
    const res = await request(app)
                .post('/verifyEmail')
                .send({ email: testUser.email
            });
    t.is(res.body.status, 409, "Failed to verify email!");
});

// Test expects the previously created user to exist in the database. Fails if not.
test.serial('Find User', async t => {
    let { email, password } = testUser;
    const res = await request(app)
                .post('/findUser')
                .send({ email, password 
                });
    
    // Extract the authentication token to be used in later tests.
    authToken = res.body.token;
    
    t.is(res.body.status, 200, "Failed to find account!");
});

// Test expects to return an array of users to be used on the matches page. Fails if unsuccessful.
test.serial('Get users for Matches page', async t => {
    let numToSkip = 0;
    let maxNumMatches = 10;
    let sortId = "values";
    const res = await request(app)
                .get(`/authreq/user/get-users-for-matches-page?numToSkip=${numToSkip}&maxNumMatches=${maxNumMatches}&loggedUserId=${userId}&sortId=${sortId}`)
                .set("authorization", `Bearer ${authToken}`)
    t.is(res.status, 200, "Failed to return users for matches page!");
});

// Test expects to create a second user to be used in further tests. The new user's ID and authtoken are 
// extracted. Fails if the user is not created, or if the new user can't be found in the database.
test.serial('Create another user', async t => {
    const new_user = await request(app)
                    .post('/user/new')
                    .send(testUser2);
    
    userTwoId = new_user.body.insertedId;
    
    let { email, password } = testUser2;
    const new_user_details = await request(app)
                .post('/findUser')
                .send({ email, password 
                });
    
    userTwoAuthToken = new_user_details.body.token;

    t.is(new_user.status, 200, "Failed to create account!");
    t.is(new_user_details.body.status, 200, "Failed to find account!")
});

// Test expects a message to successfully be sent to testUserTwo from testUser. Fails if unsuccessful.
test.serial('Send message to user', async t => {
    let chatId =  userId < userTwoId ?  `${userId}_${userTwoId}` : `${userTwoId}_${userId}`
    const res = await request(app)
                .post('/message/send')
                .send({chatID: chatId, messageText: "Testing message", sender: userId, reciever: userTwoId});

    t.is(res.status, 200, "Sending message failed!");
});

// Test expects the old password to be replaced with the new password. Fails if unsuccessful.
test.serial('Update Password', async t => {
    let oldPassword = testUser.password;
    let newPassword = "updatedTestingPassword";
    const res = await request(app)
                .patch('/authreq/updatePassword')
                .set("authorization", `Bearer ${authToken}`)
                .send({userId, oldPassword, newPassword});
    t.is(res.status, 200, "Changing password failed!");
});

// Test expects a change of each profile field to be successful. Fails if unsuccessful.
test.serial('Update Profile', async t => {
    let gender = "F";
    let sexPref = "M";
    let childStatus = 1;
    let religion = 2;
    let description = "Updated testing description";
    const res = await request(app)
                .patch('/authreq/updateProfile')
                .set("authorization", `Bearer ${authToken}`)
                .send({userId, gender, childStatus, religion, description});
    t.is(res.status, 200, "Failed to update user!");
});

// Test expects the previously created users to be deleted from the database, based on the IDs. Fails if the accounts
// are not deleted.
test.serial('Delete User', async t => {
    const res1 = await request(app)
                .post(`/authreq/user/delete/${userId}`)
                .set("authorization", `Bearer ${authToken}`)
                .send({ id: userId});
    
    const res2 = await request(app)
                .post(`/authreq/user/delete/${userTwoId}`)
                .set("authorization", `Bearer ${userTwoAuthToken}`)
                .send({ id: userTwoId});
                
    t.is(res1.status, 200, "Failed to delete user!");
    t.is(res2.status, 200, "Failed to delete user two!");
});

// Disconnect from and stop MongoDB when all tests are complete.
test.after.always(async t => {
    await mongoose.disconnect();
    await t.context.mongod.stop();
});
