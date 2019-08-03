const Sequelize = require('sequelize');
const Op = Sequelize.Op
const dbconfig = require('../config');

const sequelize = new Sequelize(
    dbconfig.dbschema,
    dbconfig.username,
    dbconfig.password,
    {
        'host': dbconfig.host,
        'dialect': dbconfig.dialect,
        operatorsAliases: {
          $and: Op.and,
          $or: Op.or,
          $eq: Op.eq,
          $gt: Op.gt,
          $lt: Op.lt,
          $lte: Op.lte,
          $like: Op.like,
          $ne: Op.ne
        },
        logging: false
    }
)

module.exports = sequelize;