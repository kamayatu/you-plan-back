const express = require("express");
const app = express();
const cors = require("cors");
const authRoute = require("./router/auth");
const postsRoute = require("./router/posts");
const usersRoute = require("./router/users");
const goodRoute = require("./router/good");
const commentRoute = require("./router/comment");

app.use(cors());
app.use(express.json());
require("dotenv").config();

const PORT = 8000;

app.use("/api/auth", authRoute);
app.use("/posts", postsRoute);
app.use("/users", usersRoute);
app.use("/good", goodRoute);
app.use("/comment", commentRoute);

app.listen(PORT, () => console.log(`server is running on Port${PORT}`));
