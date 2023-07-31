const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.listen(3002, () => {
  console.log('Server is running on port 3002');
});

const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: '',
  database: 'flowpaydb',
});

// Assuming you have the required modules and configurations set up

app.post('/register', (req, res) => {
  const sentEmail = req.body.Email;
  const sentUserName = req.body.UserName;
  const sentPassword = req.body.Password;

  const checkDuplicateSQL = 'SELECT COUNT(*) AS count FROM users WHERE mail = ? OR username = ?';
  const checkDuplicateValues = [sentEmail, sentUserName];

  db.query(checkDuplicateSQL, checkDuplicateValues, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const count = results[0].count;
      if (count > 0) {
        res.status(400).json({ error: 'Email or username already exists' });
      } else {
        const insertUserSQL = 'INSERT INTO users (mail, username, password) VALUES (?, ?, ?)';
        const insertUserValues = [sentEmail, sentUserName, sentPassword];

        db.query(insertUserSQL, insertUserValues, (err, results) => {
          if (err) {
            res.status(500).json({ error: 'Failed to insert user' });
          } else {
            console.log('User inserted successfully');
            res.status(200).json({ message: 'User registered successfully!' });
          }
        });
      }
    }
  });
});

app.post('/login', (req, res) => {
  const sentLoginUserName = req.body.LoginUserName
  const sentLoginPassword = req.body.LoginPassword

  const SQL = 'SELECT * FROM users WHERE username = ?'

  db.query(SQL, [sentLoginUserName], (err, results) => {
    if (err) {
      res.send({ error: err })
    }

    if (results.length > 0) {
      const user = results[0]

      if (user.password === sentLoginPassword) {
        // Password matches, proceed with successful login
        res.send(user)
      } else {
        // Incorrect password
        res.send({ message: 'Incorrect password' })
      }
    } else {
      // No matching record found
      res.send({ message: 'Invalid credentials' })
    }
  })
})



app.post('/addCard', (req, res) => {
  const { name, cardNumber,loggedInUsername, expiryDate, cvv } = req.body;
  console.log(req.body);
  console.log("hey!");
  console.log(loggedInUsername);
  const insertSQL = 'INSERT INTO cards (name, card_number, username, card_expiration, card_cvv) VALUES (?, ?, ?,?, ?)';
  const values = [name, cardNumber,loggedInUsername, expiryDate, cvv];

  db.query(insertSQL, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        // Duplicate entry, card with the same number already exists
        res.status(409).json({ message: 'Card with the same number already exists.' });
      } else {
        console.error('Error adding card:', err);
        res.status(500).json({ message: 'Failed to add the card.' });
      }
    } else {
      console.log('Card added successfully.');
      res.status(200).json({ message: 'ss'});
    }
  });
});

app.post('/cards', (req, res) => {
  // console.log("hey!");
  // console.log(req.body);
  // console.log(req.body['loggedInUsername']);
  const SQL = `SELECT * FROM cards WHERE username = "${req.body['loggedInUsername']}"`;

  db.query(SQL, (err, results) => {
    if (err) {
      console.error('Error fetching card details:', err);
      res.status(500).json({ error: 'Error fetching card details' });
    } else {
      res.json(results);
    }
  });
});
app.post('/add_main', (req, res) => {
  // console.log("hey!");
  console.log("card:",req.body["card_number"],"username",req.body["username"]);
  // console.log(req.body['loggedInUsername']);
  const SQL = `UPDATE users SET main_card_number = "${req.body["card_number"]}" WHERE username = "${req.body["username"]}"`;

  // Now, you need to execute this SQL query using your database connection and handle the response accordingly.
  // It's essential to follow proper database connection and querying practices to prevent SQL injection and other security issues.

  // For example, if you are using MySQL and have a connection, you can execute the query like this:
  db.query(SQL, (error, results) => {
    if (error) {
      // Handle the error
      console.error(error);
      res.status(500).send('Error inserting data');
    } else {
      // Handle success
      res.status(200).send('Data inserted successfully');
    }
  });
  
});

app.delete('/cards/:id', (req, res) => {
  const cardIdToDelete = req.params.id;
  const SQL = 'DELETE FROM cards WHERE id = ?';

  db.query(SQL, [cardIdToDelete], (err, result) => {
    if (err) {
      console.error('Error deleting card:', err);
      res.status(500).json({ message: 'Failed to delete the card.' });
    } else {
      console.log('Card deleted successfully.');
      res.status(200).json({ message: 'Card deleted successfully.' });
    }
  });
});

app.post('/addTransaction', (req, res) => {
  const { name, amount, cvv } = req.body;

  // Check if any field is empty
  if (!name || !amount || !cvv) {
    return res.status(400).json({ error: 'Please fill all the fields.' });
  }

  // Insert the new transaction data into the database
  const insertQuery = 'INSERT INTO transactions (username, amount, cvv) VALUES (?, ?, ? )';
  const values = [name, amount, cvv, new Date()];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Error inserting transaction into database: ', err);
      return res.status(500).json({ error: 'Failed to add the transaction.' });
    }

    // If the insertion was successful, return success message (excluding CVV)
    const responseWithoutCVV = {
      message: 'Transaction added successfully.',
    };
    return res.status(200).json(responseWithoutCVV);
  });
});

