console.log("SCRIPT LOADED");
function getTime(){

    const now = new Date();

    return now.toLocaleTimeString([],{
        hour:'2-digit',
        minute:'2-digit'
    });

}
async function sendMessage(){
    console.log("SEND BUTTON CLICKED");


    const input = document.getElementById("userInput");

    const message = input.value.trim();

    if(message === "") return;

    const chatBox = document.getElementById("chatBox");

    // USER MESSAGE
    const userDiv = document.createElement("div");

    userDiv.className = "message user-message";

    userDiv.innerHTML = `
🧑 ${message}
<div class="timestamp">${getTime()}</div>
`;

    chatBox.appendChild(userDiv);

    input.value = "";

    // TYPING ANIMATION
    const typingDiv = document.createElement("div");

    typingDiv.className = "message bot-message";

    typingDiv.id = "typing";

    typingDiv.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatBox.appendChild(typingDiv);

    chatBox.scrollTop = chatBox.scrollHeight;
    const ring =
document.getElementById("statusRing");

ring.className = "status-ring thinking";

    try{

        const response = await fetch("http://127.0.0.1:5000/chat",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

    message:message,

    personality:
    document.getElementById("personality").value

})

        });

        const data = await response.json();

typingDiv.remove();

const botDiv = document.createElement("div");

botDiv.className = "message bot-message";

botDiv.innerHTML = `
🤖 ${data.reply}
<div class="timestamp">${getTime()}</div>
`;

chatBox.appendChild(botDiv);
const speech = new SpeechSynthesisUtterance(data.reply);

speech.lang = "en-US";
speech.rate = 1;
speech.pitch = 1;

window.speechSynthesis.speak(speech);
chatBox.scrollTop = chatBox.scrollHeight;

    }

    catch(error){

        typingDiv.remove();

        const errorDiv = document.createElement("div");

        errorDiv.className = "message bot-message";

        errorDiv.innerHTML = "⚠ Error connecting to AI server.";

        chatBox.appendChild(errorDiv);
    }
}

document
.getElementById("userInput")
.addEventListener("keypress", function(event){

    if(event.key === "Enter"){
        event.preventDefault();
        sendMessage();
    }

});
function startVoice(){
    console.log("MIC BUTTON CLICKED");

    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech Recognition is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event){

        const transcript =
        event.results[0][0].transcript;

        document.getElementById("userInput").value =
        transcript;

        sendMessage();
    };

    recognition.onerror = function(event){
        console.log("Voice Error:", event.error);
    };
}

function clearChat(){
    localStorage.removeItem("chatHistory");
    document.getElementById("chatBox").innerHTML = "";
}
function toggleTheme(){

    document.body.classList.toggle("light-mode");

}
function downloadChat(){

    const chat =
        document.getElementById("chatBox").innerText;

    const blob =
        new Blob([chat], {type:"text/plain"});

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "chat-history.txt";

    link.click();

}
window.addEventListener("beforeunload", function () {
    console.log("PAGE RELOAD DETECTED");
});
