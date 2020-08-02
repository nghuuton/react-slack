import firebase from "firebase";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var config = {
    apiKey: "AIzaSyDkzhRaSwbWa65G4GYyxzQUUtpLbrwo4vU",
    authDomain: "react-slack-28784.firebaseapp.com",
    databaseURL: "https://react-slack-28784.firebaseio.com",
    projectId: "react-slack-28784",
    storageBucket: "react-slack-28784.appspot.com",
    messagingSenderId: "511465484618",
    appId: "1:511465484618:web:30b5f8c67f3352a58911b3",
    measurementId: "G-615NSTJYWM",
};

firebase.initializeApp(config);

export default firebase;
