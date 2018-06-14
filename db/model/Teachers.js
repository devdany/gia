const connector = require('../Connector');
const Sequelize = require('sequelize');

const teacher = connector.define('Teachers', {
    no: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    picture: {
        type: Sequelize.STRING,
        allowNull: true
    },
    degree: {
        type: Sequelize.STRING,
        allowNull: true
    },
    experience: {
        type: Sequelize.STRING,
        allowNull: true
    },
    tel: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    intro: {
        type: Sequelize.STRING,
        allowNull: true
    },
    role: {
        type: Sequelize.STRING,
        allowNull: true
    }
},{
    freezeTableName: true,
    underscored: true,
    timestamps: false
});

module.exports = teacher;