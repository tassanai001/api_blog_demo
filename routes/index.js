const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const dbUrl = 'mongodb://localhost/demo-blog';

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('connected', () => {
  console.log(`Connected to MongoDB at ${dbUrl}`);
});

db.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Define a User schema
const userSchema = new mongoose.Schema({
  name: String,
  surname: String,
  username: String,
  password: String,
});


// Define a Blog schema
const blogSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Blog = mongoose.model('Blog', blogSchema);

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  // Check if the password matches (In a real app, you should hash the passwords)
  if (user.password !== password) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  // Successful login
  res.json({ 
    message: 'Login successful', 
    _id: user._id,
    name: user.name,
    surname: user.surname,
    username: user.username
  });
});

// Route to create a new user
router.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Create a new blog
router.post('/blogs', async (req, res) => {
  try {
    // Extract data from the request body
    const { author, image, title, description } = req.body;

    console.log('req.body:', req.body);
    // Create a new blog post
    const newBlog = new Blog({
      author, // Assuming 'author' is a valid user ObjectId
      image,
      title,
      description,
    });

    // Save the blog post to the database
    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (error) {
    console.error(`Error creating blog: ${error}`);
    res.status(500).json({ error: 'Error creating blog' });
  }
});


router.get('/blogs', async (req, res) => {
  try {

    const blogs = await Blog.find()
      .populate('author', 'name surname username')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error(`Error getting blogs: ${error}`);
    res.status(500).json({ error: 'Error getting blogs' });
  }
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Blog Demo' });
});

module.exports = router;
