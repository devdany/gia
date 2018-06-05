const Sequelize = require('sequelize');
const dbconfig = require('../config');

const sequelize = new Sequelize(
    dbconfig.dbschema,
    dbconfig.username,
    dbconfig.password,
    {
        'host': dbconfig.host,
        'dialect': dbconfig.dialect
    }
)

module.exports = sequelize;