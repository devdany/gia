const connector = require('../Connector');
const Sequelize = require('sequelize');

const classModel = connector.define('Class', {
    no: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    target: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fee: {
        type: Sequelize.STRING,
        allowNull: false
    },
    mainTeacher: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    total: {
        type: Sequelize.STRING,
        allowNull: true
    },
    startDate: {
        type: Sequelize.STRING,
        allowNull: false
    },
    schedule: {
        type: Sequelize.STRING,
        allowNull: true
    },
    outcomes: {
        type: Sequelize.STRING,
        allowNull: true
    },
    picture: {
        type: Sequelize.STRING,
        allowNull: true
    },
    subTeacher: {
        type: Sequelize.STRING,
        allowNull: true
    }
},{
    freezeTableName: true,
    underscored: true,
    timestamps: false
});

module.exports = classModel;