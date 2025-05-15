'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('heroes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      diamond_price: { type: Sequelize.INTEGER, allowNull: false },
      battle_point_price: { type: Sequelize.INTEGER, allowNull: false },
      role1: Sequelize.STRING,
      role2: Sequelize.STRING
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('heroes');
  }
};
