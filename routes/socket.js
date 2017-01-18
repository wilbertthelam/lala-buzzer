var express = require('express');
var router = express.Router();

module.exports = function(io) {
	var currentState = 'OPEN';
	var winnerId = '';

	var nameDict = {}

	// on client connection to the socket server
	io.on('connection', function(socket) {
		console.log('user connected: ' + socket.id);

		// print users in the room
		var users = io.sockets.adapter.rooms;
		console.log('[');
		var userCount = 0;
		var userNames = []
		for (var user in users) {
			console.log(user);
			userCount += 1;
			userNames.push(nameDict[user]);
		}
		console.log(']');

		// emit list of connected users on connection
		io.emit('listOfConnected', {
			names: userNames
		});

		// on default, name is the client id
		nameDict[socket.id] = socket.id

		socket.on('nameSet', function (data) {
			nameDict[data.clientId] = data.name;
			console.log(JSON.stringify(nameDict));
			
			// every time a user updates their name, update name list
			var userNames = [];
			for (var user in io.sockets.adapter.rooms) {
				console.log(user);
				console.log(nameDict[user]);
				userNames.push(nameDict[user]);
			}

			io.emit('listOfConnected', {
				names: userNames
			});
		});

		// on connection, update the status of the winner if 
		// already pre-existing session going on
		if (currentState === 'CLOSED')
			io.emit('clickRegistered', { winnerId: winnerId, winnerName: nameDict[winnerId] });


		// registers when a user has clicked their button
		socket.on('clicked', function (data) {
			console.log('User clicked: ' + data.clientId);

			winnerId = data.clientId;
			if (currentState === 'OPEN') {
				currentState = 'CLOSED';
				io.emit('clickRegistered', 
					{ winnerId: winnerId, winnerName: nameDict[winnerId] }
				);
			}
		});

		// registers when the room is reset
		socket.on('reset', function () {
			currentState = "OPEN";
			console.log(currentState);
			io.emit('resetRegistered');
		});
		
		// on disconnect, update the connected usernames
		socket.on('disconnect', function () {
			// every time a user updates their name, update name list
			var userNames = [];
			for (var user in io.sockets.adapter.rooms) {
				console.log(user);
				console.log(nameDict[user]);
				userNames.push(nameDict[user]);
			}

			io.emit('listOfConnected', {
				names: userNames
			});
		});
	});
};
