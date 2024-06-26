require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());



const uri = process.env.DATABASE_URI;



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = await client.db('taskmaster');
    const tasksCollection = db.collection('tasks');

    console.log('Successfully connected to MongoDB!');

    app.get('/', (req, res) => {
      res.send('Task Master Server');
    });

    app.get('/tasks', async (req, res) => {
      try {
        const tasks = await tasksCollection.find().toArray();
        res.json(tasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/tasks/archive',async (req,res)=>{
      try{
        const archive = await tasksCollection.find({status : "archive"}).toArray()
        res.json(archive)
      }catch (err){
          console.error("Error fetching archive:", err);
          res.status(500).json({ error: "Internal Server Error" });
      }
    })


    app.get('/task/:id', async (req, res) => {
      const taskId = req.params.id
      try {
        const task = await tasksCollection.findOne({
          _id: new ObjectId(taskId),
        });
        res.json(task);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/tasks', async (req, res) => {
      const newTask = req.body;
     
      try {
        const result = await tasksCollection.insertOne(newTask);
        res.status(201).json(result);
      } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.delete('/tasks/:id', async (req, res) => {
      const taskId = req.params.id;
      
      try {
        const result = await tasksCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        if (result.deletedCount === 0) {
          res.status(404).json({ error: 'Task not found' });
        } else {
          res.json({ message: 'Task deleted successfully' });
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.patch('/tasks/:id', async (req, res) => {
      const taskId = req.params.id;
      const status = req.body;
      
      try {
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: status }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({ error: 'Task not found' });
        } else {
          res.json({ message: 'Task updated successfully' });
        }
      } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Taskmaster is listening on port ${port}`);
});
