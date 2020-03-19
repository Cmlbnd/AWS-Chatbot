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
    
    var questions = await docClient.scan( { TableName: "UnknownQuestions" }).promise();
    var skills = await docClient.scan( { TableName: "SkillTable" }).promise();

    
    response.body = JSON.stringify({questions: questions.Items, skills: skills.Items});
    response.statusCode = 200;
    return response;

}