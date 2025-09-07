import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBqfauK7VI5NhSJE44WUBCBqviCDANgY9U",
  authDomain: "to-do-list-d6eab.firebaseapp.com",
  projectId: "to-do-list-d6eab",
  storageBucket: "to-do-list-d6eab.appspot.com",
  messagingSenderId: "393973399383",
  appId: "1:393973399383:web:b66959cb043d5f69600812"
};

// 🔹 Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// 🔹 DOM elements
const input = document.querySelector(".input");
const list = document.querySelector(".list");
const userDisplay = document.getElementById("user");
const btnAdd = document.querySelector(".btn");
const btnSignIn = document.querySelector(".sign-in");
const btnSignOut = document.querySelector(".sign-out");

// 🔹 Event Listeners
btnAdd.addEventListener("click", addTask);
btnSignIn.addEventListener("click", signIn);
btnSignOut.addEventListener("click", signOutUser);

// 🔹 Sign In
async function signIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    userDisplay.innerText = `Hello, ${user.displayName}`;
    loadTasks();
  } catch (error) {
    console.error("Sign-in error:", error);
  }
}

// 🔹 Sign Out
async function signOutUser() {
  await signOut(auth);
  userDisplay.innerText = "Signed out";
  list.innerHTML = "";
}

// 🔹 Add Task
async function addTask() {
  const taskText = input.value.trim();
  if (!taskText) return;

  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in first!");
    return;
  }

  try {
    await addDoc(collection(db, "tasks"), {
      uid: user.uid,
      text: taskText,
      completed: false,
      createdAt: new Date()
    });
    input.value = "";
    loadTasks();
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

// 🔹 Load Tasks
async function loadTasks() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    list.innerHTML = "";

    snapshot.forEach(docSnap => {
      const task = docSnap.data();
      if (task.uid !== user.uid) return;

      const li = document.createElement("li");
      li.textContent = task.text;
      if (task.completed) li.classList.add("checked");

      // Toggle completed
      let isCompleted = task.completed;
      li.addEventListener("click", async () => {
        const taskRef = doc(db, "tasks", docSnap.id);
        const newVal = !isCompleted;
        li.classList.toggle("checked", newVal);

        try {
          await updateDoc(taskRef, { completed: newVal });
          isCompleted = newVal;
        } catch (err) {
          li.classList.toggle("checked", isCompleted);
          console.error("Toggle failed", err);
        }
      });

      // Delete button
      const span = document.createElement("span");
      span.innerHTML = "\u00d7";
      span.addEventListener("click", async e => {
        e.stopPropagation();
        try {
          await deleteDoc(doc(db, "tasks", docSnap.id));
          loadTasks();
        } catch (err) {
          console.error("Delete failed", err);
        }
      });

      li.appendChild(span);
      list.appendChild(li);
    });

  } catch (err) {
    console.error("loadTasks error:", err);
  }
}

// 🔹 Auto-load tasks if user already signed in
onAuthStateChanged(auth, user => {
  if (user) {
    userDisplay.innerText = `Hello, ${user.displayName}`;
    loadTasks();
  } else {
    userDisplay.innerText = "Signed out";
    list.innerHTML = "";
  }
});
