const User = require("../models/User");
const Hero = require("../models/Hero");
const Skin = require("../models/Skin");
const mongoose = require("mongoose");

exports.addToCart = async (req, res) => {
    const { itemId } = req.body;

    // Validasi field
    if (!itemId) {
        return res.status(400).json({
            message: "Field itemId harus disertakan",
        });
    }

    // Validasi format ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
            message:
                "Format itemId tidak valid. Harus berupa ObjectId MongoDB (24 karakter hex string)",
        });
    }

    try {
        const userId = req.user.id;

        // Cari user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Cek apakah item sudah ada di cart
        const alreadyInCart = user.cart.some(
            (item) => item.item_id.toString() === itemId
        );

        if (alreadyInCart) {
            return res.status(400).json({
                message: "Item sudah ada di cart",
            });
        }

        // Coba cari di collection Hero
        let item = await Hero.findById(itemId);

        let itemType = null;
        let itemName = null;

        if (item) {
            itemType = "Hero";
            itemName = item.name;
        } else {
            // Jika tidak ketemu di Hero, coba cari di Skin
            item = await Skin.findById(itemId);
            if (item) {
                itemType = "Skin";
                itemName = item.name;
            }
        }

        // Jika tidak ketemu di kedua collection
        if (!item) {
            return res.status(404).json({
                message:
                    "Item dengan ID tersebut tidak ditemukan di Hero maupun Skin",
            });
        }

        // Tambahkan item ke cart
        await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    cart: {
                        item_id: itemId,
                        item_type: itemType,
                    },
                },
            },
            { new: true }
        );

        // Kirim respons hanya dengan pesan lengkap
        res.json({
            message: `${itemType} ${itemName} berhasil ditambahkan ke cart`,
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // Cari user dengan cart
        const user = await User.findById(userId).select("cart");

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Pisahkan item berdasarkan tipe
        const heroIds = [];
        const skinIds = [];

        user.cart.forEach((item) => {
            if (item.item_type === "Hero") {
                heroIds.push(item.item_id);
            } else if (item.item_type === "Skin") {
                skinIds.push(item.item_id);
            }
        });

        // Ambil detail hero dan skin sekaligus
        const [heroes, skins] = await Promise.all([
            Hero.find({ _id: { $in: heroIds } }),
            Skin.find({ _id: { $in: skinIds } }),
        ]);

        // Buat map untuk akses cepat
        const heroMap = heroes.reduce((map, hero) => {
            map[hero._id.toString()] = hero;
            return map;
        }, {});

        const skinMap = skins.reduce((map, skin) => {
            map[skin._id.toString()] = skin;
            return map;
        }, {});

        // Gabungkan data cart dengan detail & ganti nama field _id
        const cartWithDetails = user.cart.map((item) => {
            const { item_id, item_type, _id, addedAt } = item;
            const idStr = item_id.toString();

            let detail = null;
            if (item_type === "Hero" && heroMap[idStr]) {
                detail = heroMap[idStr];
            } else if (item_type === "Skin" && skinMap[idStr]) {
                detail = skinMap[idStr];
            }

            // Format addedAt ke format YYYY-MM-DD HH:mm:ss
            const formattedDate = new Date(addedAt)
                .toLocaleString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                })
                .replace(/(\d+)\/(\d+)\/(\d+),\s*/, "$3-$1-$2 ")
                .trim();

            return {
                cart_item_id: _id,
                item_type,
                addedAt: formattedDate,
                detail: detail
                    ? {
                          ...detail.toObject(),
                      }
                    : null,
            };
        });

        res.json({
            message: "Berhasil mengambil cart",
            cart: cartWithDetails,
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.removeFromCart = async (req, res) => {
    const { itemId } = req.body;

    // Validasi field
    if (!itemId) {
        return res.status(400).json({
            message: "Field itemId harus disertakan",
        });
    }

    // Validasi format ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
            message:
                "Format itemId tidak valid. Harus berupa ObjectId MongoDB (24 karakter hex string)",
        });
    }

    try {
        const userId = req.user.id;

        // Cari user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Cari item di cart
        const cartItem = user.cart.find(
            (item) => item.item_id.toString() === itemId
        );

        if (!cartItem) {
            return res.status(404).json({
                message: "Item tidak ditemukan di cart",
            });
        }

        const itemType = cartItem.item_type;
        let itemName = null;

        // Ambil nama item dari database
        if (itemType === "Hero") {
            const hero = await Hero.findById(itemId);
            itemName = hero?.name || "Unknown Hero";
        } else if (itemType === "Skin") {
            const skin = await Skin.findById(itemId);
            itemName = skin?.name || "Unknown Skin";
        }

        // Hapus item dari cart
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    cart: {
                        item_id: itemId,
                        item_type: cartItem.item_type,
                    },
                },
            },
            { new: true }
        );

        // Pisahkan item berdasarkan tipe untuk populate detail
        const heroIds = [];
        const skinIds = [];

        updatedUser.cart.forEach((item) => {
            if (item.item_type === "Hero") {
                heroIds.push(item.item_id);
            } else if (item.item_type === "Skin") {
                skinIds.push(item.item_id);
            }
        });

        // Ambil detail hero dan skin sekaligus
        const [heroes, skins] = await Promise.all([
            Hero.find({ _id: { $in: heroIds } }),
            Skin.find({ _id: { $in: skinIds } }),
        ]);

        // Buat map untuk akses cepat
        const heroMap = heroes.reduce((map, hero) => {
            map[hero._id.toString()] = hero;
            return map;
        }, {});

        const skinMap = skins.reduce((map, skin) => {
            map[skin._id.toString()] = skin;
            return map;
        }, {});

        // Gabungkan data cart dengan detail
        const cartWithDetails = updatedUser.cart.map((item) => {
            const { item_id, item_type, _id, addedAt } = item;
            const idStr = item_id.toString();

            let detail = null;
            if (item_type === "Hero" && heroMap[idStr]) {
                detail = heroMap[idStr];
            } else if (item_type === "Skin" && skinMap[idStr]) {
                detail = skinMap[idStr];
            }

            // Format addedAt ke format YYYY-MM-DD HH:mm:ss
            const formattedDate = new Date(addedAt)
                .toLocaleString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                })
                .replace(/(\d+)\/(\d+)\/(\d+),\s*/, "$3-$1-$2 ")
                .trim();

            return {
                cart_item_id: _id,
                item_id,
                item_type,
                addedAt: formattedDate,
                detail: detail
                    ? {
                          ...detail.toObject(),
                      }
                    : null,
            };
        });

        // Kirim respons dengan pesan + cart terbaru
        res.json({
            message: `${itemType} ${itemName} berhasil dihapus dari cart`,
            cart: cartWithDetails,
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.checkoutAllItems = async (req, res) => {
    const { paymentMethod } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!paymentMethod) {
        return res.status(400).json({
            message: "Field paymentMethod harus disertakan",
        });
    }

    // Validasi metode pembayaran
    const validPaymentMethods = ["diamond", "battle_point"];
    if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
            message:
                "Metode pembayaran tidak valid, harus 'diamond' atau 'battle_point'",
        });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Pastikan cart tidak kosong
        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({
                message: "Cart kosong, tidak ada item untuk dibeli",
            });
        }

        // Pisahkan item berdasarkan tipe
        const heroIds = [];
        const skinIds = [];

        for (const item of user.cart) {
            if (item.item_type === "Hero") {
                heroIds.push(item.item_id);
            } else if (item.item_type === "Skin") {
                skinIds.push(item.item_id);
            }
        }

        // Ambil detail hero dan skin
        const [heroes, skins] = await Promise.all([
            Hero.find({ _id: { $in: heroIds } }),
            Skin.find({ _id: { $in: skinIds } }),
        ]);

        // Buat map untuk akses cepat
        const heroMap = heroes.reduce((map, hero) => {
            map[hero._id.toString()] = hero;
            return map;
        }, {});

        const skinMap = skins.reduce((map, skin) => {
            map[skin._id.toString()] = skin;
            return map;
        }, {});

        // Hitung total harga
        let totalPrice = 0;

        for (const item of user.cart) {
            const idStr = item.item_id.toString();

            let price = 0;
            if (item.item_type === "Hero") {
                price = heroMap[idStr]?.diamond_price || 0;
            } else if (item.item_type === "Skin") {
                price = skinMap[idStr]?.diamond_price || 0;
            }

            if (price <= 0) {
                return res.status(400).json({
                    message: `Item dengan ID ${item.item_id} tidak memiliki harga yang valid`,
                });
            }

            totalPrice += price;
        }

        // Cek apakah saldo mencukupi
        if (paymentMethod === "diamond" && user.diamond < totalPrice) {
            return res.status(400).json({
                message: "Diamond tidak cukup untuk membeli semua item",
            });
        }

        if (
            paymentMethod === "battle_point" &&
            user.battle_point < totalPrice
        ) {
            return res.status(400).json({
                message: "Battle Point tidak cukup untuk membeli semua item",
            });
        }

        // Lakukan transaksi
        const updateFields = {};

        // Kurangi diamond / battle point
        if (paymentMethod === "diamond") {
            updateFields.diamond = user.diamond - totalPrice;
        } else if (paymentMethod === "battle_point") {
            updateFields.battle_point = user.battle_point - totalPrice;
        }

        // Tambahkan ke owned_heroes & owned_skins
        // Tambahkan ke owned_heroes & owned_skins
        const newOwnedHeroes = [
            ...new Set([
                ...user.owned_heroes.map((h) => h.toString()),
                ...heroIds.map((h) => h.toString()),
            ]),
        ];
        const newOwnedSkins = [
            ...new Set([
                ...user.owned_skins.map((s) => s.toString()),
                ...skinIds.map((s) => s.toString()),
            ]),
        ];

        // Gunakan 'new' untuk ObjectId
        updateFields.owned_heroes = newOwnedHeroes.map(
            (id) => new mongoose.Types.ObjectId(id)
        );
        updateFields.owned_skins = newOwnedSkins.map(
            (id) => new mongoose.Types.ObjectId(id)
        );

        // Kosongkan cart
        updateFields.cart = [];

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    diamond: updateFields.diamond,
                    battle_point: updateFields.battle_point,
                    owned_heroes: updateFields.owned_heroes,
                    owned_skins: updateFields.owned_skins,
                },
                $unset: {
                    cart: "",
                },
            },
            { new: true }
        );

        res.json({
            message: `Berhasil membeli ${user.cart.length} item dengan ${paymentMethod}`,
            user: {
                diamond: updatedUser.diamond,
                battle_point: updatedUser.battle_point,
                owned_heroes: updatedUser.owned_heroes.length,
                owned_skins: updatedUser.owned_skins.length,
            },
        });
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
