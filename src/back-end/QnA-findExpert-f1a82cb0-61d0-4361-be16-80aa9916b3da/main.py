import expert
import question
import sendEmail
import jsonHelper
import comprehend

def handler(event,context):
  
  if not event:
    raise Exception("Json Error")
    
  jsonObject = jsonHelper.jsonBuilder(event)
  
  #use Comprehender to get relevant skills
  keyPhrases = comprehend.findKeyPhrase(jsonObject['question'])
  if not keyPhrases:
      raise Exception("NoSkillFound")
  
  print('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',keyPhrases)

  #Find experts based on the skill
  expertToQuery = expert.getBySkill(keyPhrases)
  print('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',expertToQuery)

  #UpdateJson with new object and save new question
  jsonObject = jsonHelper.jsonUpdate(jsonObject,keyPhrases,expertToQuery)
  question.createNewQuestion(jsonObject)

  #sendEmail to expert with question and link to the form
  sendEmail.sendEmail(expertToQuery,jsonObject)

  response={}
  response['expert'] = expertToQuery
  response['skills'] = keyPhrases
  response['uid'] = jsonObject['uid']
  
  return response