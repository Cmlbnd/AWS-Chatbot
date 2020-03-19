'use strict';

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const sendNewCommentEmail = require('./email');


async function getUnknownQuestion(uid) {
    var queryParams = {
        TableName: "UnknownQuestions",
        KeyConditionExpression: "#uid = :uid",
        ExpressionAttributeNames: {
            "#uid": "uid"
        },
        ExpressionAttributeValues: {
            ":uid": uid
        }
    };
    
    const result = await docClient.query(queryParams).promise();
    console.log(result);
    return result.Items[0];
}

exports.handler = async function(event, context, callback){
    console.log(event);
    let body = JSON.parse(event.body);
    var response = {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({})
    };
    
    // Validate inputs
    if(!body || !body["uid"]) {
        response.body = JSON.stringify({error: 'UID not specified' });
        response.statusCode = 400;
        return response;
    }
    if(!body || !body["comment"]) {
        response.body = JSON.stringify({error: 'comment not specified' });
        response.statusCode = 400;
        return response;
    }
    if(!body || !body["user"]) {
        response.body = JSON.stringify({error: 'User not specified' });
        response.statusCode = 400;
        return response;
    }
    
    
    var uid = body.uid;
    var comment = body.comment;
    var user = body.user;
    
    
    var originalQuestion = await getUnknownQuestion(uid);
    console.log(originalQuestion);
    var additionalComments = originalQuestion.additionalComments ? originalQuestion.additionalComments : [];
    
    
    additionalComments.push({
            comment,
            user,
            timestamp: new Date().getTime()
        });
    console.log(additionalComments);
    var updateExpression = "set additionalComments = :additionalComments";
    var expressionAttributeValues = {
        ":additionalComments": additionalComments
    }
    
    var params = {
        TableName:"UnknownQuestions",
        Key: {
            uid : uid
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues:"UPDATED_NEW"
    };
    
    var result = await docClient.update(params).promise();

    var emailTo = user === "EXPERT" ? originalQuestion.customerEmail : originalQuestion.expert.email;
    
    await sendNewCommentEmail(emailTo, originalQuestion.question, comment, uid );
    
    response.body =JSON.stringify(result);
    response.statusCode = 200;
    return response;

}