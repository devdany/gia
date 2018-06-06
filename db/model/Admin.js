const connector = require('../Connector');
const Sequelize = require('sequelize');

const admin = connector.define('Admin', {
    no: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    level: {
        type: Sequelize.STRING,
        allowNull: false
    }
},{
    freezeTableName: true,
    underscored: true,
    timestamps: false
});

module.exports = admin;