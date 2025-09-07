const input= document.querySelector(".input");
const list= document.querySelector(".list");
function addTask(){
  if(input.value=== ''){
    alert("You must write something!");
  }
  else{
    let li= document.createElement("li");
    li.innerHTML= input.value;
    list.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML= "\u00d7";
    li.appendChild(span);
  }
  input.value="";
  saveData();
}
listContainer= list.addEventListener( "click", function(e){
if (e.target.tagName === "LI"){
  e.target.classList.toggle("checked");
    saveData();
}
else if(e.target.tagName === "SPAN"){
  e.target.parentElement.remove();
  
}  saveData();
},false);
function saveData(){
  localStorage.setItem("data",listContainer.innerHTML);
}
function showtask(){
  listContainer.innerHTML = localStorage.getItem("data");

showtask();
}