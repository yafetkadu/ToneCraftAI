const BACKEND_URL_API = 'http://127.0.0.1:8000/auth/signup';

document.addEventListener('DOMContentLoaded', function() {
    console.log("Register page loaded");
    
    document.getElementById('registerBtn').addEventListener('click', () => {
        var firstname = document.getElementById("firstname").value;
        var lastname = document.getElementById("lastname").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        let registerData = {
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "password": password
        }
        console.log(registerData);

        fetch(BACKEND_URL_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify(registerData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Registration successful:", data);
            
            // Save both token and user data
            chrome.storage.local.set({
                authToken: data.access_token,
                user: {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    email: data.email,
                    id: data.id
                }
            });
            
            alert("Registration successful! You are now logged in.");
            window.close();
        })
        .catch(error => {
            console.error("Error", error);
            alert(error.message);
        });
    });
});