const connector = require('../Connector');
const Sequelize = require('sequelize');

const schedule = connector.define('Schedule', {
    no: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: Sequelize.STRING,
        allowNull: false
    },
    classname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    teacher: {
        type: Sequelize.STRING,
        allowNull: false
    }
},{
    freezeTableName: true,
    underscored: true,
    timestamps: false
});

module.exports = schedule;