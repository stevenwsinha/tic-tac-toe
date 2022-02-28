const mongoose = require('mongoose');

/*
 *  SET UP MONGOOSE CONNECTION
 */
mongoose
    .connect('mongodb://localhost:27017/warmup2')
    .catch(e => {
        console.error('Connection error', e.message);
    })

const db = mongoose.connection;

/*
 * USER AND GAME SCHEMAS
 */ 

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    verified: Boolean,
})

const gameSchema = new mongoose.Schema({
    grid: [String],
    winner: String,
    owner: String,
    startDate: String, 
    completed: {Boolean, default: false}
})

module.exports = { User: mongoose.model('User', userSchema),
                   Game: mongoose.model('Game', gameSchema)
                 }