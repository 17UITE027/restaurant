// server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // MySQL client

const app = express();
const PORT = 3000;

// Set up CORS
app.use(
  cors({
    origin: 'http://localhost:3001', // Your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Use your database username
  password: 'sonarathi@1999', // Use your database password
  database: 'restaurant_db', // Replace with your actual database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1); // Exit the application if the DB connection fails
  } else {
    console.log('Connected to the database');
  }
});

// Routes
app.delete('/api/delete-booking', (req, res) => {
  const { name, contact } = req.body;

  const deleteQuery = 'DELETE FROM bookings WHERE name = ? AND contact = ?';
  db.query(deleteQuery, [name, contact], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Server error', error });
    }

    if (results.affectedRows === 0) {
      return res.status(400).json({ message: "Booking not found." });
    }

    res.status(200).json({ message: "Booking deleted successfully!" });
  });
});


app.post('/api/home', (req, res) => {
  const { date, time, guests, name, contact, email } = req.body;

  if (!date || !time || !guests || !name || !contact) {
    return res.status(400).json({ message: 'All fields are required except email.' });
  }

  console.log('Reservation received:', { date, time, guests, name, contact, email });

  // Check if the date and time are already booked
  const checkAvailabilityQuery = 'SELECT * FROM bookings WHERE date = ? AND time = ?';
  db.query(checkAvailabilityQuery, [date, time], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Server error', error });
    }

    if (results.length > 0) {
      // If there is an existing booking, send a response with an alert message
      return res.status(400).json({ message: 'The selected time and date are already booked.' });
    }

    // If available, proceed with saving the booking
    const insertQuery =
      'INSERT INTO bookings (date, time, guests, name, contact, email) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [date, time, guests, name, contact, email], (error) => {
      if (error) {
        return res.status(500).json({ message: 'Server error', error });
      }
      res.status(200).json({ message: 'Reservation confirmed successfully!' });
    });
  });
});



app.delete('/api/delete-booking', (req, res) => {
  const { name, contact } = req.body;

  const deleteQuery = 'DELETE FROM bookings WHERE name = ? AND contact = ?';
  db.query(deleteQuery, [name, contact], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Server error', error });
    }

    if (results.affectedRows === 0) {
      return res.status(400).json({ message: "Booking not found." });
    }

    res.status(200).json({ message: "Booking deleted successfully!" });
  });
});


app.get("/api/view-booking/:bookingId", (req, res) => {
  const { bookingId } = req.params;
  const query = "SELECT * FROM bookings WHERE id = ?";
  db.query(query, [bookingId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }
    res.status(200).json(result[0]); // Send the first result
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
