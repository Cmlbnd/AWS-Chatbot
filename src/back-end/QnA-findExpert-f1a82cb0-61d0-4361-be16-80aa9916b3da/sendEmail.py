from __future__ import print_function # Python 2/3 compatibility
import boto3
from botocore.exceptions import ClientError
import os

def sendEmail(expertToQuery,questionToAnswer):

    SENDER = "HAL Bot <{}>".format(os.environ['EMAIL_CHATBOT'])
    RECIPIENT = expertToQuery['email']
    AWS_REGION = "us-east-1"
    SUBJECT = "[HAL] New question: {}".format(questionToAnswer['question'])

    BODY_TEXT = ("Amazon SES Test (Python)\r\n"
                 "This email was sent with Amazon SES using the "
                 "AWS SDK for Python (Boto)."
                )
                
    BODY_HTML = """<html>
    <head></head>
    <body>
      Hello {} {},<br />
      <br/>
      One of our customers needs your help. Can you please click <a href= 'https://s3.amazonaws.com/hal-bot/question.html?uid={}'>here</a> to answer the following question: <br/>
      <br />
      <b>Question:</b> {}<br/>
      <br/>
      Thank you,<br/>
      HAL
    </body>
    </html>
                """.format(expertToQuery['firstName'],expertToQuery['lastName'],questionToAnswer['uid'],questionToAnswer['question'] )    
                
    CHARSET = "UTF-8"
    client = boto3.client('ses',region_name=AWS_REGION)
    try:
        response = client.send_email(
            Destination={
                'ToAddresses': [RECIPIENT]},
            Message={
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': BODY_HTML
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': BODY_TEXT
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': SUBJECT
                },
            },
            Source=SENDER,
        )

    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        print("Email sent! Message ID:"),
        print(response['MessageId'])