import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut ,createUserWithEmailAndPassword,signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyDLO5mWwv9o5tYdNlmdioIOe0Pweh5NtO0",
    authDomain: "em-bloghub.firebaseapp.com",
    projectId: "em-bloghub",
    storageBucket: "em-bloghub.appspot.com",
    messagingSenderId: "899930073178",
    appId: "1:899930073178:web:0d46660dd24998b3a35063",
    measurementId: "G-B5EXKB4W97"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const currentPageName = window.location.pathname.split("/").pop();
const signupBtn=document.getElementById("signupBtn");
const loginWithGoogleBtn = document.getElementById("loginWithGoogleBtn");
const logoutBtn = document.getElementById("logoutBtn");
const signin= document.getElementById("signin");
const writeBtn=document.getElementById("writeBtn");


let email;
let password;
const addDataInFirestore = async () => {
    const fName = document.getElementById("fname").value;
    const lName = document.getElementById("lname").value;
    email = document.getElementById("emailid").value;  
    password = document.getElementById("pass").value;  
    const cpass = document.getElementById("cpass").value;

     const displayName=`${fName} ${lName}`;

    console.log(displayName);
    if (password === cpass && cpass !== "" && fName !== "" && lName !== "" && email !== "") {
        console.log(fName + lName + email + password + cpass);

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User signed up:", user);
                // You can redirect the user or perform other actions here
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Error during sign up:", errorCode, errorMessage);
            });
    }
};
const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log(result)
        }).catch((error) => {
            console.log(error)
        });
}

const logOut = () => {
    signOut(auth).then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });
}
const onLoad = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (currentPageName !== "dash.html" && currentPageName !== "newblog.html" ) {
                window.location.href = "dash.html";
            }
            console.log(user);
        } else {
            if (currentPageName !== "index.html" && currentPageName !== "" && currentPageName !== "signup.html" && currentPageName !== "newblog.html") {
                window.location.href = "/";
            }
            console.log("User is not logged in!");
        }
    });
}


onLoad()


    const signIn = () => {
        email = document.getElementById("emailid").value;
        password = document.getElementById("password").value;
        console.log(email + password);
        
    
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log(user);
            
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode + errorMessage);
            alert("Invalid credentials!")
        });
    }






loginWithGoogleBtn && loginWithGoogleBtn.addEventListener("click", signInWithGoogle)
logoutBtn && logoutBtn.addEventListener("click", logOut)
signin && signin.addEventListener("click",signIn)
signupBtn && signupBtn.addEventListener("click",addDataInFirestore)


