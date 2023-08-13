const Router = require("koa-router");
const router = new Router();
const db = require("../utils/database");
const utils = require("../utils/utils");

//获取角色列表
router.get("/list", async (ctx) => {
  const { userId, roleId } = ctx.state.user;

  const [err, res] = await db.query(`select * from role`);

  if (err) {
    ctx.body = utils.res500(err);

    return;
  }

  const rows = utils.dataFormat(utils.getRows(res, roleId));

  ctx.body = utils.res200(rows);
});

// 新增角色列表
router.post("/add", async (ctx) => {});

// 修改角色列表
router.post("/edit", async (ctx) => {
  const data = ctx.request.body;

  console.log(data, "???");

  if (!data.id) {
    ctx.body = utils.res500("缺少必填项参数");

    return;
  }

  const sql = utils.edit(utils.to_(data), [
    "id",
    "parent_id",
    "ids",
    "is_checked",
  ]);

  const [err, res] = await db.query(
    `update role set ${sql} where id=${data.id}`
  );

  if (data.ids && data.ids.length > 0) {
    const [err2, res2] = await db.query(
      `delete from role_menu where role_id=${data.id}`
    );

    let sql = data.ids.reduce((pre, next) => {
      return (pre += `(${next},${data.id}),`);
    }, "");

    sql = sql.slice(0, -1);

    const [err3, res3] = await db.query(
      `insert into role_menu(menu_id,role_id) values${sql}`
    );

    if (err3) {
      ctx.body = utils.res500(err3);

      return;
    }
  }

  if (err) {
    ctx.body = utils.res500(err);

    return;
  }

  ctx.body = utils.res200("修改成功!");
});

//获取单个角色详情

router.get("/detail/:roleId", async (ctx) => {
  const { roleId } = ctx.params;

  if (!roleId) {
    ctx.body = utils.res500("缺少必填项");

    return;
  }

  const [err, res] = await db.query(
    `select id,role_name,is_active,create_time from role where id=${roleId}`,
    true
  );

  const [err2, res2] = await db.query(
    `select menu_id from role_menu where role_id=${roleId}`
  );

  if (err || err2) {
    ctx.body = utils.res500(err || err2);

    return;
  }

  const data = {
    ...utils.toHump(res),
    ids: res2.map((t) => t.menu_id),
  };

  ctx.body = utils.res200(data);
});

// 删除角色列表
router.post("/delete", async (ctx) => {});

module.exports = router;
