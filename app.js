const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const session = require("express-session");
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
// Define middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.authenticated) {
    // User is authenticated, so continue to the next middleware or route handler
    next();
  } else {
    // User is not authenticated, so redirect to the login page
    res.redirect("/login");
  }
};
app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose
  .connect(
    "mongodb+srv://bangthai:428jesqb9t@cluster0.gyv4qie.mongodb.net/parentsFeedback",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Serve the home page
app.get("/", function (req, res) {
  res.render("home");
});

// Serve static files (e.g., CSS and JavaScript files)
app.use(express.static("public"));

// Parse form data
app.use(express.urlencoded({ extended: true }));
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Define the database schema
const ParentsFeedBackSchema = new mongoose.Schema({
  name: String,
  email: String,
  contactNo: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

// Create a mongoose model based on the schema
const Parents = mongoose.model("ParentsFeedback", ParentsFeedBackSchema);

// Handle form submission
app.post("/", (req, res) => {
  const { name, email, contactNo, message } = req.body;

  // Create a new document using the Contact model and save it to the database
  const feedback = new Parents({
    name,
    email,
    contactNo,
    message,
  });
  feedback.save((err, result) => {
    if (err) {
      console.error(err);
      res.send("An error occurred while saving the contact information");
    } else {
      console.log(result);
      res.send("Thank you for submitting your contact information!");
    }
  });
});

// Display the messages data

app.get("/feedback", function (req, res) {
  res.render("feedback");
});

// Display the messages data

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle login form submission
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "adminGroupD@kscj.com" && password === "ADMINgroupD@123") {
    // Set authenticated session variable and redirect to messages page
    req.session.authenticated = true;
    res.redirect("/messages");
  } else {
    res.render("login", { error: "Invalid email or password" });
  }
});
const moment = require("moment");

app.get("/messages", isAuthenticated, (req, res) => {
  Parents.find({}, (err, messages) => {
    if (err) {
      console.error(err);
      res.send("An error occurred while retrieving the messages data");
    } else {
      messages = messages.map((message) => ({
        ...message.toObject(),
        timeAgo: moment(message.createdAt).fromNow(),
      }));
      res.render("messages", { messages });
    }
  });
  app.get("/database", isAuthenticated, (req, res) => {
    Parents.find({}, (err, messages) => {
      if (err) {
        console.error(err);
        res.send("An error occurred while retrieving the messages data");
      } else {
        // Convert the createdAt timestamp to a more human-readable format using moment.js
        messages = messages.map((message) => {
          return {
            ...message._doc,
            createdAt: moment(message.createdAt).fromNow(),
          };
        });
        res.render("database", { messages });
      }
    });
  });
});

app.post("/feedback", isAuthenticated, (req, res) => {
  const { name, email, contactNo, message } = req.body;
  const feedback = new Parents({
    name,
    email,
    contactNo,
    message,
  });
  feedback.save((err, result) => {
    if (err) {
      console.error(err);
      res.send("An error occurred while saving the feedback.");
    } else {
      res.redirect("feedback");
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
