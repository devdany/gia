const connector = require('../Connector');
const Sequelize = require('sequelize');

const popup = connector.define('VideoPopup', {
  no: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  notice_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
},{
  freezeTableName: true,
  underscored: true,
  timestamps: false
});

module.exports = popup;