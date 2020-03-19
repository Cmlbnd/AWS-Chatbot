from __future__ import print_function # Python 2/3 compatibility
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('UnknownQuestions')
    
def createNewQuestion(questionJson):
    
    response = table.put_item(
        Item = questionJson
    )
    print('createNewQuestion in DynamodB')