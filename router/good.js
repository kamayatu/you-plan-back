const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();

//good登録API
router.post("/:id", isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const numberPostId = parseInt(postId);
  try {
    const newGood = await prisma.good.create({
      data: {
        userId: req.userId,
        postId: numberPostId,
      },
    });
    return res.json(newGood);
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "権限がありません。" });
  }
});

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

//プロフィールで特定ユーザーがいいねしてる投稿を全て取得API
router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  const numberId = parseInt(userId);

  try {
    const getAllPosts = await prisma.good.findMany({
      where: {
        userId: numberId,
      },
    });
    return res.json(getAllPosts);
  } catch (err) {
    console.log(err);
  }
});

//お気に入り削除API
router.delete("/:id", isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const numberPostId = parseInt(postId);

  try {
    await prisma.good.delete({
      where: {
        id: numberPostId,
      },
    });
  } catch (err) {}
});
module.exports = router;
