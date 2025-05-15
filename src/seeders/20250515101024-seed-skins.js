'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('skins', [
      {
        name: 'Dark Knight Alucard',
        diamond_price: 749,
        skin_type: 'Epic',
        id_hero: 1
      },
      {
        name: 'Cannon Shot Layla',
        diamond_price: 269,
        skin_type: 'Elite',
        id_hero: 2
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('skins', null, {});
  }
};
