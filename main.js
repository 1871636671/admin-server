const Koa = require("koa");
const config = require("./config");
const router = require("./router/index");
const koaJwt = require("koa-jwt");
const bodyParser = require("koa-bodyparser");
const utils = require("./utils/utils");

const app = new Koa();

// 用来获取post请求体参数
app.use(bodyParser());

// 捕获鉴权失败,统一返回客户端
app.use(function (ctx, next) {
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.body = {
        code: 401,
        msg: err.originalError ? err.originalError.message : err.message,
        data: null,
      };
    } else {
      throw err;
    }
  });
});

// jwt中间件,用来拦截和解析jwt
app.use(
  koaJwt({ secret: config.secret }).unless({
    path: config.whitePath, // 不需要验证token的接口
  })
);

app.use(async function (ctx, next) {
  if (config.whitePath.includes(ctx.path)) {
    await next();
  } else {
    const { userId } = ctx.state.user;
    const role_id = await utils.getRoleId(userId);

    if (!role_id || role_id === -1) {
      const str =
        role_id === -1
          ? "角色已被禁用,请联系管理员"
          : "角色不存在,请联系管理员";
      ctx.body = utils.res500(str);
    } else {
      ctx.state.user.roleId = role_id;
      await next();
    }
  }
});

//路由
app.use(router.routes(), router.allowedMethods());

app.listen(config.port, () => {
  console.log(`服务器以启动在http://localhost:${config.port}`);
});
