import test from 'ava';
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb+srv://texbroadbear:UKPjlPhitlhrrJ3N@cluster.unsv0yh.mongodb.net/";


test('db ping', async t => {

    //Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(uri, {
        serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
    });

   
  
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    // Ensures that the client will close when you finish/error
    await client.close();

    t.pass()
    
})

