const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();

//ログイン中のユーザー情報取得API
router.get("/find", isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ error: "ユーザーが見つかりませんでした。" });
    }
    res.status(200).json({ user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//１つのプロフィールを取得API
router.get("/profile/:id", async (req, res) => {
  const urlId = req.params.id;
  const numberId = parseInt(urlId);

  try {
    const profileUser = await prisma.profile.findUnique({
      where: {
        userId: numberId,
      },
      include: {
        user: true,
      },
    });
    return res.status(201).json(profileUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

//プロフィール変更
router.put("/profile/:id", isAuthenticated, async (req, res) => {
  const userId = req.params.id;
  const numberId = parseInt(userId);
  const { bio } = req.body;

  if (!(req.userId === numberId)) {
    return res.status(401).json({ message: "権限がありません" });
  }
  try {
    const updated = await prisma.profile.update({
      where: {
        userId: numberId,
      },
      data: {
        bio,
      },
    });
    return res.json(updated);
  } catch (err) {
    res.status(401).json({ message: "内容が正しくありません。" });
    console.log(err);
  }
});

module.exports = router;
