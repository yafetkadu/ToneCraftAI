const BACKEND_URL_API = 'http://127.0.0.1:8000/auth/login';

document.getElementById('loginWithEmail').addEventListener('click', () => {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    let loginCred = {
        "email": email,
        "password": password,
    }
    console.log(loginCred);

    fetch(BACKEND_URL_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(loginCred)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Login successful:", data);
        
        // Save both token and user data - using the exact fields from your backend
        chrome.storage.local.set({
            authToken: data.access_token,
            user: {
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                id: data.id
            }
        });
        
        alert("Login successful!");
        window.close();
    })
    .catch(error => {
        console.error("Error", error);
        alert(error.message);
    });
});

console.log("Login page loaded");