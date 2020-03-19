import json
import os
import boto3
from botocore.vendored import requests
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
client = boto3.client('dynamodb')

def deleteTable(table):
    print('deleting table')
    return client.delete_table(TableName=table)


def createTable(table):
    waiter = client.get_waiter('table_not_exists')
    waiter.wait(TableName=table)
    print('creating table')
    table = dynamodb.create_table(
        TableName=table,
        KeySchema=[
            {
                'AttributeName': 'uid',
                'KeyType': 'HASH'
            }
        ],
        AttributeDefinitions= [
            {
                'AttributeName': 'uid',
                'AttributeType': 'S'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 1,
            'WriteCapacityUnits': 1
        },
        StreamSpecification={
            'StreamEnabled': False
        }
    )



def emptyTable(table):
    deleteTable(table)
    createTable(table)