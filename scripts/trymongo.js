const { MongoClient } = require('mongodb');

const DB_URL = 'mongodb://localhost/astora-db';
const em = {id: 1, name: 'A. Callback', age: 23};
function testWithCallbacks(callback) {

    console.log('\n-----------testWithCallbacks---------');

    const dbClient = new MongoClient(DB_URL, { useNewUrlParser: true });

    dbClient.connect(function (err, dbClient) {

        if(err) {
            callback(err);
            return;
        }

        console.log("Connected to MongoDB");

        const db = dbClient.db();
        const employeesCollection = db.collection('employees');

        employeesCollection.insertOne(em, function(err, res) {

            if(err) {
                dbClient.close();
                callback(err);
                return;
            }
            console.log('Result of insert:\n', res.insertedId);

            employeesCollection.find({_id: res.insertedId}).toArray(function(err, docs) {

                if(err) {
                    dbClient.close();
                    callback(err);
                    return;
                }
                console.log("Result of find:\n", docs);
                dbClient.close();
                callback(err);
            })
        })
    });
}

// testWithCallbacks(function(err) {
//     if(err) {
//         console.log(err);
//     }
// })

testWithAsync();

async function testWithAsync() {

    console.log("\n-----------testWithAsync----------");
    const dbClient = new MongoClient(DB_URL, {useNewUrlParser: true});

    try {
        await dbClient.connect();
        console.log("Connected to MongoDB");
        const db = dbClient.db();
        const employeesCollection = db.collection('employees');
        employeesCollection.createIndex({id: 1}, {unique: true});
        const res = await employeesCollection.insertOne(em);
        console.log("Result of insert: \n", res.insertedId);
        const docs = await employeesCollection.find({_id: res.insertedId}).toArray();
        console.log("Result of find:\n", docs);
    } catch (err) {
        console.log(err);
    } finally {
        dbClient.close();
    }
}