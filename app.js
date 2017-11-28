const WebSocket = require('ws');
const redis = require('redis');

// config for redis.
// port number and host name of redis are loaded from environment variables.
// if they don't exist, setup with deafult values.
const redis_port = process.env.REDIS_PORT ? process.env.REDIS_PORT : 6379;
const redis_host_name = process.env.REDIS_HOST_NAME ? process.env.REDIS_HOST_NAME : 'localhost';
const subscriber = redis.createClient(redis_port, redis_host_name);
const publisher = redis.createClient(redis_port, redis_host_name);

// config for websocket
// basicaly similar to redis.
const websocket_port = process.env.WEBSOCKET_PORT ? process.env.WEBSOCKET_PORT : 8080;
const wss = new WebSocket.Server({ port: websocket_port });

// channel name
let global_chat_channel = "global_chat_channel";

wss.on('connection', function connection(ws) {
  // register redis as subscriber
  subscriber.subscribe(global_chat_channel);

  // an message reached from clients
  ws.on('message', function (data) {
    // JSON-ize message (for test)
    let send_data = JSON.stringify({"body": data});
    console.log(send_data);
    // publish to global_chat_channel on redis
    publisher.publish(global_chat_channel, send_data);
  });

  // an message reached from redis
  subscriber.on("message", function(channel, message) {
    let msg = JSON.parse(message);
    ws.send(msg["body"]);
  });
});


