# aws-lambda-dynamiccron
The purpose of this service is to create multiple recurring tasks on the fly using AWS serveless architecture.
# How it works?
![How it works](https://github.com/kapilip/aws-lambda-dynamiccron/blob/main/AWS-Dynamic-Cron.jpg)
1. Save an entry in the dynamodb table with a cron syntax(rate( 2 minutes)) i.e. if you want to create a recurring or single task then add extra column for it.
2. It triggers(dynamo stream) a lambda function that create a cloudwatch rule for this entry.
3. An alarm triggers on a SNS topic with data entry
4. A final lambda function is triggered and it can utilize the data entry from dynamodb table to process it's business logic
