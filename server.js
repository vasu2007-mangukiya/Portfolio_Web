const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // ✅ added

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

/* =======================
   ✅ MongoDB Connection
======================= */

// 🔥 Use env variable instead of hardcoding
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vasu_portfolio';

mongoose.connect(MONGO_URI)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => {
    console.error('❌ MongoDB Connection Error:');
    console.error(err.message);
});

/* =======================
   ✅ Schema & Model
======================= */

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },   // ✅ validation added
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

/* =======================
   ✅ Routes
======================= */

// 📩 Contact Form API
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // ✅ extra validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // ✅ If MongoDB is not connected, save to a local JSON file so you STILL RECEIVE IT!
        if (mongoose.connection.readyState !== 1) {
            console.warn(`⚠️ MongoDB is offline! Saving message to local messages.json file instead for: ${name}`);
            const fs = require('fs');
            const path = require('path');
            const messagesFile = path.join(__dirname, 'messages.json');
            
            let messages = [];
            if (fs.existsSync(messagesFile)) {
                messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
            }
            messages.push({ name, email, message, date: new Date().toISOString() });
            fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

            return res.status(201).json({ success: 'Message sent successfully!' });
        }

        const newContact = new Contact({ name, email, message });
        await newContact.save();

        res.status(201).json({ success: 'Message sent successfully!' });

    } catch (error) {
        console.error('❌ Error saving contact:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 📊 Get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Contact.find().sort({ date: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch messages' });
    }
});

/* =======================
   ✅ Frontend Route
======================= */

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the admin panel to view messages
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

/* =======================
   ✅ Server Start
======================= */

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});