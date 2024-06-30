// import test from 'ava';
// import fetch from 'node-fetch';
// import testUser from './testUser.json' assert {type: 'json'}


// test('createNewUser', async t => {
// 	// Assuming testUser is defined and contains valid user data

// 	// Create a new user
// 	const createUserResponse = await fetch("http://localhost:2023/user/new", {
// 		method: 'POST',
// 		body: JSON.stringify(testUser),
// 		headers: { 'Content-Type': 'application/json' }
// 	});

// 	const createUserResult = await createUserResponse.json();

// 	// Check if there is no error when creating a user
// 	t.assert(!createUserResult.error, "Error occurred while creating a user");

// 	// Find the created user
// 	const findUserResponse = await fetch("http://localhost:2023/findUser", {
// 		method: 'POST',
// 		body: JSON.stringify({ email: testUser.email, password: testUser.password }),
// 		headers: { 'Content-Type': 'application/json' }
// 	});

// 	const findUserResult = await findUserResponse.json();

// 	// Check if the user was found
// 	t.assert(findUserResult.user, "User was not found");

// 	// Delete the created user
// 	const deleteUserId = findUserResult.id;
// 	const deleteUserResponse = await fetch(`http://localhost:2023/user/delete`, {
// 		method: 'POST',
// 		body: JSON.stringify(findUserResult.id),
// 		headers: { 'Content-Type': 'application/json' }
// 	});

// 	const deleteUserResult = await deleteUserResponse.json();

// 	// Check if there is no error when deleting the user
// 	t.assert(!deleteUserResult.error, "Error occurred while deleting the user");
// });

// test('deleteUser', async t => {
// 	// Find the user
// 	const findUserResponse = await fetch("http://localhost:2023/findUser", {
// 		method: 'POST',
// 		body: JSON.stringify({ email: testUser.email, password: testUser.password }),
// 		headers: { 'Content-Type': 'application/json' }
// 	});

// 	const findUserResult = await findUserResponse.json();

// 	// Check if the user was found
// 	t.assert(findUserResult.user, "User was not found");

// 	// Delete the user
// 	const deleteUserId = findUserResult.id;
// 	const deleteUserResponse = await fetch("http://localhost:2023/user/delete", {
// 		method: 'POST',
// 		body: JSON.stringify(deleteUserId),
// 		headers: { 'Content-Type': 'application/json' }
// 	});

// 	const deleteUserResult = await deleteUserResponse.json();

// 	t.assert(!deleteUserResult.error, "Error occurred whilst deleting user");
// });

/*test('post test', async t => {

	let r = await fetch("http://localhost:2023/user/new", {
		method: 'POST',
		body: JSON.stringify(testUser),
		headers: { 'Content-Type': 'application/json' }
	});
	r = await r.json()

	t.assert(!r.error, "error?")

})*/