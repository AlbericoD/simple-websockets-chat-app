const connections: {[key: string]: any} = {};

export class MessageCache {

  public static addNewConnection = (connectionId: string) => {
    if (!connections[connectionId]) {
      console.log(`Add new connectionId to mem cache: ${connectionId}`);
      connections[connectionId] = true;
    }
  }

  public static removeConnection = (connectionId: string) => {
    delete connections[connectionId];
  }

  public static getAllConnections = () => {
    return Object.keys(connections);
  }
}