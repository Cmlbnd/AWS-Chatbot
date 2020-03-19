var aws = require('aws-sdk');
var ses = new aws.SES({
   region: 'us-east-1'
});
const { EMAIL_CHATBOT, ANSWER_PAGE_URL} = process.env;

function sendCustomerEmail(toEmailAddress, expertName, question, answer, comments, uid){
    var emailBody = `
        Hello,<br />
        <br />
        Our expert ${expertName} answered your question!<br />
       
        <br />
        <p><b>Question: </b>${question}</p>
        <p><b>Answer: </b>${answer}</p>
    `
    if(comments && comments.trim() !=="") {
        emailBody += `<p><b>Comment: </b>${comments}</p>`;
    }
    emailBody += `
        <br />
        Please click <a href="${ANSWER_PAGE_URL}?uid=${uid}">here</a> to provide a feedback about this answer or in case you need to contact again an expert.<br />
        <br />
        <p>Your friend,<br />
        HAL</p>
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
                Data: "[HAL] Answer for: "+question
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

module.exports = sendCustomerEmail;
