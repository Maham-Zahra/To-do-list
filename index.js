
const input = document.querySelector(".input");
const list = document.querySelector(".list");


import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signOut 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore();


window.signIn = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Signed in:", user.displayName, user.email);
    document.getElementById("user").innerText = `Hello, ${user.displayName}`;
    loadTasks();
  } catch (error) {
    console.error(error);
  }
};


window.signOutUser = async function () {
  await signOut(auth);
  document.getElementById("user").innerText = "Signed out";
  document.querySelector(".list").innerHTML = "";
};


async function addTask() {
  const taskText = input.value.trim();
  if (taskText === "") return;

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


async function loadTasks() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("[loadTasks] No signed-in user");
      return;
    }

    const querySnapshot = await getDocs(collection(db, "tasks"));
    list.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const task = docSnap.data();
      if (task.uid !== user.uid) return;

      const li = document.createElement("li");
      li.textContent = task.text;
      if (task.completed) li.classList.add("checked");


      let isCompleted = task.completed;
      li.addEventListener("click", async () => {
        const taskRef = doc(db, "tasks", docSnap.id);
        const newVal = !isCompleted;

        li.classList.toggle("checked", newVal);

        try {
          await updateDoc(taskRef, { completed: newVal });
          console.log(`[toggle] ${docSnap.id} -> ${newVal}`);
          isCompleted = newVal; // update local state
        } catch (err) {
          // rollback if failed
          li.classList.toggle("checked", isCompleted);
          console.error("[toggle] update failed", err);
        }
      });

      // Delete button
      const span = document.createElement("span");
      span.innerHTML = "\u00d7";
      span.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          await deleteDoc(doc(db, "tasks", docSnap.id));
          console.log(`[delete] ${docSnap.id}`);
          loadTasks();
        } catch (err) {
          console.error("[delete] failed", err);
        }
      });

      li.appendChild(span);
      list.appendChild(li);
    });
  } catch (err) {
    console.error("[loadTasks] error:", err);
  }
}
