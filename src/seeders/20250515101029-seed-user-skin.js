'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('user_skin', [
      { id_user: 1, id_skin: 1 },
      { id_user: 2, id_skin: 2 }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_skin', null, {});
  }
};
