const mysql = require("mysql2");
const config = require("../config");

const pool = mysql.createPool({
  host: config.mysql_host,
  port: config.mysql_port,
  database: config.mysql_databaseName,
  user: config.mysql_user,
  password: config.mysql_pwd,
  dateStrings: true, // 格式化时间
});

/**
 *
 * @param {String} sql 查询语句
 * @returns [err,res] 查询结果或者错误信息
 */
function query(sql, findOne) {
  return new Promise((reslove) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reslove([err, null]);
        return;
      }

      connection.query(sql, (e, res) => {
        if (e) {
          reslove([e, null]);
          return;
        }

        if (findOne) {
          reslove([null, res[0]]);
        } else {
          reslove([null, res]);
        }

        connection.release(); // 释放连接
      });
    });
  });
}

module.exports = {
  query,
};
