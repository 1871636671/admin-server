const db = require("./database");

const includeData = (obj, keys) => {
  const o = {};

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key) && keys.includes(key)) {
      o.key = obj.key;
    }
  }

  return o;
};

const excludeData = (obj, keys) => {
  const o = {};

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key) && !keys.includes(key)) {
      o.key = obj.key;
    }
  }

  return o;
};

const filterData = (arr, keys, mode = "include") => {
  return arr.map((item) =>
    mode === "include" ? includeData(item, keys) : excludeData(item, keys)
  );
};

// 下划线转驼峰
const toHump = (obj) => {
  const o = {};

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      let newKey = key.replace(/\_(.?)/g, (a, b) => {
        return b.toUpperCase();
      });

      o[newKey] = obj[key];
    }
  }

  return o;
};

// 驼峰转下划线
const to_ = (obj) => {
  const o = {};

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      let newKey = key.replace(/([a-z])([A-Z])/, "$1_$2").toLowerCase();

      o[newKey] = obj[key];
    }
  }

  return o;
};

// 处理数据
const add = (obj) => {
  const r = {
    names: "",
    values: "",
  };

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      r.names += key + ",";
      r.values +=
        typeof obj[key] === "string" ? `'${obj[key]}'` + "," : obj[key] + ",";
    }
  }

  r.names = r.names.slice(0, -1);
  r.values = r.values.slice(0, -1);

  return r;
};

const edit = (obj, exclude = []) => {
  let sql = "";

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      if (!exclude.includes(key)) {
        sql += `${key}=${
          typeof obj[key] === "string" ? `'${obj[key]}'` : obj[key]
        },`;
      }
    }
  }

  sql = sql.slice(0, -1);

  return sql;
};

const res200 = (data, msg) => ({
  code: 200,
  msg: msg || "请求成功!",
  data,
});

const res500 = (msg) => ({
  code: 500,
  msg: msg || "请求失败!",
  data: null,
});

const dataFormat = (arr) => arr.map(toHump);

//获取角色id
const getRoleId = async (uid) => {
  const [err, res] = await db.query(
    `select * from role where id in(
      select role_id from user_role where user_id=${uid}
    )`,
    true
  );

  console.log(res, "res");

  if (err) return null;

  // 角色是否启用
  if (res.is_active === 0) return -1;

  return res.id;
};

const getIds = (list, id) => {
  const l = [];
  let strack = [id];

  while (strack.length !== 0) {
    const i = strack.pop();

    list.forEach((d) => {
      if (d.id === i) {
        l.push(i);
      }

      if (d.parent_id === i) {
        strack.push(d.id);
      }
    });
  }

  return l;
};

const getRows = (list, id) => {
  const l = [];
  let strack = [id];

  while (strack.length !== 0) {
    const i = strack.pop();

    list.forEach((d) => {
      if (d.id === i) {
        l.push(d);
      }

      if (d.parent_id === i) {
        strack.push(d.id);
      }
    });
  }

  return l;
};

module.exports = {
  includeData,
  excludeData,
  filterData,
  toHump,
  dataFormat,
  res200,
  res500,
  add,
  to_,
  edit,
  getRoleId,
  getIds,
  getRows,
};
