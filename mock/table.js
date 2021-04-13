
var mysql = require('mysql')

/* 连接数据库 */
var data = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '19990519bb',
  port: '3306',
  database: 'test'
})
var a
data.connect()
// eslint-disable-next-line handle-callback-err
data.query('SELECT * FROM area', function(error, results, fields) {
  // eslint-disable-next-line no-unused-vars
  a = results

  return a
})
module.exports = [
  {
    url: '/vue-admin-template/table/list',
    type: 'get',
    response: config => {
      // eslint-disable-next-line no-undef
      const items = a
      return {
        code: 20000,
        data: {
          // eslint-disable-next-line no-undef
          total: a.length,
          items: items
        }
      }
    }
  }
]
