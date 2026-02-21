import neo4j, { Driver, Session, type QueryResult } from 'neo4j-driver';

declare global {
  // eslint-disable-next-line no-var
  var _neo4jDriver: Driver | undefined;
}

function getDriver(): Driver | null {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER;
  const password = process.env.NEO4J_PASSWORD;
  if (!uri || !user || !password) return null;

  if (!global._neo4jDriver) {
    global._neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return global._neo4jDriver;
}

export function isNeo4jAvailable(): boolean {
  return getDriver() !== null;
}

export async function runQuery(
  cypher: string,
  params: Record<string, unknown> = {},
): Promise<QueryResult> {
  const driver = getDriver();
  if (!driver) throw new Error('Neo4j not configured');
  const session: Session = driver.session();
  try {
    return await session.run(cypher, params);
  } finally {
    await session.close();
  }
}

export async function runWrite(
  cypher: string,
  params: Record<string, unknown> = {},
): Promise<QueryResult> {
  const driver = getDriver();
  if (!driver) throw new Error('Neo4j not configured');
  const session: Session = driver.session();
  try {
    return await session.executeWrite((tx) => tx.run(cypher, params));
  } finally {
    await session.close();
  }
}

export async function runRead(
  cypher: string,
  params: Record<string, unknown> = {},
): Promise<QueryResult> {
  const driver = getDriver();
  if (!driver) throw new Error('Neo4j not configured');
  const session: Session = driver.session();
  try {
    return await session.executeRead((tx) => tx.run(cypher, params));
  } finally {
    await session.close();
  }
}
