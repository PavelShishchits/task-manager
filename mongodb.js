const { MongoClient, ObjectId } = require('mongodb');

const connectionUrl = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

const users = [
    {
        name: 'Pavel',
        age: 28
    },
    {
        name: 'Olga',
        age: 27
    },
    {
        name: 'Misha',
        age: 1
    },
];

const tasks = [
    {
        description: 'work out',
        completed: true
    },
    {
        description: 'lunch',
        completed: false
    },
    {
        description: 'face massage',
        completed: false
    },
];


MongoClient.connect(connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true, }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database');
    }
    const db = client.db(databaseName);

    /* Delete */
    db.collection('tasks').deleteOne({
        description: 'lunch'
    })
        .then((result) => console.log(result))
        .catch((error) => console.log(error));

    /* Update */
    // db.collection('tasks').updateMany({completed: false}, {
    //     $set: {
    //         completed: true,
    //     }
    // })
    //     .then((result) => console.log(result))
    //     .catch((error) => console.log(error))

    /* Read */
    // db.collection('tasks').findOne({_id: new ObjectId("5ff2dd9d456bf21be1a67a00")}).then((task) => console.log(task));
    // db.collection('tasks').find({completed: false}).toArray().then((users) => console.log(users));

    /* Create */
    // addCollection({
    //     database: db,
    //     collectionName: 'tasks',
    //     items: tasks
    // });
    //
    // addCollection({
    //     database: db,
    //     collectionName: 'users',
    //     items: users
    // });

});

const addCollection = ({database, collectionName, items}) => {
    const collection = database.collection(collectionName);

    collection.insertMany(items).then((result) => {
        console.log(result.ops);
    }).catch((error) => {
        console.log(error);
    });
}