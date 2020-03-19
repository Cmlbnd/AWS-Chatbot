const MESSAGE_TYPES = {
    CONFIRMATION: {value: "CONFIRMATION", class:"lexConfirmation"},
    USER: {value: "USER", class:"userRequest"},
    BOT: {value: "BOT", class:"lexResponse"},
    ERROR: {value: "ERROR", class:"lexError"}
}

const RATING_TYPES = {
    NOT_ANSWERING : "NOT_ANSWERING",
    NOT_COMPLETE : "NOT_COMPLETE",
    GOOD_ANSWER : "GOOD_ANSWER"
}
const RATING_SOURCE = {
    CLIENT : "CLIENT",
    END_USER : "END_USER"
}
const SUBMIT_RATING_URL = "https://ldy3aeach5.execute-api.us-east-1.amazonaws.com/test/submit-rating";
const SUBMIT_COMMENT_URL = "https://ldy3aeach5.execute-api.us-east-1.amazonaws.com/test/submit-comment";


var conversationHistory = [];

function showMessage(message, type, addConversation = true) {
    var conversationDiv = document.getElementById('conversation');
    var para = document.createElement("P");
    para.className = type.class;
    para.appendChild(document.createTextNode(message));
    conversationDiv.appendChild(para);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
    if(addConversation) {
        addToConversationHistory(message, type);
    }
}

function showButtons(btns) {
    var conversationDiv = document.getElementById('conversation');
    var msgDiv = document.createElement("div");
    $(msgDiv).addClass('buttonsContainer');
    for(var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        var btnEl = $(document.createElement('button'));
        btnEl.addClass('btn  waves-effect waves-light');
        btnEl.text(btn.label);
        var thisBtn = btn;
        //var thisBtnFunction = function(container) { return function() {thisBtn.clickFunction(container)}};
        btnEl.click(btn.clickFunction);
        $(msgDiv).append(btnEl);
    }
    
    conversationDiv.appendChild(msgDiv);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

function addToConversationHistory(message, type) {
    conversationHistory.push({
        timestamp: (new Date()).getTime(),
        message,
        type
    })
}

function showLearningMessage(){
    var conversationDiv = document.getElementById('conversation');
    var msgDiv = document.createElement("div");
    var para = document.createElement("P");
    msgDiv.className = "learningBox";
    para.appendChild(document.createTextNode("HAL is reading a book to update its knowledge "));
    var loader = document.createElement("div");
    loader.className = 'spinner';
    loader.id = "learningLoader";
    $(loader).html('<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div>')

    msgDiv.appendChild(para);
    msgDiv.appendChild(loader);
    conversationDiv.appendChild(msgDiv);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
}
function finishedLearning() {
    $("#learningLoader").html('<i class="material-icons" style="margin-left: 10px; float:left; color: #062f6e; font-size: 20px">check_circle</i>')
}


function submitRating(uid, rating, ratingSource) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "POST",
            url: SUBMIT_RATING_URL, 
            data: JSON.stringify({
                uid,
                rating,
                ratingSource
            }),
            crossDomain: true,
            contentType: "json",
            dataType: "json",
            success: function( data ){
                resolve(data);
            }, 
            error: function(error) {
                reject(error);
            }
        });
    });
}

function submitComment(uid, comment, user) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "POST",
            url: SUBMIT_COMMENT_URL, 
            data: JSON.stringify({
                uid,
                comment,
                user
            }),
            crossDomain: true,
            contentType: "json",
            dataType: "json",
            success: function( data ){
                resolve(data);
            }, 
            error: function(error) {
                reject(error);
            }
        });
    });
}


$( document ).ready(function() {
    $('.dropdown-trigger').dropdown({
        constrainWidth: false,
        coverTrigger: false,
        alignment: 'center'
    });
    $("#chatform").submit(function( event ) {
        pushChat();
        event.preventDefault();
    });
    $("#sendIcon").click(function( event ) {
        pushChat();
        event.preventDefault();
    })

    
});