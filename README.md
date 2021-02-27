# aws-lambda-dynamiccron
The purpose of this service is to create multiple recurring tasks on the fly using AWS serveless architecture. Please take a look at this [article](https://medium.com/@kapil-jain-ip/build-dynamic-scheduled-task-cron-service-aws-serverless-ecac93f0d927) for more information.
# How it works?
![How it works](https://github.com/kapilip/aws-lambda-dynamiccron/blob/main/AWS-Dynamic-Cron.jpg)
1. Save an entry in the dynamodb table with a cron syntax(rate( 2 minutes)) i.e. if you want to create a recurring or single task then add extra column for it.
2. It triggers(dynamo stream) a lambda function that create a cloudwatch rule for this entry.
3. An alarm triggers on a SNS topic with data entry
4. A final lambda function is triggered and it can utilize the data entry from dynamodb table to process it's business logic

# Prerequisites
1. [Install Serverless](https://www.serverless.com/framework/docs/getting-started/)
2. [Configure AWS](https://www.serverless.com/framework/docs/providers/aws/cli-reference/config-credentials/)

# Installation
```serverless deploy -v```

# Test
```aws dynamodb put-item --table-name JobsTable --item '{"leadSourceId": {"S": "20"}, "cronExpression": {"S": "rate(2 minutes)"}}'```
