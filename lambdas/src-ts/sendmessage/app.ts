// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { MessageCache } from "../builder/messageCache";

enum MESSAGE_TYPE {
  SYSTEM_MESSAGE,
  SYSTEM_ERROR,
  USER_MESSAGE
}

interface Message {
  type: MESSAGE_TYPE;
  message: any;
}

const ROUTE_KEY_CONNECT = '$connect';
const ROUTE_KEY_DISCONNECT = '$disconnect';

exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("on send message", event.requestContext.connectionId, event.requestContext.routeKey, event.body);

  const {
    routeKey,
    connectionId,
    domainName,
    stage
  } = event.requestContext

  // message
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `${domainName}/${stage}`
  });

  // connect
  if (routeKey === ROUTE_KEY_CONNECT) {
    MessageCache.addNewConnection(connectionId);
    console.log(`New connection comes int, adding ${connectionId}, size: ${MessageCache.getAllConnections().length}`);
    return { statusCode: 200, body: 'Connected' };
  }

  // disconnect
  if (routeKey === ROUTE_KEY_DISCONNECT) {
    MessageCache.removeConnection(connectionId)
    console.log(`Disconnection, deleting ${connectionId}, size: ${MessageCache.getAllConnections().length}`);
    return { statusCode: 200, body: 'Connected' };
  }
  
  const { data } = JSON.parse(event.body);

  MessageCache.addNewConnection(connectionId);
  const connectionData = MessageCache.getAllConnections();

  const postCalls = connectionData.map(async (connectionId) => {
    try {
      await apigwManagementApi.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({ type: MESSAGE_TYPE.USER_MESSAGE, message: data } as Message)
      }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        MessageCache.removeConnection(connectionId)
        console.log(`Found stale connection, deleting ${connectionId}, size: ${MessageCache.getAllConnections().length}`);
      } else {
        throw e;
      }
    }
  });
  
  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};
