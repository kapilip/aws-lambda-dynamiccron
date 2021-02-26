'use strict';

const AWS = require("aws-sdk");
const cloudWatchEvents = new AWS.CloudWatchEvents();

module.exports.watchCronJobs = async (event, context, callback) => {
  return new Promise(async (resolve, reject) => {
    event.Records.forEach(function(record) {
        console.log("Processing:", record);
        var topicArn = process.env.JOBS_TOPIC_ARN;
        if (record.eventName == 'INSERT') {
            var ruleName = "Rule_"+record.dynamodb.NewImage.leadSourceId.S;
            var cronExpression = record.dynamodb.NewImage.cronExpression.S;
            var cronCloudWatchEventsTarget = "CronCloudWatchEventsTarget_"+record.dynamodb.NewImage.leadSourceId.S
            var data = record.dynamodb.NewImage;
            return new Promise(async (resolve, reject) => {
                const ruleArn = await cloudWatchPutRule(ruleName, cronExpression).catch(err => {
                    reject(err)
                    return
                })

                await cloudWatchAddTargets(ruleName, data, topicArn, cronCloudWatchEventsTarget).catch(err => {
                    reject(err)
                    return
                })
                resolve(true)
            });
        }  else if (record.eventName == 'REMOVE') {
            var ruleName = "Rule_"+record.dynamodb.OldImage.leadSourceId.S;
            var cronExpression = record.dynamodb.OldImage.cronExpression.S;
            var cronCloudWatchEventsTarget = "CronCloudWatchEventsTarget_"+record.dynamodb.OldImage.leadSourceId.S

            return new Promise(async (resolve, reject) => {
                await cloudWatchRemoveTargets(ruleName, cronCloudWatchEventsTarget).catch(err => {
                    reject(err)
                    return
                })
                await cloudWatchDeleteRule(ruleName, cronExpression).catch(err => {
                    reject(err)
                    return
                })
                resolve(true)
            });

        }
        else {

        }
    });
  });
};

function cloudWatchPutRule(ruleName, cronExpression) {
    return new Promise((resolve, reject) => {
        console.log("Adding a rule: "+ruleName + ": " + cronExpression);
        const cloudWatchEventParams = {
            Name: ruleName,
            ScheduleExpression: cronExpression,
            State: 'ENABLED'
        }

        cloudWatchEvents.putRule(cloudWatchEventParams, function (err, data) {
            if (err) {
                console.log('Cloud Watch Put Rule Error', err)
                reject(err)
            } else {
                console.log('Cloud Watch Put Rule Success', data.RuleArn)
                resolve(data.RuleArn)
            }
        })
    })
}

function cloudWatchDeleteRule(ruleName, cronExpression) {
    return new Promise((resolve, reject) => {
        console.log("Deleting a rule: "+ruleName + ": " + cronExpression);
        const cloudWatchEventParams = {
            Name: ruleName, /* required */
            // EventBusName: 'STRING_VALUE',
            Force: true
        }

        cloudWatchEvents.deleteRule(cloudWatchEventParams, function(err, data) {
            if (err) {
                console.log('Cloud Watch Deleting Rule Error', err)
                reject(err)
            } else {
                console.log('Cloud Watch Deleting Rule Success', data.RuleArn)
                resolve(data.RuleArn)
            }
        });
    })
}


function cloudWatchAddTargets(ruleName, data, topicArn, cronCloudWatchEventsTarget) {
    return new Promise((resolve, reject) => {
        console.log("Adding a target");
        const targetParams = {
            Rule: ruleName,
            Targets: [
                {
                    Arn: topicArn,
                    Id: cronCloudWatchEventsTarget,
                    Input: JSON.stringify(data)
                }
            ]
        };

        cloudWatchEvents.putTargets(targetParams, function (err, data) {
            if (err) {
                console.log("Add Target Error", err);
                reject(err)
            } else {
                console.log("Add Target Success", data);
                resolve(data)
            }
        });
    })

}

function cloudWatchRemoveTargets(ruleName, cronCloudWatchEventsTarget) {
    return new Promise((resolve, reject) => {
        console.log("Removing a target");
        const targetParams = {
            Ids: [ /* required */
                cronCloudWatchEventsTarget,
                /* more items */
              ],
              Rule: ruleName, /* required */
              // EventBusName: 'STRING_VALUE',
              Force: true
        };

        cloudWatchEvents.removeTargets(targetParams, function(err, data) {
            if (err) {
                console.log("Removing Target Error", err);
                reject(err)
            } else {
                console.log("Removing Target Success", data);
                resolve(data)
            }
        });
    })

}
module.exports.syncDataSource = async (event, context, callback) => {
  console.log('EVENT', JSON.stringify(event));
  callback(null);
}
