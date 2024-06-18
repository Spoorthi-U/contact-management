const express = require('express');
const multer = require('multer');
const mysql = require('mysql');


const cors = require('cors'); 

const app = express();  
const upload = multer({ dest: 'uploads/' }); 

// MySQL database connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_user', 
    password: 'your_mysql_password', 
    database: 'projectfinal'
});

app.delete('/api/contacts/:phone', (req, res) => {
    const phoneNumber = req.params.phone;

    const deleteSql = 'DELETE FROM contacts WHERE phone = ?';
    db.query(deleteSql, [phoneNumber], (err, result) => {
        if (err) {
            console.error('Error deleting contact:', err);
            return res.status(500).json({ error: 'Error deleting contact' });
        }
        // Check if any rows were affected by the delete operation
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contact not found or already deleted' });
        }
        res.json({ message: 'Contact deleted successfully' });
    });
});





db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});


app.use(express.json());


app.use(cors());

app.post('/api/contacts', upload.single('profilePicture'), (req, res) => {
    const { name, phone, email, gender, group } = req.body;
    const profilePictureURL = req.file ? req.file.path : null;

    const insertSql = 'INSERT INTO contacts (name, phone, email, gender, group_name, profile_picture_url) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertSql, [name, phone, email, gender, group, profilePictureURL], (err, result) => {
        if (err) {
            console.error('Error inserting contact:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Duplicate entry error: Phone number already exists for another contact' });
            }
            return res.status(500).json({ error: 'Error inserting contact' });
        }
        res.status(201).json({
            id: result.insertId,
            name,
            phone,
            email,
            gender,
            group,
            profilePictureURL
        });
    });
});

// Endpoint to fetch all unique groups
app.get('/api/contacts/group/:group', (req, res) => {
    const groupName = req.params.group;
    const selectContactsSql = 'SELECT * FROM contacts WHERE group_name = ?';

    db.query(selectContactsSql, [groupName], (err, results) => {
        if (err) {
            console.error('Error fetching contacts:', err);
            return res.status(500).json({ error: 'Error fetching contacts' });
        }
        res.status(200).json(results);
    });
});

app.get('/api/groups', (req, res) => {
    const selectGroupsSql = 'SELECT DISTINCT group_name FROM contacts';
    db.query(selectGroupsSql, (err, results) => {
        if (err) {
            console.error('Error fetching groups:', err);
            return res.status(500).json({ error: 'Error fetching groups' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to fetch all contacts
app.get('/api/contacts', (req, res) => {
    const selectSql = 'SELECT * FROM contacts';
    db.query(selectSql, (err, results) => {
        if (err) {
            console.error('Error fetching contacts:', err);
            return res.status(500).json({ error: 'Error fetching contacts' });
        }
        res.status(200).json(results);
    });
});



// Endpoint to handle updating a contact
app.put('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, email, gender, group_name } = req.body;

    const updateSql = 'UPDATE contacts SET name = ?, phone = ?, email = ?, gender = ?, group_name = ? WHERE id = ?';
    db.query(updateSql, [name, phone, email, gender, group_name, id], (err, result) => {
        if (err) {
            console.error('Error updating contact:', err);
            return res.status(500).json({ error: 'Error updating contact' });
        }
        res.status(200).json({ message: 'Contact updated successfully' });
    });
});




// Set up a basic route for testing
app.get('/contacts', (req, res) => {
    const query = 'SELECT * FROM contacts';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching contacts:', err);
            res.status(500).json({ error: 'Error fetching contacts' });
        } else {
            res.json(results);
        }
    });
});

app.put('/contacts/:id', (req, res) => {
    const contactId = req.params.id;
    const { name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country } = req.body;
    const query = 'UPDATE contacts SET name = ?, phone = ?, gender = ?, email = ?, streetAddress = ?, city = ?, stateProvince = ?, postalCode = ?, country = ? WHERE id = ?';
    connection.query(query, [name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country, contactId], (err) => {
        if (err) {
            console.error('Error updating contact:', err);
            res.status(500).json({ error: 'Error updating contact' });
        } else {
            res.json({ message: 'Contact updated successfully' });
        }
    });
});

app.delete('/contacts/:id', (req, res) => {
    const contactId = req.params.id;
    const query = 'DELETE FROM contacts WHERE id = ?';
    connection.query(query, [contactId], (err) => {
        if (err) {
            console.error('Error deleting contact:', err);
            res.status(500).json({ error: 'Error deleting contact' });
        } else {
            res.json({ message: 'Contact deleted successfully' });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
