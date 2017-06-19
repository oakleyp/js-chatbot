"use strict";


let user_avatar_url = "http://www.placecage.com/g/200/300";
let user_title = "User";
let containers = document.getElementsByClassName("chatbot");
let chatbots = [];

for(var i = 0; i < containers.length; i++) {
    let container = containers[i];
    let features = [];
    if(container.classList.length > 1) {
        for(var x = 1; x < container.classList.length; x++)
            features.push(container.classList[x]);
    } else features = null;
    
    let name = container.getAttribute("id");
    let chatbot = new ChatBot(name, null, features, container);
    chatbots.push(chatbot);
    
}

let activebot = chatbots[0];


//Keeps chat scrolled to bottom, from solution here: https://stackoverflow.com/questions/18614301/keep-overflow-div-scrolled-to-bottom-unless-user-scrolls-up
function updateScroll(container){
    let element = container.getElementsByClassName("displaybox")[0];
    element.scrollTop = element.scrollHeight;
}

//Appends a new li node to a given chatbot container with the specified parameters
//An array of classes may also be passed. This may be used to change message styling or add other functionality for certain types of message content
function appendMessage(sender, title, avatar_url, message, container, classList=null) {
    let displayUl = container.getElementsByTagName("ul")[0];
    let msgClass = (sender=="user") ? "user" : "bot";
    let msg = document.createElement("li");
    let classes = "";
    if(classList != null) classes = " " + classList.join(" ");
    msg.setAttribute("class", msgClass);
    msg.innerHTML = `<div class="heading">
                        <span>${title}</span>
                    </div>
                    <div class="msg-content${classes}">
                        <img src="${avatar_url}">
                        <p>${message}</p>
                    </div>`;
    
    displayUl.appendChild(msg);
    updateScroll(container);
}

document.querySelector("body").addEventListener("keypress", function(event) {
    let inputBox = activebot.getElement("input");
    if(event.keyCode == 13 && event.target == inputBox) {
        if(inputBox.value != "") {
            appendMessage("user", user_title, user_avatar_url, inputBox.value, event.target.parentNode);
            activebot.input(inputBox.value);
            inputBox.value = "";
            console.log("Sending input to chatbot: " + activebot.name);
        } else console.log("Input was blank.");
    }
});