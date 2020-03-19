'use strict';

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});


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
    if(!body || !body["rating"]) {
        response.body = JSON.stringify({error: 'Rating not specified' });
        response.statusCode = 400;
        return response;
    }
    if(!body || !body["ratingSource"]) {
        response.body = JSON.stringify({error: 'Rating Source not specified' });
        response.statusCode = 400;
        return response;
    }
    
    
    var uid = body.uid;
    var rating = body.rating;
    var ratingSource = body.ratingSource;
    
    console.log({uid, rating, ratingSource});

    
    var originalQuestion = await getUnknownQuestion(uid);
    console.log(originalQuestion);
    var ratings = originalQuestion.ratings ? originalQuestion.ratings : [];
    
    
    ratings.push({
            rating,
            ratingSource,
            timestamp: new Date().getTime()
        });
    console.log(ratings);
    var updateExpression = "set ratings = :ratings";
    var expressionAttributeValues = {
        ":ratings": ratings
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

    
    
    response.body =JSON.stringify(result);
    response.statusCode = 200;
    return response;

}