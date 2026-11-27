import dotenv from 'dotenv';

dotenv.config();

export function getDatabaseName() {
  const dbName = process.env.MONGO_DB?.trim();
  if (!dbName) {
    throw new Error('MONGO_DB must be set to the MongoDB database name');
  }
  return dbName;
}
