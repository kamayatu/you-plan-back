const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();

//いいねのオンオフ
router.put("/:id", isAuthenticated, async (req, res) => {
  const includeOb = (arr, targetId) => {
    return arr.some((item) => item.userId === targetId);
  };
  try {
    const goods = await prisma.good.findMany({
      where: {
        postId: parseInt(req.params.id),
      },
    });
    //まだ投稿にいいねが押されていなかったら
    if (!includeOb(goods, req.userId)) {
      await prisma.good.create({
        data: {
          userId: req.userId,
          postId: parseInt(req.params.id),
        },
      });
      return res.status(201).json("いいね登録しました。");
    } else {
      await prisma.good.deleteMany({
        where: {
          AND: [{ userId: req.userId }, { postId: parseInt(req.params.id) }],
        },
      });
      return res.status(201).json("投稿にいいねを外しました。");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

//特定の投稿のいいねを全て取得
router.get("/:id", async (req, res) => {
  const postId = req.params.id;
  const numberId = parseInt(postId);

  try {
    const getAllPosts = await prisma.good.findMany({
      where: {
        postId: numberId,
      },
    });
    return res.json(getAllPosts);
  } catch (err) {
    console.log(err);
  }
});

//プロフィール画面で特定ユーザーがいいねしてる投稿を全て取得API
router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  const numberId = parseInt(userId);

  try {
    const getAllPosts = await prisma.good.findMany({
      where: {
        userId: numberId,
      },
      include: {
        post: {
          select: {
            id: true,
            createdAt: true,
            title: true,
            content: true,
            author: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
    return res.json(getAllPosts);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
