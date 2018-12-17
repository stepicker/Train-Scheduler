$(document).ready(function() {


// DATABASE
// ==================================================

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAWz_zkDyU09Xtu2nLzdw0LpQD3-6pvegg",
    authDomain: "train-scheduler-e686f.firebaseapp.com",
    databaseURL: "https://train-scheduler-e686f.firebaseio.com",
    projectId: "train-scheduler-e686f",
    storageBucket: "train-scheduler-e686f.appspot.com",
    messagingSenderId: "373519394339"
  };

  firebase.initializeApp(config);


// VARIABLES
// ==================================================

// Database
var database = firebase.database();

// Global variables for user input
var trainName;
var trainDestination;
var trainFirstTime;
var trainFrequency;


// FUNCTIONS FOR LATER USE
// ==================================================

function msToMinutes(ms) {
    var minutes = Math.floor(ms / 60000);
    return minutes;
}


// MAIN PROCESS
// ==================================================

// Add new trains to the database, based on user input
$("#train-submit").on("click", function(event) {

    event.preventDefault();

    // Saving user input as local variables
    trainName = $("#train-name").val().trim();
    trainDestination = $("#destination").val().trim();
    trainFirstTime = $("#first-time").val().trim();
    trainFrequency = $("#frequency").val().trim();
    
    // Pushing to the database
    database.ref().push({
        trainName: trainName,
        trainDestination: trainDestination,
        trainFirstTime: trainFirstTime,
        trainFrequency: trainFrequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
  });

});

// Get updates from the database, and populate the schedule accordingly
database.ref().orderByChild("dateAdded").on("child_added", function(snapshot) {

    // Current Time
    var currentTime = moment().format("HH:mm");
    console.log("-----");
    console.log("Current time: " + currentTime);
    console.log("Key: " + snapshot.key);

    // Storing the snapshot.val() in a variable for convenience
    var sv = snapshot.val();

    // Logging data received from the database
    console.log("Train Name: " + sv.trainName);
    console.log("Destination: " + sv.trainDestination);
    var firstTime = sv.trainFirstTime;
    var frequency = sv.trainFrequency;
    console.log("First Time: " + firstTime);
    console.log("Frequency: " + frequency);

    // Calculating minutes away
    var msDifference = moment(currentTime,"HH:mm").diff(moment(firstTime,"HH:mm"));
    var minDifference = msToMinutes(msDifference);
    console.log("Time from First Train (in minutes): " + minDifference);


    if (minDifference > 0) {
        var minsAway = (frequency - (minDifference % frequency));
        var nextTrain = moment(currentTime, "HH:mm").add(minsAway, "minutes").format("HH:mm");
    }

    else {
        var minsAway = Math.abs(minDifference);
        var nextTrain = firstTime;
    }

    console.log("Next Train: " + nextTrain);
    console.log("Minutes Away: " + minsAway);

    // Populate the HTML
    $("#schedule").append("<tr id='" + snapshot.key + "'><td>" + sv.trainName + "</td><td>" + sv.trainDestination + "</td><td>" + sv.trainFrequency + "</td><td>" + moment(nextTrain, "HH:mm").format("hh:mm a") + "</td><td>" + minsAway + "</td><td><button type='button' data-key='" + snapshot.key + "' class='btn btn-danger btn-sm'>Delete</button></td></tr>");

    // Handle the errors
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// Manage train deletion
$(document).on("click", ".btn-danger", function(){

    var key = $(this).attr("data-key");
    database.ref().child(key).remove();
    $("#" + key).remove();

});

});