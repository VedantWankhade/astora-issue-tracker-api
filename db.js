require('dotenv').config();
const { MongoClient } = require('mongodb');

let db;

async function connectToDB() {
  const dbClient = await new MongoClient(DB_URL, { useNewUrlParser: true });
  // local database api url
  const DB_URL = process.env.DB_URL || 'mongodb://localhost/astora-db';
  await dbClient.connect();
  console.log('Connected to database api at ', DB_URL);
  db = dbClient.db();
}

async function getNextSequence(idName) {
  const result = await db
    .collection('counters')
    .findOneAndUpdate(
      { _id: idName },
      { $inc: { current: 1 } },
      { returnOriginal: false },
    );
  return result.value.current;
}

function getDB() {
  return db;
}

module.exports = { connectToDB, getNextSequence, getDB };
