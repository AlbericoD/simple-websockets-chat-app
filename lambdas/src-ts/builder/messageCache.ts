import * as AWS from 'aws-sdk';
import * as memjs from 'memjs';

const { CACHE_ADDRESS, CACHE_PORT } = process.env;
const memcachedClient = memjs.Client.create(`${CACHE_ADDRESS}:${CACHE_PORT}`);
const MAIN_ROOM = "main-room";

interface ConnectionMap {
  [key: string]: any;
}

const elasticCacheClient = new AWS.ElastiCache({
  endpoint: CACHE_ADDRESS
});

export class MessageCache {

  public static addNewConnection = async (connectionId: string) => {
    const connections = (await memcachedClient.get(MAIN_ROOM)).value as ConnectionMap;

    if (!connections || !connections[connectionId]) {
      console.log(`Add new connectionId to mem cache: ${connectionId}`);
      connections[connectionId] = true;
    }
    await MessageCache.saveConnections(connections);
  }

  public static removeConnection = async (connectionId: string) => {
    const connections = (await memcachedClient.get(MAIN_ROOM)).value as ConnectionMap;
    if (connections) {
      delete connections[connectionId]
      await MessageCache.saveConnections(connections);
    }
  }

  public static getAllConnections = async () => {
    const connections = (await memcachedClient.get(MAIN_ROOM)).value as ConnectionMap;
    console.log(`get connections ${connections.toString()}`);
    return Object.keys(JSON.parse(connections.toString()));
  }

  private static saveConnections = async (connections: any) =>{
    const result = await memcachedClient.add(MAIN_ROOM, JSON.stringify(connections), {});
    console.log(`add new connection result ${result}`)
  }
}