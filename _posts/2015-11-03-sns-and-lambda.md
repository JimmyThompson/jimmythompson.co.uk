---
layout: post
title: Linking together Lambda and SNS across AWS accounts
---

Hooking together *Amazon Web Services* (AWS) *Lambda* functions and *Simple
Notification Service* (SNS) topics is relatively trivial when working within the 
same account. However, when dealing with multiple accounts, you encounter a mire
of access controls which need to be gently configured in order for things to run
smoothly. Unfortunately, the AWS console isn't as helpful doing this kind of
thing as it is when subscribing from an SQS queue.

In order to hook together your Lambda function and your SNS topic, you need to 
do the following:

1. allow the Lambda function to subscribe to the topic, 
2. allow the topic to invoke the Lambda function,
3. subscribe the lambda function to the topic.

This guide will go through this process. We're going to attempt to hook together
a Lambda function, named `print-birth-certificate` belonging to account 
`000000000000`, to an SNS topic named `new-births` belonging to account 
`999999999999`.

## Allowing the Lambda function to subscribe to the topic

To allow the Lambda function to subscribe to the topic, you need to amend your 
topic's permissions policy to include a statement similar to the example below:

{% highlight json %}
{
  "Sid": "some-unique-identifier"
  "Effect": "Allow",
  "Principal": {
    "AWS": [
      "arn:aws:iam::000000000000:root",
    ]
  },
  "Action": [
    "SNS:Subscribe",
    "SNS:Receive"
  ],
  "Resource": "arn:aws:sns:us-east-1:999999999999:new-births"
}
{% endhighlight %}

The key permission is that the account `000000000000`, where our Lambda function
is, has the ability to `SNS:Subscribe` and `SNS:Receive` from our topic.

To do this via the CLI, you need to run the following command **with IAM 
permissions for the `999999999999` account.**

{% highlight shell %}
aws sns add-permission \
    --topic-arn "arn:aws:sns:us-east-1:999999999999:new-births" \
    --label "some-unique-identifier" \
    --aws-account-id "000000000000" \
    --action-name "Receive" "Subscribe"
{% endhighlight %}

Be sure to rename `some-unique-identifier` to something you can understand if
you came back later.

## Allowing the topic to invoke the Lambda function

Not only do you need to allow the function to subscribe to the SNS, but you need
to allow the SNS to invoke the Lambda function. The Lambda function's policy
should include a statement like the example below:

{% highlight json %}
{
  "Condition": {
    "ArnLike": {
      "AWS:SourceArn": "arn:aws:sns:us-east-1:999999999999:new-births"
    }
  },
  "Action": "lambda:InvokeFunction",
  "Resource": "arn:aws:lambda:us-east-1:000000000000:function:print-birth-certificate",
  "Effect": "Allow",
  "Principal": {
    "Service": "sns.amazonaws.com"
  },
  "Sid": "some-unique-identifier"
}
{% endhighlight %}

To do this via the CLI, you need to run the following command **with IAM 
permissions for the `000000000000` account.**

{% highlight shell %}
aws lambda add-permission \
    --function-name "print-birth-certificate" \
    --statement-id "some-unique-identifier" \
    --principal "sns.amazonaws.com" \
    --action "lambda:InvokeFunction" \
    --source-arn "arn:aws:sns:us-east-1:999999999999:new-births"
{% endhighlight %}

## Subscribing to the topic

Now the permissions between the two accounts are set, you need to subscribe the
Lambda function to the SNS topic, you can do this using the CLI **with IAM
permissions for the `000000000000` account.**

{% highlight shell %}
aws sns subscribe \
    --topic-arn "arn:aws:sns:us-east-1:999999999999:new-births" \
    --protocol "lambda" \
    --notification-endpoint "arn:aws:lambda:us-east-1:000000000000:function:print-birth-certificate"
{% endhighlight %}

From this command you should receive your subscription ARN, which is a unique
identifier based on the topic you subscribed to; in this case `new-births`. If
this worked correctly, your Lambda function should begin receiving updates
from the SNS topic.
