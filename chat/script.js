//getting the value of tokens stored into localStorage from login frontEnd
const token = localStorage.getItem("token");
//value of name 
const name = localStorage.getItem("name");
//value of user ID
const userId = localStorage.getItem("userId");


//creating custom axios, so during deployment , we dont face any issue
const userAxios = axios.create({
    baseURL: "http://localhost:3000",
    headers: { Authorization: `Bearer ${token}` }
});


{ //block to select groupName from localStorage if exists.
    document.getElementById('login-name').innerHTML = `${name}`;
    const currentGroup = document.getElementById('current-group-name');
    if (localStorage.getItem('groupName') != null) {
        currentGroup.innerHTML = `${localStorage.getItem('groupName')}`;
    } else {
        currentGroup.innerHTML = `Choose a group`;
    }

    function logout() {
        localStorage.clear();
        window.localStorage.href = './login.html';
    }
}

{
    userAxios.get("/get-groups").then((res) => {
        const groupListDiv = document.getElementById("group-list");
        groupListDiv.innerHTML = "";
        res.data.groups.forEach((group) => {
            groupListDiv.innerHTML += `
            <li id="${group.id}" style="padding:5px 0;">
            <span>${group.name}</span>
            <button id="show-users">Show Users</button>
            <button id="change-group-btn" class="group-btn">Enter Chat</button>
            <button id="delete-group-btn" class="group-btn">Delete Group</button>
            </li>
            `;
        });
    })
        .catch((err) => console.log(err));

    function createGroup(event) {
        event.preventDefault();
        const name = document.getElementById("create-group-input").value;
        userAxios
            .post("/create-group", { name, isAdmin: true })
            .then((res) => {
                console.log(res.data);
                const groupId = res.data.group.id;
                localStorage.setItem("groupId", groupId);
                window.location.reload();
            })
            .catch((err) => console.log(err));
    }


    //event listener to change/delete groups
    document.getElementById("group-list-wrapper").addEventListener("click", (e) => {

        if (e.target.id === "change-group-btn") { //if user press change group button
            const gId = e.target.parentNode.id;
            const gName = e.target.parentNode.children[0].innerText;
            console.log(gId, gName)
            localStorage.setItem("groupId", gId);
            localStorage.setItem("groupName", gName);
            localStorage.setItem("localMsg", "[]");
            window.location.reload();
        }

        if (e.target.id === "delete-group-btn") {//if user press delete btn
            const gId = e.target.parentNode.id;
            console.log(gId)
            if (confirm("Are you sure?")) {
                userAxios
                    .delete(`/delete-group/${gId}`) //delete api will be called to delete the group
                    .then((res) => {
                        console.log(res.data);
                        localStorage.removeItem("groupId"); //group will also be deleted from localStorage
                        alert(`Group with id-${gId} is deleted successfully`); //Alert to notify user that group has been deleted
                    })
                    .catch((err) => console.log(err.response.data));
            }
        }

        if (e.target.id === "show-users") {
            const gId = e.target.parentNode.id;
            userAxios
                .get(`/get-users/?gId=${gId}`) //show all the users inside the group by calling the get-users api
                .then((res) => {

                    document.getElementById("users-inside-group").innerHTML = "";
                    res.data.userData.forEach((user) => {
                        document.getElementById("users-inside-group").innerHTML += `
                        <li id="${user.groups[0].id}">
                            <span>${user.name}</span> 
                            <button id="remove-user-btn" class="user-btn">Remove</button>
                            <button id="make-admin-btn">Make Admin</button>
                        </li> `; //showing userName at show all users list.
                    });
                })
                .catch((err) => console.log(err));
        }

        if (e.target.id === "remove-user-btn") {
            const obj = {
                email: e.target.parentNode.children[1].innerText, //getting email of the user which admin want to remove
                groupId: e.target.parentNode.id, //getting groupID
            };
            //console.log(obj);

            if (confirm("Are you sure?")) {
                userAxios
                    .post("/remove-user", obj) //sending object to backend api to delete user
                    .then((res) => {
                        alert(`${obj.email} removed from the group`);
                    })
                    .catch((err) => {
                        console.log(err.response);
                        alert(`user with ${obj.email} not present in the group`);
                    });
            }
        }

        if (e.target.id === "make-admin-btn") { //to make admin 
            const obj = {
                email: e.target.parentNode.children[1].innerText, //getting email of user from parentNode
                groupId: e.target.parentNode.id //getting groupId
            }
            userAxios.post("/make-admin", obj) //sending object to backend API to make user an admin by its email ID
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => console.log(err));
        }
    });


}

//block for seperation of concerns
{

    userAxios.get("/get-users") //api call to get all the users present into DB
        .then((res) => {
            const userListDiv = document.getElementById("user-list");
            userListDiv.innerHTML = "";
            res.data.user.forEach((user) => {
                userListDiv.innerHTML += `
              <li id='user-${user.id}' class="user-list-inside" style="padding:5px 0;" user-list-li>
              <span>${user.name}</span>
              <span>${user.email}</span>
              <label for="accept">Admin</label>
              <input type="checkbox" id="accept">
              <button id="add-user-btn" class="user-btn">Add</button>
              </li> `;
            });
        })
        .catch((err) => console.log(err.response));

    document.getElementById("user-list").addEventListener("click", (e) => {
        //for adding/removing users
        const email = e.target.parentNode.children[1].innerText;

        const isAdmin = e.target.parentNode.children[3].checked;


        if (localStorage.getItem("groupId") == null) {
            return alert("Please select a group first");
        }
        const obj = {
            email: email, //getting email of user
            groupId: localStorage.getItem("groupId"), //groupID from localstore
            isAdmin: isAdmin, //isAdmin value
        };


        if (e.target.id === "add-user-btn") {
            userAxios
                .post("/add-user", obj)
                .then((res) => {
                    console.log(res.data);
                    alert(`user with ${email} added to the group`);
                })
                .catch((err) => {
                    console.log(err.response.data);
                    alert(`user with ${email} is already a member`);
                });
        }
    });

    //not working..
    document.querySelector("[data-search]").addEventListener("input", (e) => {
        //search bar
        const value = e.target.value.toLowerCase();
        const userList = document.getElementById("user-list");
        const li = userList.getElementsByTagName("li");
        // console.log(li);
        // console.log(Array.from(li));
        Array.from(li).forEach((user) => {
            const email = user.children[0].textContent;
            const name = user.children[1].textContent;
            if (
                (email.toLowerCase().indexOf(value) ||
                    email.toLowerCase().indexOf(value)) !== -1
            ) {
                user.style.display = "block";
            } else {
                user.style.display = "none";
            }
        });
    });
}



//block of seperation of concerns


//Handling the chat division
{
    
    //if we have any messages stored into our localStorage already..
    let localMsg = JSON.parse(localStorage.getItem("localMsg")); //getting array of messages from localMsg, if present, else 
    let lastId;
    if (localMsg == null) {
        lastId = 0; //last id = 0 if localStorage localMsg has no value present.
    }
    if (localMsg.length > 0) {
        lastId = localMsg[localMsg.length - 1].id; //If there are messages in localMsg,
         //it retrieves the ID of the last message by accessing localMsg[localMsg.length - 1].id and assigns it to the lastId variable.
         // to keep track of ID of last message. 
    }
    const groupId = localStorage.getItem("groupId");

    if (localStorage.getItem("groupId") != null) {
        setInterval(() => {
            userAxios
                .get(`/get-chats?id=${lastId}&gId=${groupId}`)
                .then((response) => {
                    //localstorage`
                    let retrivedMsg = localMsg.concat(response.data.chat);
                    //deleting old messages from local storage
                    if (retrivedMsg.length > 100) {
                        for (let i = 0; i < retrivedMsg.length - 100; i++) //loops until 100 so only 100 or lesser messages stays in retrivedMsg
                            retrivedMsg.shift(); //removing first element from an array, 
                    }

                    //retrived array is then stored back into localMsg, so to fetch faster than DB.
                    localStorage.setItem("localMsg", JSON.stringify(retrivedMsg));

                    const div = document.getElementById("group-chat-receive-box");
                    div.innerHTML = "";
                    retrivedMsg.forEach((chat) => {
                        div.innerHTML += `<div id="${chat.id}>"><span style="color:green;"><b>${chat.name}:</b></span><span>${chat.message}</span></div>`;
                    });
                })
                .catch((err) => console.log(err.response));
        }, 1000)
    }



    function sendFile(event) {
        event.preventDefault();
        const fileInput = document.getElementById("file-upload");
        const formData = new FormData();
        
        formData.append("image", fileInput.files[0]);
        userAxios.post("/upload", formData)
            .then((res) => {
                console.log(res);
                if (res.status === 200) {
                    const fileUrl = res.data.fileURL;
                    const downloadLink = `<a href="${fileUrl}"download>Download file</a>`;
                    const obj = {
                        message: downloadLink, // Send the download link for the image
                        name: name,
                        groupId: localStorage.getItem("groupId"),
                    };

                    userAxios
                        .post("/post-chat", obj)
                        .then((res) => console.log(res))
                        .catch((err) => console.log(err));


                    const div = document.getElementById("group-chat-receive-box");
                    div.innerHTML += `
              <div>
                <span style="color:green;"><b>${name}:</b></span>
                <span>${downloadLink}</span>
              </div>`;

                    // Clear the input and scroll to the bottom
                    fileInput.value = "";
                    div.scrollTop = div.scrollHeight;
                }
            })
            .catch((err) => {
                console.log(err.response);
            });
    }





    function sendGroupMsg(event) {
        event.preventDefault();

        if (localStorage.getItem("groupId") == null) { //if groupID in localStorage is null, we ask user to first select the group
            alert("Select a group first");
            document.getElementById("group-chat-input").value = "";
        } else {
            const input = document.getElementById("group-chat-input").value;
            const obj = {
                message: input,
                name: name,
                groupId: localStorage.getItem("groupId"),
            };

            userAxios
                .post("/post-chat", obj)
                .then((res) => console.log(res))
                .catch((err) => console.log(err));

            // Display the sent message or image in the chat box
            const div = document.getElementById("group-chat-receive-box");
            const chatMessageDiv = document.createElement("div");
            chatMessageDiv.innerHTML = `
            <span style="color:green;"><b>${name}:</b></span><span>${input}</span>`;
            div.appendChild(chatMessageDiv);

            // Clear the input and scroll to the bottom
            document.getElementById("group-chat-input").value = "";
            div.scrollTop = div.scrollHeight;
        }
    }

}


