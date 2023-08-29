const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();

//新規作成プランAPI
router.post("/", isAuthenticated, async (req, res) => {
  const { title, five, six, seven, eight, nine, ten, eleven, twelve, content } = req.body;

  if (!title) {
    return res.status(400).json({ message: "タイトルがありません" });
  }
  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        five,
        six,
        seven,
        eight,
        nine,
        ten,
        eleven,
        twelve,
        content,
        authorId: req.userId,
      },
    });
    return res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

//全てのプランを取得API
router.get("/", async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
      },
    });
    return res.json(latestPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

//詳細1ページのプラン取得API
router.get("/:id", async (req, res) => {
  const urlId = req.params.id;
  const numberId = parseInt(urlId);
  try {
    const targetPost = await prisma.post.findUnique({
      where: {
        id: numberId,
      },
      include: {
        author: true,
      },
    });
    return res.status(201).json(targetPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

//１つのユーザーの全てのプラン取得API
router.get("/user/:id", async (req, res) => {
  const urlId = req.params.id;
  const numberId = parseInt(urlId);

  try {
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: numberId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
      },
    });
    return res.status(201).json(userPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

//プランの内容変更API
router.put("/edit/:id", isAuthenticated, async (req, res) => {
  const { title, five, six, seven, eight, nine, ten, eleven, twelve, content } = req.body;
  const postId = req.params.id;

  const targetData = await prisma.post.findUnique({
    where: {
      id: parseInt(postId),
    },
  });

  if (!title) {
    return res.status(400).json({ message: "タイトルがありません" });
  }
  if (!(req.userId === targetData.authorId)) {
    return res.status(401).json({ message: "権限がありません" });
  }
  try {
    const newPost = await prisma.post.update({
      where: {
        id: parseInt(postId),
      },
      data: {
        title,
        five,
        six,
        seven,
        eight,
        nine,
        ten,
        eleven,
        twelve,
        content,
      },
    });
    return res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

//プラン削除API
router.delete("/edit/:id", isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const targetData = await prisma.post.findUnique({
    where: {
      id: parseInt(postId),
    },
  });

  if (!(req.userId === targetData.authorId)) {
    return res.status(401).json({ message: "権限がありません" });
  }
  try {
    const deletePost = await prisma.post.delete({
      where: {
        id: parseInt(postId),
      },
    });
    return res.json(deletePost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

module.exports = router;
