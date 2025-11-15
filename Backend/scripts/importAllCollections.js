#!/usr/bin/env node
/**
 * Import JSON files from ./db-dump-json into the configured MongoDB database.
 * WARNING: this will replace collections with the same name.
 * Usage: node scripts/importAllCollections.js
 */
import fs from 'fs/promises';
import path from 'path';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/curiocampauth';
let dbName = process.env.MONGO_DB;
if (!dbName) {
  const m = uri.match(/\/([^/?]+)(\?|$)/);
  dbName = (m && m[1]) || 'curiocamp';
}
const inDir = path.resolve(process.cwd(), 'db-dump-json');

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // read files in directory
  const files = await fs.readdir(inDir);
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const colName = path.basename(f, '.json');
    // Skip refresh token collection for security/privacy
    if (String(colName).toLowerCase() === 'refreshtokens') {
      console.log('Skipping import for', colName);
      continue;
    }
    console.log('Importing', colName);
    const content = await fs.readFile(path.join(inDir, f), 'utf8');
    const docs = JSON.parse(content);
    // replace collection
    const coll = db.collection(colName);
    await coll.deleteMany({});
    if (docs.length > 0) {
      await coll.insertMany(docs);
    }
  }

  await client.close();
  console.log('Done importing from', inDir);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
