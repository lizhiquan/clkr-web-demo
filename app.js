const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = 8000;
const leaderboard = {};

const userIdGenerator = (function* () {
  let start = 1;
  while (true)
    yield start++;
})();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  // Client did connect
  let userId = userIdGenerator.next().value;
  console.log(`User #${userId} has connected`);

  // Init click count
  leaderboard[userId] = 0;

  // Returns the generated user id to client
  socket.emit('id', userId);

  // Returns current leaderboard
  io.emit('leaderboard', leaderboard);

  // Client's click event
  socket.on('click', () => {
    leaderboard[userId]++;
    // Update leaderboard on all clients
    io.emit('leaderboard', leaderboard);
  });

  // Client did disconnect
  socket.on('disconnect', () => {
    console.log(`User #${userId} disconnected`);
    delete leaderboard[userId];
    // Update leaderboard on all clients
    io.emit('leaderboard', leaderboard);
  });
});

http.listen(port, () => {
  console.log('App is running on port ' + port);
});