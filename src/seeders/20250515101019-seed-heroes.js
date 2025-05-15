'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('heroes', [
      {
        name: 'Alucard',
        diamond_price: 320,
        battle_point_price: 15000,
        role1: 'Fighter',
        role2: 'Assassin'
      },
      {
        name: 'Layla',
        diamond_price: 250,
        battle_point_price: 10000,
        role1: 'Marksman',
        role2: null
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('heroes', null, {});
  }
};
