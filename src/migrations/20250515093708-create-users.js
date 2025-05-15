'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      username: Sequelize.STRING,
      password: Sequelize.STRING,
      email: Sequelize.STRING,
      gender: Sequelize.CHAR(1),
      region: Sequelize.STRING,
      role: Sequelize.ENUM('Admin', 'Player'),
      diamond: { type: Sequelize.INTEGER, defaultValue: 0 },
      starlight: { type: Sequelize.BOOLEAN, defaultValue: false },
      battle_point: Sequelize.INTEGER,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deletedAt: Sequelize.DATE,
      
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};
