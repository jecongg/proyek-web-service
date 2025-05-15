'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_hero', {
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
      id_hero: {
        type: Sequelize.INTEGER,
        references: {
          model: 'heroes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('user_hero');
  }
};
