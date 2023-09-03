const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();

//comment登録API
router.post("/:id", isAuthenticated, async (req, res) => {
  const postId = parseInt(req.params.id);
  const { comment } = req.body;
  if (comment === "") {
    return;
  }
  try {
    const newComment = await prisma.comment.create({
      data: {
        comment,
        userId: req.userId,
        postId,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });
    res.json(newComment);
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "権限がありません。" });
  }
});

//特定ページのcomment取得API
router.get("/:id", async (req, res) => {
  const postId = parseInt(req.params.id);
  try {
    const getAllComments = await prisma.comment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        postId,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });
    res.json(getAllComments);
  } catch (err) {
    console.log(err);
    res.status(500).json("サーバーエラーです。");
  }
});

//comment削除API
router.delete("/:id", isAuthenticated, async (req, res) => {
  const commentId = parseInt(req.params.id);
  const deleteComment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });
  if (!(req.userId === deleteComment.userId)) {
    return res.status(401).json({ message: "権限がありません" });
  }

  try {
    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
    res.json(commentId);
  } catch (err) {
    console.log(err);
    res.status(500).json("サーバーエラーです。");
  }
});

module.exports = router;
