const Router = require("koa-router");
const router = new Router({
  prefix: "/api",
});

const login_router = require("./login");

const menu_router = require("./menu");

const user_router = require("./user");

const role_router = require("./role");

router.use("/login", login_router.routes(), login_router.allowedMethods());
router.use("/menu", menu_router.routes(), menu_router.allowedMethods());
router.use("/user", user_router.routes(), user_router.allowedMethods());
router.use("/role", role_router.routes(), role_router.allowedMethods());

module.exports = router;
