require('dotenv').config();
const { MongoClient } = require('mongodb');

const DB_URL = process.env.DB_URL || 'mongodb://localhost/astora-db';
const em = { id: 1, name: 'A. Callback', age: 23 };

function testWithCallbacks(callback) {
  console.log('\n-----------testWithCallbacks---------');

  const dbClient = new MongoClient(DB_URL, { useNewUrlParser: true });

  dbClient.connect((connErr) => {
    if (connErr) {
      callback(connErr);
      return;
    }

    console.log('Connected to database', DB_URL);

    const db = dbClient.db();
    const employeesCollection = db.collection('employees');

    employeesCollection.insertOne(em, (insertErr, res) => {
      if (insertErr) {
        dbClient.close();
        callback(insertErr);
        return;
      }
      console.log('Result of insert:\n', res.insertedId);

      employeesCollection
        .find({ _id: res.insertedId })
        .toArray((findErr, docs) => {
          if (findErr) {
            dbClient.close();
            callback(findErr);
            return;
          }
          console.log('Result of find:\n', docs);
          dbClient.close();
          callback(findErr);
        });
    });
  });
}

// testWithCallbacks(function(err) {
//     if(err) {
//         console.log(err);
//     }
// })

testWithAsync();

async function testWithAsync() {
  console.log('\n-----------testWithAsync----------');
  const dbClient = new MongoClient(DB_URL, { useNewUrlParser: true });

  try {
    await dbClient.connect();
    console.log('Connected to database', DB_URL);
    const db = dbClient.db();
    const employeesCollection = db.collection('employees');
    employeesCollection.createIndex({ id: 1 }, { unique: true });
    const res = await employeesCollection.insertOne(em);
    console.log('Result of insert: \n', res.insertedId);
    const docs = await employeesCollection
      .find({ _id: res.insertedId })
      .toArray();
    console.log('Result of find:\n', docs);
  } catch (err) {
    console.log(err);
  } finally {
    dbClient.close();
  }
}
