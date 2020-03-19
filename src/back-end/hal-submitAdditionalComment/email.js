var aws = require('aws-sdk');
var ses = new aws.SES({
   region: 'us-east-1'
});
const { EMAIL_CHATBOT, ANSWER_PAGE_URL} = process.env;

function sendNewCommentEmail(toEmailAddress, question, comment, uid){
    var emailBody = `
        Hello,<br />
        <br />
        There is a new comment regarding a question you have participated.<br />
        <br />
        <p><b>Question: </b>${question}</p>
        <p><b>Comment: </b>${comment}</p>
        <br />
        Please click <a href="${ANSWER_PAGE_URL}?uid=${uid}">here</a> to view the full discussion and add your comments.<br />
        <br />
        <p>Your friend,<br />
        HAL
    `
    
    var eParams = {
        Destination: {
            ToAddresses: [toEmailAddress]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8", 
                    Data: emailBody
                }, 
            },
            Subject: {
                Data: "[HAL] New comment on: "+question
            }
        },
        Source: `HAL Bot <${EMAIL_CHATBOT}>`
    };

    console.log('===SENDING EMAIL===');
    return new Promise((resolve, reject) => {
        var email = ses.sendEmail(eParams, function(err, data){
            if(err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log("===EMAIL SENT===");
                console.log(data);
    
                console.log("EMAIL CODE END");
                console.log('EMAIL: ', email);
                resolve(data);
            }
        });
    });
}

module.exports = sendNewCommentEmail;
