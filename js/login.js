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
            showAlert("User is signed in", "success");
            localStorage.setItem("isLoggedIn", true);
            checkLogin();
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            showAlert(`${"Error: ", errorMessage}`, "danger");
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


const showAlert = (message, type) => {
    const alertsHolder = document.querySelector(".alerts-holder")
    const successAlert = document.querySelector('.success-alert');
    const dangerAlert = document.querySelector('.danger-alert');
    const appendAlert = () => {
        alertsHolder.hidden = false
        if (type == "success") {
            successAlert.hidden = false
            dangerAlert.hidden = true
            successAlert.textContent = message
        } else {
            successAlert.hidden = true
            dangerAlert.hidden = false
            dangerAlert.textContent = message
        }
    };
    appendAlert();

    const alert = bootstrap.Alert.getOrCreateInstance('[alert]');
    setTimeout(() => {
        alert.close();
    }, 8000);
};


const passwordInput = document.querySelector('#password');
const togglePasswordBtn = document.querySelector('#togglePasswordBtn');

togglePasswordBtn.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
});
