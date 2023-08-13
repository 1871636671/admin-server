const Router = require("koa-router");
const router = new Router();
const db = require("../utils/database");
const utils = require("../utils/utils");

router.get("/info", async (ctx) => {
  const { userId } = ctx.state.user;

  const [err4, res4] = await db.query(
    `select user_name from user where id=${userId}`,
    true
  );

  if (res4) {
    const info = utils.toHump(res4);

    ctx.body = utils.res200(info);
  }
});

module.exports = router;
