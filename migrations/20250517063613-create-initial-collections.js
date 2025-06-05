module.exports = {
  async up(db, client) {
    // Buat collections
    await db.createCollection("users");
    await db.createCollection("heroes");
    await db.createCollection("skins");
    await db.createCollection("payment_histories"); // Tambahan

    // Insert data hero
    const heroResult = await db.collection("heroes").insertMany([
      {
        name: "Alucard",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: "Assassin",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Layla",
        diamond_price: 250,
        battle_point_price: 10000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Tigreal",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Tank",
        role2: "Support",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Eudora",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Franco",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Tank",
        role2: "Support",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Miya",
        diamond_price: 250,
        battle_point_price: 10000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Zilong",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: "Assassin",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Nana",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: "Support",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Balmond",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: "Tank",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Alice",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: "Tank",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Grock",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Tank",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Harley",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: "Assassin",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Bruno",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Claude",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Lancelot",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Assassin",
        role2: "Fighter",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Lesley",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Marksman",
        role2: "Assassin",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Lunox",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Gusion",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Assassin",
        role2: "Mage",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Khufra",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Tank",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Kadita",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: "Assassin",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Selena",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: "Assassin",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Ling",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Assassin",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Dyrroth",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: "Assassin",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Lylia",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Masha",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: "Tank",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Baxia",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Tank",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Wanwan",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Silvanna",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: "Tank",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Atlas",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Tank",
        role2: "Support",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Popol and Kupa",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Yu Zhong",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: "Tank",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Luo Yi",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: "Support",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Benedetta",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Assassin",
        role2: "Fighter",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Barats",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Tank",
        role2: "Fighter",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Brody",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Yve",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Mathilda",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Support",
        role2: "Assassin",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Paquito",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Beatrix",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Phoveus",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Natan",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Aamon",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Assassin",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Valentina",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Edith",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Tank",
        role2: "Marksman",
        image_hero: null, // Ditambahkan
      },
      {
        name: "Floryn",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Support",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Aulus",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Melissa",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Marksman",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Xavier",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Mage",
        role2: null,
        image_hero: null, // Ditambahkan
      },
      {
        name: "Julian",
        diamond_price: 320,
        battle_point_price: 15000,
        role1: "Fighter",
        role2: "Mage",
        image_hero: null, // Ditambahkan
      },
    ]);

    // Insert skin
    const skinResult = await db.collection("skins").insertMany([
      {
        name: "Dark Knight Alucard",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[0],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Tamer Layla",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[1],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Sacred Hammer Tigreal",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[2],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "V.E.N.O.M. Eudora",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[3],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Apocalypse Knight Franco",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[4],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Modena Butterfly Miya",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[5],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Zilong",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[6],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Aqua Pura Nana",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[7],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Balmond",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[8],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Steam Glider Alice",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[9],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Grock",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[10],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "V.E.N.O.M. Harley",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[11],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Bruno",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[12],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Claude",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[13],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Lancelot",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[14],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Lesley",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[15],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Lunox",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[16],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Gusion",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[17],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Khufra",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[18],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Dragon Hunter Kadita",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[19],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Alucard",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[0],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Layla",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[1],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Tigreal",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[2],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Eudora",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[3],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Franco",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[4],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Miya",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[5],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Zilong",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[6],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Nana",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[7],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Selena",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[20],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Ling",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[21],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Dyrroth",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[22],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Lylia",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[23],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Masha",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[24],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Baxia",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[25],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Wanwan",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[26],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Silvanna",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[27],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Atlas",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[28],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Popol and Kupa",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[29],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Yu Zhong",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[30],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Luo Yi",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[31],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Benedetta",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[32],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Barats",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[33],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Brody",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[34],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Yve",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[35],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Mathilda",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[36],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Paquito",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[37],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Beatrix",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[38],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Phoveus",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[39],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Natan",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[40],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Aamon",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[41],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Valentina",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[42],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Edith",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[43],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Floryn",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[44],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Aulus",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[45],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Melissa",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[46],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Xavier",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[47],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Epic Julian",
        diamond_price: 749,
        skin_type: "Epic",
        id_hero: heroResult.insertedIds[48],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Selena",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[20],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Ling",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[21],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Dyrroth",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[22],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Lylia",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[23],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Masha",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[24],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Baxia",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[25],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Wanwan",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[26],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
      {
        name: "Legend Silvanna",
        diamond_price: 1499,
        skin_type: "Legend",
        id_hero: heroResult.insertedIds[27],
        isBuyable: true,
        image_skin: null, // Ditambahkan
      },
    ]);

    // Insert user
    await db.collection("users").insertOne({
      username: "player1",
      password: "hashed_password", // sebaiknya hash kalau production
      email: "player1@example.com",
      gender: "Male",
      region: "Indonesia",
      role: "Player",
      diamond: 100,
      starlight: true,
      battle_point: 2000,
      owned_heroes: [
        heroResult.insertedIds[0], // Alucard
        heroResult.insertedIds[1], // Layla
      ],
      owned_skins: [
        skinResult.insertedIds[0], // Skin Alucard
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Insert 10 dummy users
    const dummyUsers = [
      {
        username: "player2",
        password: "hashed_password",
        email: "player2@example.com",
        gender: "Female",
        region: "Indonesia",
        role: "Player",
        diamond: 500,
        starlight: false,
        battle_point: 5000,
        owned_heroes: [
          heroResult.insertedIds[2],
          heroResult.insertedIds[3],
        ], // Tigreal, Eudora
        owned_skins: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "player3",
        password: "hashed_password",
        email: "player3@example.com",
        gender: "Male",
        region: "Malaysia",
        role: "Player",
        diamond: 300,
        starlight: true,
        battle_point: 3000,
        owned_heroes: [
          heroResult.insertedIds[4],
          heroResult.insertedIds[5],
        ], // Franco, Miya
        owned_skins: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "player4",
        password: "hashed_password",
        email: "player4@example.com",
        gender: "Female",
        region: "Singapore",
        role: "Player",
        diamond: 1000,
        starlight: true,
        battle_point: 8000,
        owned_heroes: [
          heroResult.insertedIds[6],
          heroResult.insertedIds[7],
        ], // Zilong, Nana
        owned_skins: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "player5",
        password: "hashed_password",
        email: "player5@example.com",
        gender: "Male",
        region: "Thailand",
        role: "Player",
        diamond: 200,
        starlight: false,
        battle_point: 1500,
        owned_heroes: [
          heroResult.insertedIds[8],
          heroResult.insertedIds[9],
        ], // Balmond, Alice
        owned_skins: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "player6",
        password: "hashed_password",
        email: "player6@example.com",
        gender: "Female",
        region: "Vietnam",
        role: "Player",
        diamond: 800,
        starlight: true,
        battle_point: 6000,
        owned_heroes: [
          heroResult.insertedIds[10],
          heroResult.insertedIds[11],
        ], // Grock, Harley
        owned_skins: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "player7",
        password: "hashed_password",
        email: "player7@example.com",
        gender: "Male",
        region: "Philippines",
        role: "Player",
        diamond: 400,
        starlight: false,
        battle_point: 2500,
        owned_heroes: [
          heroResult.insertedIds[12],
          heroResult.insertedIds[13],
        ], // Bruno, Claude
        owned_skins: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "player8",
        password: "hashed_password",
        email: "player8@example.com",
        gender: "Female",
        region: "Brunei",
        role: "Player",
        diamond: 600,
        starlight: true,
        battle_point: 4500,
        owned_heroes: [
          heroResult.insertedIds[14],
          heroResult.insertedIds[15],
        ], // Lancelot, Lesley
        owned_skins: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "player9",
        password: "hashed_password",
        email: "player9@example.com",
        gender: "Male",
        region: "Cambodia",
        role: "Player",
        diamond: 700,
        starlight: false,
        battle_point: 5500,
        owned_heroes: [
          heroResult.insertedIds[16],
          heroResult.insertedIds[17],
        ], // Lunox, Gusion
        owned_skins: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "player10",
        password: "hashed_password",
        email: "player10@example.com",
        gender: "Female",
        region: "Laos",
        role: "Player",
        diamond: 900,
        starlight: true,
        battle_point: 7000,
        owned_heroes: [
          heroResult.insertedIds[18],
          heroResult.insertedIds[19],
        ], // Khufra, Kadita
        owned_skins: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection("users").insertMany(dummyUsers);
  },

  async down(db, client) {
    await db.collection("users").drop();
    await db.collection("heroes").drop();
    await db.collection("skins").drop();
    await db.collection("payment_histories").drop();
  },
};
