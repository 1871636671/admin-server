const Router = require("koa-router");
const router = new Router();
const db = require("../utils/database");
const jwt = require("jsonwebtoken");
const config = require("../config");
const dayjs = require("dayjs");
const utils = require("../utils/utils");

// 登录
router.post("/", async (ctx) => {
  const { user, password } = ctx.request.body;

  // 1. 验证账号
  if (user) {
    const [err, res] = await db.query(
      `select * from user where account='${user}'`,
      true
    );

    if (!res) {
      ctx.body = utils.res500("用户不存在!");

      return;
    }

    if (res.is_active === 0) {
      ctx.body = utils.res500("用户已被禁用,请联系管理员!");

      return;
    }

    // 2. 验证密码
    if (res && res.password === password) {
      const roleId = await utils.getRoleId(res.id);

      if (!roleId || roleId === -1) {
        ctx.body = utils.res500("角色已被禁用,请联系管理员");

        return;
      }
      // 3. 生成token
      const token = jwt.sign({ userId: res.id }, config.secret, {
        expiresIn: "30m",
      });

      const time = dayjs().format("YYYY-MM-DD HH:mm:ss");

      // 记录最后一次登录成功时间
      await db.query(
        `update user set last_login_time='${time}' where id=${res.id}`
      );

      // 记录登录信息
      await db.query(
        `insert into login_info (user_id,time) values (${res.id},'${time}')`
      );

      ctx.body = utils.res200(token);
    } else {
      ctx.body = utils.res500("密码错误!");
    }
  }
});

module.exports = router;
