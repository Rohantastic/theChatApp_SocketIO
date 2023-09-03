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

