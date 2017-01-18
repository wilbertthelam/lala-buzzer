var express = require('express');
var router = express.Router();

module.exports = function(io) {
	var currentState = 'OPEN';
	var winnerId = '';
	io.on('connection', function(socket) {
		console.log('user connected: ' + socket.id);
		io.emit('clickRegistered', { winnerId: winnerId });

		// print users in the room
		var users = io.sockets.adapter.rooms;
		console.log('[');
		var userCount = 0;
		for (var user in users) {
			console.log(user);
			userCount += 1;
		}
		console.log(']');


		// registers when a user has clicked their button
		socket.on('clicked', function (data) {
			console.log('User clicked: ' + data.clientId);

			winnerId = data.clientId;
			if (currentState === 'OPEN') {
				currentState = 'CLOSED';
				io.emit('clickRegistered', { winnerId: winnerId });
			}
		});

		// registers when the room is reset
		socket.on('reset', function () {
			currentState = "OPEN";
			console.log(currentState);
			io.emit('resetRegistered');
		});
		
	});
};
