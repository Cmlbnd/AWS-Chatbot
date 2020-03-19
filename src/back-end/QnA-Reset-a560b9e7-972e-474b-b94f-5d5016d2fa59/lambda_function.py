import json
import os
import boto3
from botocore.vendored import requests
from boto3.dynamodb.conditions import Key, Attr
import deleteTable

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('UnknownQuestions')

def lambda_handler(event, context):
    uidList = findUids()
    
    for uid in uidList:
        print(uid)
        response = deleteInElasticSearch(uid)
        print(response)
    
    deleteTable.emptyTable('UnknownQuestions')
    rebuildLex()
    return {
        'statusCode': 200,
        'body': 'Done'
    }

def findUids():
    items = table.scan( )
    uidList =[]
    size=len(items['Items'])
    
    for i in range(size) :
        uidList.append(items['Items'][i]['uid'])
    return uidList

def deleteInElasticSearch(uid):
    url = os.environ['QNA_QUESTIONS_ENDPOINT'] +'UnknownQuestion.' + uid
    data = '''{
        "endpoint": "search-qnabot-elastic-16x8drir5zf0e-ph2splbwdbo7fglo4was3rho3a.us-east-1.es.amazonaws.com",
        "method": "POST",
        "path": "/qnabot/_delete_by_query?refresh=wait_for",
        "body": {
            "query": {
                "match": {
                    "qid": "UnknownQuestion.''' + uid + ''' "
                }
            }
        }
    }'''
    response = requests.delete(url, data=data)
    return response
    
def rebuildLex():
    print('Build Le')
    url = os.environ['LEX_BUILD']
    data = '''{}'''
    response = requests.post(url, data=data)
    return response