'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        username: 'player1',
        password: 'hashed_password_1',
        email: 'player1@example.com',
        gender: 'M',
        region: 'Indonesia',
        role: 'Player',
        diamond: 100,
        starlight: true,
        battle_point: 2000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin1',
        password: 'hashed_password_2',
        email: 'admin1@example.com',
        gender: 'F',
        region: 'Malaysia',
        role: 'Admin',
        diamond: 999,
        starlight: false,
        battle_point: 5000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
