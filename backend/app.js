
// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');


// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Sequelize 
const sequelize = require("./util/database");

// Define models
const Blog = sequelize.define('Blog', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

// Relationships
Blog.hasMany(Comment);
Comment.belongsTo(Blog);

// Routes
// Create a new blog
app.post('/blogs', async (req, res) => {
  try {
    const { title, author, content } = req.body;
    const newBlog = await Blog.create({ title, author, content });
    res.json(newBlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all blogs
app.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.findAll({ include: Comment });
    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to a blog
app.post('/blogs/:blogId/comments', async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    const newComment = await Comment.create({ content });
    await blog.addComment(newComment);
    res.json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a comment
app.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    await comment.destroy();
    res.sendStatus(204); // No content
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync models with database and start server
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
});
