import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

import {
    setDoc,
    getDoc,
    doc,
    getFirestore,
    collection,
    query,
    onSnapshot,
    orderBy,
    limit,
    addDoc, updateDoc, deleteDoc, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const currentPageName = window.location.pathname.split("/").pop();
const signupBtn = document.getElementById("signupBtn");
const loginWithGoogleBtn = document.getElementById("loginWithGoogleBtn");
const logoutBtn = document.getElementById("logoutBtn");
const signin = document.getElementById("signin");
const writeBtn = document.getElementById("writeBtn");
const post = document.getElementById("post");
const lgBtn=document.getElementById("lgBtn");
let submitReplyBtn;
let blogs;
let blogID;
let email;
let password;
const addDataInFirestore = async () => {
    const fName = document.getElementById("fname").value;
    const lName = document.getElementById("lname").value;
    email = document.getElementById("emailid").value;
    password = document.getElementById("pass").value;
    const cpass = document.getElementById("cpass").value;

    const displayName = `${fName} ${lName}`;

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

const loadBlogByID = () => {
    // Retrieve the clickedBlog data from localStorage
    const clickedBlogData = JSON.parse(localStorage.getItem('clickedBlogData'));
  
    // Use the data to update your HTML
    if (clickedBlogData) {
      const date = new Date(clickedBlogData.createdAt);

  //<img id="userPic" src="${clickedBlogData.photoURL}" class="max-w-sm rounded-lg shadow-2xl" /> 
      const blogContentContainerHTML = `
        <div class="hero min-h-screen bg-base-200">
          <div class="hero-content flex-col lg:flex-row">
            
            <div>
              <h1 id="blogTitleByID" class="text-5xl font-bold" data-blogID="${clickedBlogData.createdAt}">${clickedBlogData.title}</h1>
              <p id="blogContentByID" class="py-6">${clickedBlogData.text}</p>
              <div class="avatar" id="blogDetailContainer">
                <p id="blogCreator">Published by: ${clickedBlogData.displayName}</p>
                <p id="blogDate">Date: ${date.toString().substring(4, 15)} </p>
              </div>
              <div id="replyBox">
              <div id="lblrep">
              <label for="reply">Add Your Thought</label>
              <label for="reply" id="lblReply">Reply</label>
              </div>
              <textarea class="textarea textarea-primary" id="reply" placeholder="Add your reply"></textarea>
              <button id="submitReply" class="btn btn-primary btn-wide">Submit</button></div>
              <div id="replyContainer"></div>
              </div>
              </div>
          </div>
        </div>
      `;
  
      // Update your HTML container with the data
      const blogContentContainer = document.getElementById("open");
      blogContentContainer.innerHTML = blogContentContainerHTML;
      // Clear localStorage after retrieving the data
      // localStorage.removeItem('clickedBlogData');
      submitReplyBtn = document.getElementById("submitReply");
      submitReplyBtn && submitReplyBtn.addEventListener("click", sendBlogReply);
    } else {
      console.error("Clicked Blog data not found in localStorage");
    }
  
  
  
  };

  const sendBlogReply = async () => {
    const user = auth.currentUser;
    const reply = document.getElementById("reply").value;
    const id = Date.now();
    const getBlogID = document.getElementById("blogTitleByID").getAttribute("data-blogID");
    console.log(getBlogID);
    try {
      if (reply.trim()) {
        const { email, displayName, photoURL, uid } = user;
        const payload = {
          createdAt: id,
          blogID: getBlogID,
          reply,
          uid,
          email,
          displayName,
          photoURL
        };
        await setDoc(doc(db, "replies", `${id}`), payload);
        alert("Your reply has been sent!")
        document.getElementById("reply").value = "";
      } else {
        alert("Please enter a reply!");
      }
    }
    catch (err) {
      console.error(err);
    }
  }


  const loadReplies = () => {
    const getBlogID = document.getElementById("blogTitleByID").getAttribute("data-blogID");
    console.log(getBlogID);
    const q = query(collection(db, "replies"), where("blogID", "==", getBlogID));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const blogsHTML = querySnapshot.docs
        .map((doc) => {
          const blogs = doc.data();
          const date = new Date(blogs.createdAt); //.toString().substring(4, 15)
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const formattedTime = `${hours}:${minutes}`;
          const photoURL = blogs.photoURL;
          const displayName = blogs.displayName;
          const reply = blogs.reply;
          // date.toString().substring(4, 15)
          const currentTime12Hrs = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });
          /*<p id="time">${currentTime12Hrs}</p>*/
          return `
          <div id="userReplies"><img id="replyUserPic" src="${photoURL}" class="max-w-sm rounded-lg shadow-2xl">
          <div id="replyDetails"><div><span id="date">${date.toString().substring(4, 15)}</span></div>
          <span id="userName">${displayName}</span>
          <div><span id="userReply" data-createdAt="${blogs.createdAt}">${reply}</span></div>
          </div></div>
          `;
        })
        .join("");
      document.getElementById("replyContainer").innerHTML = blogsHTML;
    });
  }
  

  const loadBlogs = () => {
    const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const blogData = [];
  
      querySnapshot.forEach((doc) => {
        blogData.push({ id: doc.id, ...doc.data() });
      });
  
      console.log(blogData);
  
      const blogsHTML = blogData
        .map((blog) => {
          const timestamp = blog.createdAt;
          const date = new Date(timestamp);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const formattedTime = `${hours}:${minutes}`;
  
          return `
            <div class="collapse bg-base-200 bpost">
              <input type="radio" name="my-accordion-1" />
              <div class="collapse-title text-xl font-medium">
                ${blog.title}
              </div>
              <div class="collapse-content">
                <p>${blog.text.substring(0, 250)} <a style="color: orange;" class="readMore" data-createdAt="${timestamp}" data-blog-id="${blog.id}"><u>Read More...</u></a></p>
                <div class="avatar" id="detailContainer">
                  <div class="w-10 rounded">
                    <img src="${blog.photoURL}" alt="Tailwind-CSS-Avatar-component" />
                  </div>
                  <p id="blogCreator">${blog.displayName}</p>
                  <p id="blogDate">${date.toString().substring(4, 15)} </p>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
  
      post.innerHTML = blogsHTML;
  
      // Add event listener to all elements with class "readMore"
      const readMoreElements = document.querySelectorAll('.readMore');
      readMoreElements.forEach((readMoreElement) => {
        readMoreElement.addEventListener('click', async () => {
          const blogID = readMoreElement.getAttribute('data-createdAt');
          const clickedBlogID = readMoreElement.getAttribute('data-blog-id');
  
          // Log the relevant blog's data
          const clickedBlog = blogData.find(blog => blog.id === clickedBlogID);
          if (clickedBlog) {
            console.log("Clicked Blog Data:", clickedBlog);
  
            // Store clickedBlog data in localStorage
            localStorage.setItem('clickedBlogData', JSON.stringify(clickedBlog));
  
            // Now, navigate to the new page
            window.location.href = `post.html`;
          } else {
            console.error("Clicked Blog not found");
          }
        });
      });
    });
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
            if (currentPageName !== "dash.html" && currentPageName !== "newblog.html" && currentPageName !=="post.html") {
                window.location.href = "dash.html";
            }
            console.log(user);
        
        if (currentPageName === "dash.html") {
            loadBlogs();
        }
        if (currentPageName === "post.html")
        {
            loadBlogByID();
            loadReplies();
        }
    }
        else {
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

const createBlog = async () => {
    const user = auth.currentUser;
    const text = document.getElementById("description").value;
    const title = document.getElementById("titleb").value;
    console.log(text, title);
    const id = Date.now();

    try {
        if (user) {
            if (text.trim() && title.trim()) {
                const { email, displayName, photoURL, uid } = user;
                const payload = {
                    createdAt: id,
                    title,
                    text,
                    uid,
                    email,
                    displayName,
                    photoURL
                };
                await setDoc(doc(db, "blog", `${id}`), payload);
                alert("Your post has been made!")
                window.location.href = "index.html"; //change with blog page
            } else {
                alert("Please enter all the relevant content!");
            }
        }
        else if (!user) {
            alert("You need to first log in to create a blog post!");
        }
    } catch (err) {
        console.log(err);
    }
};





loginWithGoogleBtn && loginWithGoogleBtn.addEventListener("click", signInWithGoogle)
logoutBtn && logoutBtn.addEventListener("click", logOut)
signin && signin.addEventListener("click", signIn)
signupBtn && signupBtn.addEventListener("click", addDataInFirestore)
subBtn && subBtn.addEventListener("click", createBlog)
lgBtn && lgBtn.addEventListener("click", logOut)


