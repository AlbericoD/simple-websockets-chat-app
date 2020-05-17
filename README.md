# simple-websockets-chat-app

This is the code and template for the simple-websocket-chat-app.  There are three functions contained within the directories and a CloudFormation template that wires them up to a DynamoDB table and provides the minimal set of permissions needed to run the app:

```
├── Makefile
├── README.md                   <-- This instructions file
├── lambdas
│   ├── lambdas.yaml            <-- Resources including DDB/WebSocket API/Lambda Functions
│   ├── onconnect               <-- onConnect Function
│   ├── ondisconnect            <-- onDisconnect Function
│   ├── package.json
│   └── sendmessage             <-- sendMessage Function
└── template.yaml               <-- Master stack template
```


# Deploying to your account

## AWS Credentials

Using `aws configure` to set your AWS account credentials.

## Deploy the stack

There is already a `Makefile` in the root directory, so a simple `make` command will be enough for `package -> deploy -> describe stack`.

You could go into the `Makefile` to check the specific commands.

## Testing the chat API

To test the WebSocket API, you can use [wscat](https://github.com/websockets/wscat), an open-source command line tool.

1. [Install NPM](https://www.npmjs.com/get-npm).
2. Install wscat:
``` bash
$ npm install -g wscat
```
3. On the console, connect to your published API endpoint by executing the following command:
``` bash
$ wscat -c wss://{YOUR-API-ID}.execute-api.{YOUR-REGION}.amazonaws.com/{STAGE}
```
4. To test the sendMessage function, send a JSON message like the following example. The Lambda function sends it back using the callback URL: 
``` bash
$ wscat -c wss://{YOUR-API-ID}.execute-api.{YOUR-REGION}.amazonaws.com/prod
connected (press CTRL+C to quit)
> {"action":"sendmessage", "data":"hello world"}
< hello world
```

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.
