module.exports = {
  async up(db, client) {
    // Buat collections
    await db.createCollection('users');
    await db.createCollection('heroes');
    await db.createCollection('skins');

    // Insert data hero
    const heroResult = await db.collection('heroes').insertMany([
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

    // Insert skin
    const skinResult = await db.collection('skins').insertMany([
      {
        name: 'Dark Knight Alucard',
        diamond_price: 749,
        skin_type: 'Epic',
        id_hero: heroResult.insertedIds[0], // id Alucard,
        isBuyable: true
      }
    ]);

    // Insert user
    await db.collection('users').insertOne({
      username: 'player1',
      password: 'hashed_password', // sebaiknya hash kalau production
      email: 'player1@example.com',
      gender: 'Male',
      region: 'Indonesia',
      role: 'Player',
      diamond: 100,
      starlight: true,
      battle_point: 2000,
      owned_heroes: [
        heroResult.insertedIds[0], // Alucard
        heroResult.insertedIds[1]  // Layla
      ],
      owned_skins: [
        skinResult.insertedIds[0] // Skin Alucard
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      
    });
  },

  async down(db, client) {
    await db.collection('users').drop();
    await db.collection('heroes').drop();
    await db.collection('skins').drop();
  }
};
