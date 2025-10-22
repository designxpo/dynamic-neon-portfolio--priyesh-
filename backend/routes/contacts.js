const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

// POST /api/contacts - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, contactNumber, message } = req.body;

    // Basic validation
    if (!name || !email || !contactNumber || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newContact = new Contact({
      name,
      email,
      contactNumber,
      message
    });

    const savedContact = await newContact.save();
    res.status(201).json({ message: 'Contact form submitted successfully', contact: savedContact });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/contacts - Get all contact submissions (for admin)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
