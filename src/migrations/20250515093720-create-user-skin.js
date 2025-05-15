'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_skin', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      id_user: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_skin: {
        type: Sequelize.INTEGER,
        references: {
          model: 'skins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('user_skin');
  }
};
