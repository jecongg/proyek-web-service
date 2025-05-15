'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('skins', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      diamond_price: Sequelize.INTEGER,
      skin_type: Sequelize.ENUM('Basic','Elite','Special','Epic','Legend','Starlight'),
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
    await queryInterface.dropTable('skins');
  }
};
