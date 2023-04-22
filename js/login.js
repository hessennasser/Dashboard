// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCj2bwm8YdABjgfqm_UrQot0YAD8OFB8Og",
    authDomain: "smartdev-dashboard.firebaseapp.com",
    databaseURL: "https://smartdev-dashboard-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "smartdev-dashboard",
    storageBucket: "smartdev-dashboard.appspot.com",
    messagingSenderId: "567753932941",
    appId: "1:567753932941:web:96d7ce959c2057a67fe2c4",
    measurementId: "G-D614MJ7LJK"
};
firebase.initializeApp(firebaseConfig);

const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', function (event) {
    event.preventDefault(); // prevent the form from submitting

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            // User is signed in.
            console.log("User is signed in");
            localStorage.setItem("isLoggedIn", true);
            checkLogin();
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error: ", errorMessage);
        });
});

// ------------ Check if user is logged in ------------- //
const checkLogin = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn) {
        console.log("logged")
        window.location.href = 'index.html';
    }
};
window.addEventListener("load", checkLogin)