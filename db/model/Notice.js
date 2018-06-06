const connector = require('../Connector');
const Sequelize = require('sequelize');

const notice = connector.define('Notice', {
    no: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    writer: {
        type: Sequelize.STRING,
        allowNull: false
    },
    content: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.STRING,
        allowNull: false
    }
},{
    freezeTableName: true,
    underscored: true,
    timestamps: false
});

module.exports = notice;