'use strict';

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = async function(event, context, callback){
    var response = {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({})
    };
    console.log({context, event});
    
    console.log(event["queryStringParameters"]);
    
    if(!event["queryStringParameters"] || !event["queryStringParameters"]["uid"]) {
        response.body = JSON.stringify({error: 'No uid specified' });
        response.statusCode = 404;
        return response;
    }
    
    let uid = event["queryStringParameters"]['uid'];
    
    console.log("Retrieving the question for uid: "+uid)
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
    
    let items = result.Items;
    if(items.length === 0) {
        response.body = JSON.stringify({error: 'No question found' });
        response.statusCode = 404;
        return response;
    }
    
    response.body = JSON.stringify(items[0]);
    response.statusCode = 200;
    return response;

}