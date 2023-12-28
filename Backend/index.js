const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./Models/User'); 
const Contact = require('./Models/Contact');
const app = express();
const PORT = process.env.PORT || 3000;

// Connection URI
const dbURI = 'mongodb+srv://Ajay:SxiU0Ddll1QKxbYv@cluster0.frqckpk.mongodb.net/your_database?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Middleware
app.use(express.static(path.join(__dirname, 'Views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'knaesjobgiew', resave: true, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('views', './Views'); 


app.get('/', (req, res) => {
    res.render('home', {
      user: req.session.user,
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage,
    });
  
    
    req.session.successMessage = null;
    req.session.errorMessage = null;
  });
  
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.redirect('login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });

    if (user) {
     
      req.session.user = user;
      return res.redirect('/');
    }

    res.status(401).send('Invalid username or password');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during login');
  }
});

 
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/contact', (req, res) => {
    res.render('contact', { user: req.session.user });
  });
  
app.post('/contact', async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
      const newContact = new Contact({ name, email, phone, message });
      await newContact.save();
  
       
      req.session.successMessage = 'Form submitted successfully!';
      res.redirect('/');
    } catch (error) {
      console.error(error);
  
    
      req.session.errorMessage = 'Error submitting form. Please try again.';
      res.redirect('/');
    }
  });
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
