

// auth.js
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { app } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const googleBtn = document.getElementById("googleLoginBtn");
  googleBtn.addEventListener("click", () => {
    alert("Clicked!"); // test
    signInWithPopup(auth, provider)
      .then(result => {
        let data = result.user;
        let { accessToken, displayName, email, uid } = data;
        displayName = displayName.split(' ');
        let firstname = displayName[0];
        let lastname = displayName[1];
        let loggedInUser = {
            "accessToken": accessToken,
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "id": uid
        }

        console.log(loggedInUser);
        //console.log("firstname: ", firstname, "Lastname: ", lastname, "Email: ", email, "Id: ", uid);
        //console.log("Signed in:", loggedInUser)
     })
      .catch(error => console.error("Sign-in error:", error));
  });

  const emailBtn = document.getElementById("emailLogin");
  emailBtn.addEventListener("click", () => {
    window.open('login.html', '_blank');
  });
});

