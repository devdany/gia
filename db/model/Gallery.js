const connector = require('../Connector');
const Sequelize = require('sequelize');

const gallery = connector.define('Gallery', {
    no: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    img: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: true
    },
    comment: {
        type: Sequelize.STRING,
        allowNull: true
    }
},{
    freezeTableName: true,
    underscored: true,
    timestamps: false
});

module.exports = gallery;