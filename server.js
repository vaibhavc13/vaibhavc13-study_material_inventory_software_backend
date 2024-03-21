const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const http = require('http');
const fs = require('fs');
app.set('view engine', 'ejs');

mongourl="mongodb+srv://v599568:vaibhav1934@cluster0.7vzfh84.mongodb.net/?retryWrites=true&w=majority"

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(bodyParser.json());

const client = new MongoClient(mongourl, { useNewUrlParser: true, useUnifiedTopology: true });

async function databsecreation() {
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        const dbName = "Material";
        const dbList = await client.db().admin().listDatabases();
        const dbExists = dbList.databases.some(db => db.name === dbName);
        
        // Establish a connection to the database
        if (dbExists) {
            console.log(`Database "${dbName}" already exists.`);
        } else {
            // Create the database
            await client.db(dbName).createCollection('testCollection'); // Create a dummy collection
            console.log(`Database "${dbName}" created successfully.`);
        }

        const collectionName = "material";

        // Get reference to the database and collection
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Check if the collection already exists
        const collectionExists = await database.listCollections({ name: collectionName }).hasNext();
        
        if (!collectionExists) {
            // Collection doesn't exist, MongoDB will create it automatically
            console.log(`Collection "${collectionName}" doesn't exist. MongoDB will create it automatically.`);
        }
    } finally {
        // Close the client connection
        await client.close();
    }
}


async function create(subject) {
    try {
        await client.connect(); // Connect to MongoDB
        const dbName = "Material";
        const collectionName = "subjects";

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Insert document with subject and link
        const result = await collection.insertOne({ subject });

        // If document was inserted successfully
        if (result.insertedCount === 1) {
            console.log(`Material added successfully with ID: ${result.insertedId}`);
        }
    } finally {
        // Close the client connection
        await client.close();
    }
}


async function upload(link, subject) {
    try {
        await client.connect(); // Connect to MongoDB
        const dbName = "Material";
        const collectionName = "material";

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Insert document with subject and link
        const result = await collection.insertOne({ subject, link });

        // If document was inserted successfully
        if (result.insertedCount === 1) {
            console.log(`Material added successfully with ID: ${result.insertedId}`);
        }
    } finally {
        // Close the client connection
        await client.close();
    }
}

// Execute the main function
databsecreation();

async function getsub() {
    try {
        await client.connect(); // Connect to MongoDB
        const dbName = "Material";
        const collectionName = "subjects";

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Insert document with subject and link
        //const result = await collection.find('subject').toArray();
        const query = {};
        const projection = { subject : 1 }; // Include only the _id field

        // Retrieve all documents with only the _id field
        const result = await collection.find(query).project(projection).toArray();
        //const result = await collection.insertOne({ subject });
        const subjects = result.map(item => item.subject.newsub);
        console.log(subjects);

        return subjects
        // If document was inserted successfully
        
    } finally {
        // Close the client connection
        await client.close();
    }
}
// Serve the HTML file
app.get('/',async (req, res) => {
   
    let allsubjects= await getsub()
     
    //const allsubjects = ["Math", "Science", "History", "English"];
    res.render(__dirname + '/index.ejs', { allsubjects});
});

// Handle form submissions
app.post('/upload', async (req, res) => {
    
    let subject=req.body.newsub; 
    let link  = req.body.newsublink;
    console.log(req.body)
    console.log(link)
    link=link.slice(32);
    console.log(link)
    link.slice(0,-17);
    console.log(link)
    link="https://drive.google.com/thumbnail?id="+link;
    console.log(link,+"aaaaaaaaaaaaaaaaaaaaaaa")
    if (link && subject) {

        try {
            await upload(link, subject);
            res.send('Form submitted successfully!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error!');
        }
    } else {
        res.status(400).send('Bad Request: Missing link or subject!');
    }
});
app.post('/create', async (req, res) => {
    const subject = req.body.newsub
    let link=req.body.newsublink
    link=link.slice(32);
    link.slice(0,-17);
    link="https://drive.google.com/thumbnail?id="+link;
    console.log(link)
    if (subject) {
    try {
        create(subject);
        res.send('Form submitted successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error!');
    } }
     else {
        res.status(400).send('Bad Request: Missing subject!');
    }
    
    //const { subject, link } = req.body;
    console.log(req.body)});

app.post('/edit', (req, res) => {
    console.log(req.body)
    const link = req.body.link;
    const subject = req.body.subject;

    if (subject) {
        try {
            edit(subject);
            res.send('Form submitted successfully!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error!');
        }
    } else {
        res.status(400).send('Bad Request: Missing subject!');
    }
});

// Start the server
const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
