'use strict';

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

const sendElasticsearchRequest = require('./elasticsearch-client');
const sendCustomerEmail = require('./email');


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

function triggerLexBuild() {
    return new Promise((resolve, reject) => {
        console.log("invoking lambda to build bot");

        const https = require('https');

        var body='';
        var jsonObject = JSON.stringify('');
    
        // the post options
        var optionspost = {
            host: 'bju7yzad46.execute-api.us-east-1.amazonaws.com',
            path: '/prod/bot',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };
    
        var reqPost = https.request(optionspost, function(res) {
            console.log("statusCode: ", res.statusCode);
            res.on('data', function (chunk) {
                body += chunk;
            });
            resolve(body);
        });
    
        reqPost.write(jsonObject);
        reqPost.end();
    });
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
    
    if(!body || !body["answer"]) {
        response.body = JSON.stringify({error: 'Answer not specified' });
        response.statusCode = 400;
        return response;
    }
    
    if(!body || !body["uid"]) {
        response.body = JSON.stringify({error: 'UID not specified' });
        response.statusCode = 400;
        return response;
    }
    
    // Submit answer
    var answer = body.answer;
    var comments = body.comments ? body.comments : "";
    var uid = body.uid;
    var updateExpression = "set answer = :answer, answerTimestamp = :answerTimestamp";
    var expressionAttributeValues = {
        ":answer": answer,
        ":answerTimestamp": new Date().getTime()
    }
    if(comments.trim() !== "")  {
        updateExpression += ", comments = :comments";
        expressionAttributeValues[":comments"] = comments;
    }
    console.log({uid, answer, comments});
    
    var params = {
        TableName:"UnknownQuestions",
        Key: {
            uid : uid
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues:"UPDATED_NEW"
    };
    
    await docClient.update(params).promise();

    // Add question to ES
    const originalQuestion = await getUnknownQuestion(uid);
    console.log({originalQuestion});

    const esId = "UnknownQuestion."+uid;
    var questionES = {
        "args": [
          ""
        ],
        "next": "",
        "questions": [
          {
            "q": originalQuestion.question
          }
        ],
        "a": answer,
        "r": {
          "buttons": [
            {
              "text": "",
              "value": ""
            }
          ],
          "subTitle": "",
          "imageUrl": "",
          "title": ""
        },
        "t": "",
        "alt": {
          "markdown": "",
          "ssml": ""
        },
        "l": "",
        "qid": esId,
        "type": "qna"
    }

    console.log(questionES);
    const paramsEs = {
        httpMethod: 'PUT',
        requestPath: 'qnabot/qna/'+esId,
        payload: questionES
    };
    console.log(paramsEs);
    const esResponse = await sendElasticsearchRequest(paramsEs);
    
    await sendCustomerEmail(originalQuestion.customerEmail, "", originalQuestion.question, answer, comments, uid);
    
    await triggerLexBuild();
    
    response.body =JSON.stringify(esResponse);
    response.statusCode = 200;
    return response;

}