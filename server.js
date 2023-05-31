const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors= require('cors');

const app = express();
const port = 4000;
app.use(cors({
  origin: 'https://moviesbrew.onrender.com/'

}))

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://anujgusain2001:amexjooteraj3@cluster0.etvqbgk.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Create a schema for the user
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

// Create a model for the user
const User = mongoose.model('User', userSchema);

// Create a schema for the contact message
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

// Create a model for the contact message
const Contact = mongoose.model('Contact', contactSchema);

app.use(express.json());

// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Create a new contact message
    const newMessage = new Contact({ name, email, message });
    await newMessage.save();

    res.status(201).json({ message: 'Contact message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

