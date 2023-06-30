// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, set, onValue, child, push, update, get, remove } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);
const db = getDatabase();
const ContactsRef = ref(db, 'contact');

// Main DOM Elements
const loader = document.getElementById("loader")
const updatedForm = document.getElementById("updatedForm");


/* Header */
// define DOM elements
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

// menu bar and nav
menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden")
})
/* Header */


/* Manage Tabs */
// define DOM elements
const tabOverview = document.getElementById("tab-overview");
const tabAdd = document.getElementById("tab-add");
const tabUpdate = document.getElementById("tab-update");
const tabDelete = document.getElementById("tab-delete");
const overview = document.getElementById("overview");
const addWidget = document.getElementById("add-widget");
const updateWidget = document.getElementById("update-widget");
const deleteWidget = document.getElementById("delete-widget");

tabAdd.addEventListener("click", () => {
    overview.hidden = true
    addWidget.hidden = false
    updateWidget.hidden = true
    deleteWidget.hidden = true
})

tabOverview.addEventListener("click", () => {
    overview.hidden = false
    addWidget.hidden = true
    updateWidget.hidden = true
    deleteWidget.hidden = true
    isUpdate = false;
    isDelete = false;
    getAllContact()

})

tabUpdate.addEventListener("click", () => {
    overview.hidden = true
    addWidget.hidden = true
    updateWidget.hidden = false
    deleteWidget.hidden = true
    isUpdate = true;
    isDelete = false;
    getAllContact()
})
tabDelete.addEventListener("click", () => {
    overview.hidden = true
    addWidget.hidden = true
    updateWidget.hidden = true
    deleteWidget.hidden = false
    isDelete = true;
    isUpdate = false;
    getAllContact()
})
/* Manage Tabs */

// add new contact
const addForm = document.getElementById("add-form");

function addNewContact(websiteName, websiteLink, icon) {
    const newContactIdRef = push(ContactsRef);
    const newContactId = newContactIdRef.key;
    if (!newContactId) {
        showAlert("Invalid ContactId", "danger")
        return;
    }
    loader.hidden = false;
    set(newContactIdRef, {
        websiteName: websiteName,
        websiteLink: websiteLink,
        websiteIcon: icon,
    })
        .then(() => {
            showAlert("Contact success Added", "success");
            loader.hidden = true;
        })
        .catch((error) => {
            showAlert(error, "danger");
        });
}

addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const websiteName = addForm.websiteName.value;
    const websiteIcon = addForm.websiteIcon.value;
    const websiteLink = addForm.websiteLink.value;
    addNewContact(websiteName, websiteIcon, websiteLink)
})


// Read Data and Display It
let count = 0;
let isUpdate = false;
let isDelete = false;

const getAllContact = () => {
    const overflowTableBody = document.querySelector("#overviewTable tbody")
    const updateTableBody = document.querySelector("#updateTable tbody")
    const deleteTableBody = document.querySelector("#deleteTable tbody")

    onValue(ContactsRef, (snapshot) => {
        const contacts = snapshot.val();
        overflowTableBody.innerHTML = '';
        updateTableBody.innerHTML = '';
        deleteTableBody.innerHTML = '';
        let data;
        count = 0;
        for (let contact in contacts) {
            count++;
            if (isUpdate) {
                data = `<tr data-id=${contact}>
                    <td class="count bg-blue-500  text-white hover:bg-blue-700 text-center font-bold">${count}</td>
                    <td>${contacts[contact].websiteName}</td>
                    <td>${contacts[contact].websiteLink}</td>
                    <td>${contacts[contact].websiteIcon}</td>
                    <td>
                        <button data-bs-toggle="modal" data-bs-target="#updateModal" data-bs-whatever="@mdo"
                            class="updateBtn text-white bg-green-500 hover:bg-green-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium block">Update</button>
                    </td>
                </tr >`
                updateTableBody.innerHTML += data;
            } else if (isDelete) {
                data = `<tr data-id=${contact}>
                <td class="count bg-blue-500 text-white hover:bg-blue-700 text-center font-bold">${count}</td>
                <td>${contacts[contact].websiteName}</td>
                <td>${contacts[contact].websiteLink}</td>
                <td>${contacts[contact].websiteIcon}</td>
                <td>
                    <button class="deleteBtn text-white bg-red-500 hover:bg-red-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium block">Delete</button>
                </td>
            </tr >`
                deleteTableBody.innerHTML += data;
            }

            else {
                data = `
                <tr data-id=${contact}>
                    <td class="count bg-blue-500 text-white hover:bg-blue-700 text-center font-bold">${count}</td>
                    <td>${contacts[contact].websiteName}</td>
                    <td>${contacts[contact].websiteLink}</td>
                    <td>${contacts[contact].websiteIcon}</td>
                </tr >`;
                overflowTableBody.innerHTML += data;
            }
        }
    })

    //update

    const updateContact = (contactId) => {
        // update data in ui
        console.log(updatedForm)
        get(child(ContactsRef, contactId)).then(snapshot => {
            const data = snapshot.val();
            updatedForm.websiteName.value = data.websiteName;
            updatedForm.websiteIcon.value = data.websiteIcon;
            updatedForm.websiteLink.value = data.websiteLink;
        }).catch(error => showAlert(error, "danger"));
    }
    const updateBtns = updateTableBody.querySelectorAll("button");
    updateBtns.forEach(updateBtn => {
        updateBtn.addEventListener("click", (e) => {
            console.log(updateBtn)
            const contactId = e.target.parentElement.parentElement.dataset.id
            updateContact(contactId);
            updatedForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                // Show the loader element
                loader.hidden = false;
                try {
                    const newData = {
                        websiteName: updatedForm.websiteName.value,
                        websiteIcon: updatedForm.websiteIcon.value,
                        websiteLink: updatedForm.websiteLink.value
                    };
                    // Hidden the loader element
                    loader.hidden = true;
                    update(child(ContactsRef, contactId), newData)
                    showAlert("Contact Updated Successfully", "success");
                } catch (error) {
                    showAlert(error, "danger");
                    // Hidden the loader element
                    loader.hidden = true;
                }
            });
        });
    });
    // Delete 
    const deleteBtns = deleteTableBody.querySelectorAll("button");
    deleteBtns.forEach(deleteBtn => {
        deleteBtn.addEventListener("click", (e) => {
            const ContactId = e.target.parentElement.parentElement.dataset.id
            const ContactRef = child(ContactsRef, ContactId);
            remove(ContactRef)
                .then(() => {
                    showAlert("Contact Successfully Deleted", "success")
                    console.log("Contact Successfully Deleted")
                    deleteTableBody.innerHTML = "";
                    getAllContact();
                })
                .catch((error) => {
                    showAlert(error, "danger");
                    console.log(error)
                });
        })
    })
}

tabOverview.click();

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

    // const alert = bootstrap.Alert.getOrCreateInstance('[alert]');
    // setTimeout(() => {
    //     alert.close();
    // }, 8000);
};

const checkLogin = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
        // window.location.href = 'index.html';
        console.log("test")
    }
    else {
        window.location.href = 'login.html';
    }
};

checkLogin()