const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the index.html file statically
app.use(express.static(__dirname));

// MongoDB connection
// Connecting to the primary MongoDB URI (localhost port 27017)
mongoose.connect('mongodb://127.0.0.1:27017/vasu_portfolio')
    .then(() => console.log('✅ Connected to MongoDB Database'))
    .catch((err) => {
        console.error('❌ MongoDB connection error. Please make sure MongoDB is installed and running!');
        console.error(err);
    });

// Define a simple Schema for contact messages
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// API Route to handle contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Please fill all fields' });
        }

        const newContact = new Contact({
            name,
            email,
            message
        });

        await newContact.save();
        res.status(201).json({ success: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ error: 'Server error, could not send message' });
    }
});

// Admin Route to view all received messages from MongoDB
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Contact.find().sort({ date: -1 }); // Get all messages, newest first
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch messages' });
    }
});

// Default route to serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
