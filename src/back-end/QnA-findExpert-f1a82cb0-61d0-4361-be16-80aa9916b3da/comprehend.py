import boto3

client = boto3.client('comprehend')
    
def findKeyPhrase(questionToAnalyze):
    response = client.batch_detect_key_phrases(
        TextList=[
            questionToAnalyze
        ],
        LanguageCode='en'
    )
    
    keywords=[]
    for keyword in response['ResultList'][0]['KeyPhrases']:
        keywords.append(keyword['Text'])    

    print(keywords)
    return keywords