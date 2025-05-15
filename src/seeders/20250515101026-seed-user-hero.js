'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('user_hero', [
      { id_user: 1, id_hero: 1 },
      { id_user: 1, id_hero: 2 },
      { id_user: 2, id_hero: 2 }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_hero', null, {});
  }
};
