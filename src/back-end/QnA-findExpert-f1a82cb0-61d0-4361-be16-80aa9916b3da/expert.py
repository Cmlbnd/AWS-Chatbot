from __future__ import print_function # Python 2/3 compatibility
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
import operator
import itertools

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SkillTable')

def getBySkill(keyPhrases):
  
  items=[]
  for keyPhrase in keyPhrases:
    expertPerKeyPhrase = table.query(
      KeyConditionExpression=Key('skill').eq(keyPhrase)
      )
    if expertPerKeyPhrase['Items']:
      for expert in expertPerKeyPhrase['Items'][0]['experts']:
        items.append(expert)
    
  sortItems = sorted(items, key=lambda expert: expert['rate'],reverse=True)
  if sortItems:
    expert = findBestExpert(sortItems)
  else:
    expert = getByIdZero()
  
  return expert
  
def getByIdZero():
    response = table.scan(
      FilterExpression=Attr('id').lt(1)
    )
    items = response['Items']
    return items[0]['experts'][0]

def findBestExpert(expertList):
  SL = ((x, i) for i, x in enumerate(expertList))
  groups = itertools.groupby(SL, key=operator.itemgetter(0))
  
  def _auxfun(g):
      item, iterable = g
      count = 0
      min_index = len(expertList)
      for _, where in iterable:
        count += 1
        min_index = min(min_index, where)
      # print 'item %r, count %r, minind %r' % (item, count, min_index)
      return count, -min_index
      
  # pick the highest-count/earliest item
  return max(groups, key=_auxfun)[0]
