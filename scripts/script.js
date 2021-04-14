//import AgoraRTC from "agora-rtc-sdk";

// steps:
// 1. initialize a client Object
// 2. join a channel -> generate a token for the server

// 3. create a local video stream $ publish
// 4. subscribe to the streams of remote users
// 5. leave the channel

// [HELLO] client initialized
// script.js:66 [HELLO] client.join( -a
// script.js:82 [HELLO] client.join( -x
// script.js:95 [HELLO] client.on( stream-subscribed -a
// script.js:23 [HELLO] addVideoStream -a
// script.js:32 [HELLO] addVideoStream -x
// script.js:101 [HELLO] client.on( stream-subscribed -x
// script.js:116 [HELLO] client.on( peer-leave -a
// script.js:37 [HELLO] removeVideoStream -a
// script.js:41 [HELLO] removeVideoStream -x
// script.js:122 [HELLO] client.on( peer-leave -x

// Handle errors.
let handleError = function (err) {
  console.log("Error: ", err);
};

let note = "[HELLO] ";

// Query the container to which the remote stream belong.
let remoteContainer = document.getElementById("remote-container");

// Add video streams to the container.
function addVideoStream(elementId) {
  console.log(note + "addVideoStream -a");
  // Creates a new div for every stream
  let streamDiv = document.createElement("div");
  // Assigns the elementId to the div.
  streamDiv.id = elementId;
  // Takes care of the lateral inversion
  streamDiv.style.transform = "rotateY(180deg)";
  // Adds the div to the container.
  remoteContainer.appendChild(streamDiv);
  console.log(note + "addVideoStream -x");
}

// Remove the video stream from the container.
function removeVideoStream(elementId) {
  console.log(note + "removeVideoStream -a");

  let remoteDiv = document.getElementById(elementId);
  if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
  console.log(note + "removeVideoStream -x");
}

//---------------------- 1 initialize a client object
let client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

client.init(
  "387c734019cd4bf28ec4f3045ff02377", //appID
  function () {
    console.log(note + "client initialized");
  },
  function (err) {
    console.log(note + "client init failed ", err);
  }
);

//---------------------- 2 join a channel
client.join(
  null,
  "myChannel",
  null,
  (uid) => {
    console.log(note + "client.join( -a");

    // Create a local stream
    let localStream = AgoraRTC.createStream({
      audio: false,
      video: true,
    });

    // Initialize the local stream
    localStream.init(() => {
      // Play the local stream
      localStream.play("me");
      // Publish the local stream
      client.publish(localStream, handleError);
    }, handleError);

    console.log(note + "client.join( -x");
  },
  handleError
);

//---------------------- 3 create and publish

// Subscribe to the remote stream when it is published
client.on("stream-added", function (evt) {
  client.subscribe(evt.stream, handleError);
});
// Play the remote stream when it is subsribed
client.on("stream-subscribed", function (evt) {
  console.log(note + "client.on( stream-subscribed -a");

  let stream = evt.stream;
  let streamId = String(stream.getId());
  addVideoStream(streamId);
  stream.play(streamId);
  console.log(note + "client.on( stream-subscribed -x");
});

// Remove the corresponding view when a remote user unpublishes.
client.on("stream-removed", function (evt) {
  console.log(note + "client.on( stream-removed -a");

  let stream = evt.stream;
  let streamId = String(stream.getId());
  stream.close();
  removeVideoStream(streamId);
  console.log(note + "client.on( stream-removed -x");
});
// Remove the corresponding view when a remote user leaves the channel.
client.on("peer-leave", function (evt) {
  console.log(note + "client.on( peer-leave -a");

  let stream = evt.stream;
  let streamId = String(stream.getId());
  stream.close();
  removeVideoStream(streamId);
  console.log(note + "client.on( peer-leave -x");
});
