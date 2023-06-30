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
const projectsRef = ref(db, 'projects');

// define DOM elements
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const loader = document.getElementById("loader")
const addForm = document.getElementById("add-form");
const resetBtn = document.getElementById("reset-btn");
const tabOverview = document.getElementById("tab-overview");
const tabAdd = document.getElementById("tab-add");
const tabUpdate = document.getElementById("tab-update");
const tabDelete = document.getElementById("tab-delete");
const overview = document.getElementById("overview");
const addWidget = document.getElementById("add-widget");
const updateWidget = document.getElementById("update-widget");
const deleteWidget = document.getElementById("delete-widget");
const updatedForm = document.getElementById("updatedForm");
const logoutBtn = document.getElementById("logoutBtn");

// menu bar and nav
menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden")
})

// manage tabs 
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
    console.log(
        {
            overview: overview.hidden,
            addWidget: addWidget.hidden,
            updateWidget: updateWidget.hidden,
            deleteWidget: deleteWidget.hidden
        }
    );
    isUpdate = false;
    isDelete = false;
    getAllProjects()

})

tabUpdate.addEventListener("click", () => {
    overview.hidden = true
    addWidget.hidden = true
    updateWidget.hidden = false
    deleteWidget.hidden = true
    isUpdate = true;
    isDelete = false;
    getAllProjects()
})
tabDelete.addEventListener("click", () => {
    overview.hidden = true
    addWidget.hidden = true
    updateWidget.hidden = true
    deleteWidget.hidden = false
    isDelete = true;
    isUpdate = false;
    getAllProjects()
})

// add new project
function addNewProject(img, name, alt, category, repoLink, demoLink) {
    const newProjectIdRef = push(projectsRef);
    const newProjectId = newProjectIdRef.key;
    if (!newProjectId) {
        showAlert("Invalid ProjectId", "danger")
        return;
    }
    set(newProjectIdRef, {
        projectImg: img,
        projectName: name,
        altText: alt,
        category: category,
        repositoryLink: repoLink,
        demoLink: demoLink,
    })
        .then(() => {
            showAlert("Project success Added", "success");
        })
        .catch((error) => {
            showAlert(error, "danger");
        });
}

const imgBBApiKey = '88d6334e45acaad0daeda01860d2084f';

async function uploadImageToImgBB(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('key', imgBBApiKey);

    const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 200) {
        throw new Error(`Failed to upload image: ${data.status_message}`);
    }
    return data.data.url;
}

addForm.imgUpdate.addEventListener("change", (e) => {
    const imagePlaceholder = document.getElementById("imagePlaceholder");
    imagePlaceholder.style.display = "none"
    const file = e.target.files[0];
    document.querySelector(".projectImgName").textContent = `("${file.name}")`;

    const reader = new FileReader();
    reader.onload = (e) => {
        document.querySelector(".projectImgPreview").src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Set up the listener for the form submit event
addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Show the loader element
    loader.hidden = false;

    // Get the file from the file input element
    const file = addForm.imgUpdate.files[0];

    try {
        // Upload the file to imgBB and get the URL
        const imgUrl = await uploadImageToImgBB(file);
        // Get the rest of the form data
        const projectName = addForm.projectName.value;
        const altText = addForm.altText.value;
        const category = addForm.category.value;
        const repoLink = addForm.repoLink.value;
        const demoLink = addForm.demoLink.value;

        // Add the new project to the database
        await addNewProject(imgUrl, projectName, altText, category, repoLink, demoLink);

        // Hide the loader element
        loader.style.display = "none";

        // Clear the form
        addForm.reset();
        window.location.reload();
        // Show a success message
        showAlert("Project successfully Added", "success");
    } catch (error) {
        showAlert(error, "danger");

        // Hide the loader element
        loader.hidden = true;

        // Show an error message
        showAlert("Error adding project. Please try again later.", "danger")
    }
});

resetBtn.addEventListener("click", () => {
    document.getElementById("imagePlaceholder").style.display = "block";
    document.querySelector(".projectImgName").textContent = ``;
    document.querySelector(".projectImgPreview").hidden = true;
})

// read data and add it to overview table
let count = 0;
let isUpdate = false;
let isDelete = false;
const getAllProjects = () => {
    count = 0;
    const overflowTableBody = document.querySelector("#overviewTable tbody")
    const updateTableBody = document.querySelector("#updateTable tbody")
    const deleteTableBody = document.querySelector("#deleteTable tbody")
    const starCountRef = ref(db, 'projects');
    onValue(starCountRef, (snapshot) => {
        const projects = snapshot.val();
        overflowTableBody.innerHTML = '';
        updateTableBody.innerHTML = '';
        deleteTableBody.innerHTML = '';
        let data;
        let categoryColor = "";
        for (let project in projects) {
            if (projects[project].category == "websites") {
                categoryColor = "bg-green-500"
            } else if (projects[project].category == "js") {
                categoryColor = "bg-cyan-600"
            } else if (projects[project].category == "react") {
                categoryColor = "bg-blue-500"
            }
            count++;
            if (isUpdate) {
                data = `<tr data-id=${project}>
                    <td class="count bg-blue-500  text-white hover:bg-blue-700 text-center font-bold">${count}</td>
                    <td>${projects[project].projectName}</td>
                    <td>${projects[project].altText}</td>
                    <td class="category ${categoryColor} text-white text-center uppercase">${projects[project].category}</td>
                    <td><a class="underline text-red-800" href="${projects[project].repositoryLink}" target="_blank">${projects[project].repositoryLink}</a></td>
                    <td><a class="underline text-red-800" href="${projects[project].demoLink}" target="_blank">${projects[project].demoLink}</a></td>
                    <td>
                        <a class="underline text-red-800" href="${projects[project].projectImg}" target="_blank">${projects[project].altText}</a>
                    </td>
                    <td>
                        <button id="updateBtn" data-bs-toggle="modal" data-bs-target="#updateModal" data-bs-whatever="@mdo"
                            class="text-white bg-green-500 hover:bg-green-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium block">Update</button>
                    </td>
                </tr >`
                updateTableBody.innerHTML += data;
            } else if (isDelete) {
                data = `<tr data-id=${project}>
                <td class="count bg-blue-500 text-white hover:bg-blue-700 text-center font-bold">${count}</td>
                <td>${projects[project].projectName}</td>
                <td>${projects[project].altText}</td>
                <td class="category ${categoryColor} text-white text-center uppercase">${projects[project].category}</td>
                <td><a class="underline text-red-800" href="${projects[project].repositoryLink}" target="_blank">${projects[project].repositoryLink}</a></td>
                <td><a class="underline text-red-800" href="${projects[project].demoLink}" target="_blank">${projects[project].demoLink}</a></td>
                <td>
                    <a class="underline text-red-800" href="${projects[project].projectImg}" target="_blank">${projects[project].altText}</a>
                </td>
                <td>
                    <button class="deleteBtn text-white bg-red-500 hover:bg-red-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium block">Delete</button>
                </td>
            </tr >`
                deleteTableBody.innerHTML += data;
            }

            else {
                data = `
                <tr data-id=${project}>
                    <td class="count bg-blue-500 text-white hover:bg-blue-700 text-center font-bold">${count}</td>
                    <td>${projects[project].projectName}</td>
                    <td>${projects[project].altText}</td>
                    <td class="category ${categoryColor} text-white text-center uppercase">${projects[project].category}</td>
                    <td><a class="underline text-red-800" href="${projects[project].repositoryLink}" target="_blank">${projects[project].repositoryLink}</a></td>
                    <td><a class="underline text-red-800" href="${projects[project].demoLink}" target="_blank">${projects[project].demoLink}</a></td>
                    <td>
                        <a class="underline text-red-800" href="${projects[project].projectImg}" target="_blank">${projects[project].altText}</a>
                    </td>
                    ${isUpdate ? `
                        <td>
                            <button 
                                class="updateBtn text-white bg-green-500 hover:bg-green-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium block">Update</button>
                        </td>` : ''}
                </tr >`;
                overflowTableBody.innerHTML += data;
            }
        }

    })
    // update project
    const updateProject = (projectId) => {
        let file;
        // update the img that user select it 
        document.querySelector("#imgUpdateUpdateWidget").addEventListener("change", (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                document.querySelector("#updatedForm .projectImgPreview").src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        // update data in ui
        get(child(projectsRef, projectId)).then(snapshot => {
            const data = snapshot.val();

            const imagePlaceholder = document.querySelector("#updatedForm #imagePlaceholder");
            imagePlaceholder.style.display = "none"
            document.querySelector(".projectImgNameUpdateWidget").textContent = `("${data.altText}")`;

            document.querySelector("#updatedForm .projectImgPreview").src = data.projectImg
            updatedForm.projectName.value = data.projectName
            updatedForm.altText.value = data.altText
            updatedForm.category.value = data.category
            updatedForm.repoLink.value = data.repositoryLink
            updatedForm.demoLink.value = data.demoLink
        }).catch(error => showAlert(error, "danger"));

    }

    const updateBtns = updateTableBody.querySelectorAll("button");
    updateBtns.forEach(updateBtn => {
        updateBtn.addEventListener("click", (e) => {
            const projectId = e.target.parentElement.parentElement.dataset.id
            updateProject(projectId);

            updatedForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                // Show the loader element
                loader.hidden = false;

                try {
                    const file = document.querySelector("#imgUpdateUpdateWidget").files[0];
                    const imgUrl = await uploadImageToImgBB(file);
                    const newData = {
                        projectImg: imgUrl,
                        projectName: updatedForm.projectName.value,
                        altText: updatedForm.altText.value,
                        category: updatedForm.category.value,
                        repositoryLink: updatedForm.repoLink.value,
                        demoLink: updatedForm.demoLink.value,
                    };
                    // Hidden the loader element
                    loader.hidden = true;
                    update(child(projectsRef, projectId), newData)
                    showAlert("Project Updated Successfully", "success");
                } catch (error) {
                    showAlert(error, "danger");
                    // Hidden the loader element
                    loader.hidden = true;
                }
            });
        });
    });

    const deleteBtns = deleteTableBody.querySelectorAll("button");
    deleteBtns.forEach(deleteBtn => {
        deleteBtn.addEventListener("click", (e) => {
            const projectId = e.target.parentElement.parentElement.dataset.id
            const projectRef = child(projectsRef, projectId);
            remove(projectRef)
                .then(() => {
                    showAlert("Project Successfully Deleted", "success")
                    deleteTableBody.innerHTML = "";
                    getAllProjects();
                })
                .catch((error) => {
                    showAlert(error, "danger");
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

const logout = () => {
    localStorage.removeItem("isLoggedIn");
    checkLogin();
}

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

logoutBtn.addEventListener("click", logout)
checkLogin()