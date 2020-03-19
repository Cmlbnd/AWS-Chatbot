import uuid
import json
import random
import datetime
import time

def jsonBuilder(eventBody):

    uid = uuid.uuid4()
    dateTime = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    itemJson = {
        'uid': str(uid),
        'question': eventBody["question"],
        'conversation': eventBody["conversation"],
        'customerEmail': eventBody["customerEmail"],
        'dateTime': dateTime
    }
    
    return itemJson
    
def jsonUpdate(jsonObject, skills, expert):
    
    jsonObject['skills'] = skills
    jsonObject['expert'] = expert

    return jsonObject
