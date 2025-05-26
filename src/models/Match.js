const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    players: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        hero: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hero',
            required: true
        },
        team: {
            type: String,
            enum: ['A', 'B'],
            required: true
        },
        battle_point_earned: {
            type: Number,
            required: true
        },
        experience_earned: {
            type: Number,
            required: true
        }
    }],
    winner_team: {
        type: String,
        enum: ['A', 'B'],
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Match', matchSchema); 