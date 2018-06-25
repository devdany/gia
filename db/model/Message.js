const connector = require('../Connector');
const Sequelize = require('sequelize');

const message = connector.define('Message', {
    no: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    subject: {
        type: Sequelize.STRING,
        allowNull: true
    },
    message: {
        type: Sequelize.STRING,
        allowNull: true
    }
},{
    freezeTableName: true,
    underscored: true,
    timestamps: false
});

module.exports = message;