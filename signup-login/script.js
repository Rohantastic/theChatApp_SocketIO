const name = document.getElementById('name');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const password = document.getElementById('password');
const button = document.querySelector('button');
const form = document.querySelector('form');

async function signup(e) {
    e.preventDefault();
    const obj = {
        name: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value
    };

    try {
        const response = await axios.post('http://localhost:3000/admin/signup', obj);
        console.log(response.data);
        if (response.status === 201) {
            alert('Successfully signed up');
            window.location.href = './login.html';
        }
    } catch (error) {
        console.log(error);
        if (error.response.status === 403) {
            alert('Email already exists');
        }
    }
}

async function login(e) {
    e.preventDefault();
    const obj = {
        email: email.value,
        password: password.value
    };

    try {
        const response = await axios.post('http://localhost:3000/admin/login', obj);
        console.log(response.data);
        if (response.status === 200) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('name', response.data.name);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('localMsg', '[]');
            window.location.href = './chat.html';
        }
    } catch (error) {
        console.log(error);
        if (error.response.status === 401) {
            alert('Password does not match, please log in again');
        } else if (error.response.status === 404) {
            alert('User does not exist. Please sign up');
        }
    }
}
