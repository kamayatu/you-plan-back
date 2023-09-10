const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const saltRounds = 10;
const prisma = new PrismaClient();

//新規ユーザー登録API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const foundUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (foundUser) {
    return res.status(401).json({ error: "登録済みです。" });
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      profile: {
        create: {
          bio: "はじめまして",
        },
      },
    },
  });

  return res.json({ user });
});

//ログインAPI
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const foundUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!foundUser) {
    return res.status(401).json({ error: "そのユーザーは存在しません" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (match) {
    const token = jwt.sign({ email: foundUser.email, id: foundUser.id }, process.env.SECRET_KEY, { algorithm: "HS256", expiresIn: "1d" });

    res.json({ token });
  } else {
    res.status(401).json({ error: "パスワードが間違っています。" });
  }
});

module.exports = router;
