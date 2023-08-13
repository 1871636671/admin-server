const Router = require("koa-router");
const router = new Router();
const db = require("../utils/database");
const utils = require("../utils/utils");

// 获取菜单列表
router.get("/list", async (ctx) => {
  const { roleId } = ctx.state.user;

  const menuList = [];

  // 获取菜单
  if (roleId === 1) {
    //超级管理员,返回所有菜单
    const [err2, res2] = await db.query(
      `select id,name,icon,path,view_path,parent_id,role_tag,sort_number,type from menu where is_remove=0`
    );

    const data = utils.dataFormat(res2);

    menuList.push(...data);
  } else {
    const [err3, res3] = await db.query(
      `select id,name,icon,path,view_path,parent_id,role_tag,sort_number,type from menu where id in (
        select menu_id from role_menu where role_id=${roleId}
      ) and is_remove=0`
    );

    const data = utils.dataFormat(res3);

    menuList.push(...data);
  }

  ctx.body = utils.res200(menuList);
});

//添加菜单
router.post("/add", async (ctx) => {
  const data = ctx.request.body;
  const { userId, roleId } = ctx.state.user;

  if (!data.name || data.type < 0) {
    ctx.body = utils.res500("缺少必填项参数!");

    return;
  }

  const { names, values } = utils.add(utils.to_(data));

  const [err, res] = await db.query(
    `insert into menu(${names}) values(${values})`
  );

  // 关联 角色-菜单表 (超管不用关联)
  if (roleId !== 1) {
    const [err3, res3] = await db.query(
      `insert into role_menu(menu_id,role_id) values(${res.insertId},${roleId})`
    );

    if (err3) {
      ctx.body = utils.res500(err3);

      return;
    }
  }

  if (err || err2) {
    ctx.body = utils.res500(err || err2);

    return;
  }

  ctx.body = utils.res200("添加成功!");
});

// 修改菜单
router.post("/edit", async (ctx) => {
  const data = ctx.request.body;

  if (!data.id || !data.name || data.type < 0) {
    ctx.body = utils.res500("缺少必填项参数!");

    return;
  }

  const sql = utils.edit(utils.to_(data), ["id", "children"]);

  const [err, res] = await db.query(
    `update menu set ${sql} where id=${data.id}`
  );

  if (err) {
    ctx.body = utils.res500(err);

    return;
  }

  ctx.body = utils.res200("修改成功!");
});

// 删除菜单(逻辑删除)
router.post("/remove/:menuId", async (ctx) => {
  const { userId, roleId } = ctx.state.user;

  const { menuId } = ctx.params;

  if (!menuId) {
    ctx.body = utils.res500("缺少必填项参数!");

    return;
  }

  const [err2, res2] = await db.query(`select * from menu`);

  const ids = utils.getIds(res2, Number(menuId));

  if (ids.length > 0) {
    if (roleId === 1) {
      const [err3, res3] = await db.query(
        `update menu set is_remove=1 where id in (${ids.join(",")})`
      );

      if (err3) {
        ctx.body = utils.res500(err3);

        return;
      }

      ctx.body = utils.res200("删除成功!");
    } else {
      const [err, res] = await db.query(`select * from role`);

      const roledIds = utils.getIds(res, roleId);

      const [err4, res4] = await db.query(
        `delete from role_menu where menu_id in (${ids.join(
          ","
        )}) and role_id in (${roledIds.join(",")})`
      );

      if (err4) {
        ctx.body = utils.res500(err4);

        return;
      }
      console.log(res4);
      ctx.body = utils.res200("删除成功!");
    }
  } else {
    ctx.body = utils.res500("数据不存在!");
  }
});

module.exports = router;
