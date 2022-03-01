const express = require('express');
const pug = require('pug');
const parser = require('body-parser')
const cookieParser = require('cookie-parser')
const {User} = require('./server.js') 
const {Game} = require('./server.js');
const { all } = require('express/lib/application');
const app = express();
const port = 3003;


// TO DO: 
// REFACTOR CODE SO THE BOARD IS SAVED AFTER EVERY TTT/PLAY POST, 
// EVERY POST TO TTT/PLAY WILL FETCH BOARD FROMD DATABASE, USING ID
// STORED IN COOKIE TO FIND CORRECT BOARD
// NULL MOVES FETCH THE BOARD AND JUST RES IT, ACTUAL MOVES FETCH BOARD
// MAKE A MOVE THEN SAVE IT

// MAKE FUNCTIONS THAT FETCH ALL GAMES/ FETCH FROM ONE USER/ FILTER GAMES, ETC 
// THEY DONT NEED TO BE SEPARATE FUNCTIONS THEY CAN BE INSIDE THE POST RESPONSE 
// TO THE DIFFERENT ENDPOINTS

/*
 * SETUP EXPRESS REQUEST HANDLING 
 */

app.set('views', './views');
app.set('view engine', 'pug');

app.use(parser.json());
app.use(cookieParser());

app.use(express.static('./'));

app.get("/ttt/play", function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    res.render('index', {grid: gameState});
});

app.post("/ttt/", function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    res.render('index', {grid: gameState});
});

app.post('/adduser', async function(req, res) {

    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    let {username, password, email} = req.body;
    console.log(`Received verify request for user: ${username} with email: ${email} and password: ${password}`);

    existingUser = await User.findOne({username: username});
    if(existingUser){
        console.log("User with that username already exists");
        return res.json({
            status:"ERROR"
        });
    }

    let newUser = new User({
        username, password, email
    });

    newUser.verified = false;

    let savedUser = newUser.save()
    if(!savedUser){
        return res.json({
            status:"ERROR"
        });
    }

    return res.json({
        status: "OK"
    })  

});

app.post('/verify', async function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    let {email, key} = req.body;
    console.log(`Received verify request for user: ${email} with key: ${key}`);

    await User.findOne({email: email}).then((user) => {
        if(key !== "abracadabra"){
            console.log("invalid key")
            return res.json({
                status:"ERROR"
            });
        }
        user.verified = true;
        user.save()

        // make a new game for them
        if (createNewGame(user._id) < 0) {
            return res.json({
                status: "ERROR"
            });
        } 
        else{
            return res.json({
                status: "OK"
            });
        }
    })
});

app.post('/login', async function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    let {username, password} = req.body;
    console.log(`Recieved login request for user: ${username} with password: ${password}`)

    await User.findOne({username: username}).then((user) => {
        if(password !== user.password){
            console.log("invalid password")
            return res.json({
                status:"ERROR"
            });
        }

        res.cookie('id', user._id);
        return res.json({
            status: "OK"
        });
    })

});

app.post('/logout', async function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    res.clearCookie('id');
    return res.json({
        status: "OK"
    });
});

app.post('/ttt/play', async function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');

    // get the requesting user id from the cookie
    var userID = req.cookies['id'];
    // get the move sent by client
    let move = req.body.move

    if(!userID){
        return res.json({
            status: "ERROR"
        })
    }


    console.log(`finding uncompleted game from user with id: ${userID}`)
    // get the uncompleted game from this user
    await Game.findOne({owner: userID, completed: false}).then( (game) => {
        // if the game doesn't exit (shouldn't ever happen) return ERROR
        if (!game) {
            return res.json({
                status: "ERROR"
            })
        }

        // check if move is null, if so return current stuff
        if (move == null) {
            return res.json({
                        status: "OK",
                        grid: game.grid,
                        winner: game.winner
                    });
        }

        // otherwise, make a move

        res.json({
            status: "OK",
        });
    });

    // make our move, and get the board/winner object result
    // var result = playGame(parseInt(move));

});

/*
 *  SET EXPRESS TO LISTEN
 */

app.listen(port, ()=> {
    console.log(`Example app listening at http://localhost:${port}`);
})


/*
 *  HELPER FUNCTIONS
 */

function playGame (move) {
    // make the players move
    currentGame[move] = 'X'
   
    // check if they just won 
    
    // find the open squares
    let open =[];
    for(let i = 0; i < 9; i++){
        if(grid[i] === ' '){
            open.push(i);
        }
    }

    // if there are no open squares, its a tie
    if (open.length === 0) {
        return ' ';
    }

    // otherwise, make a move
    index = open[Math.floor(Math.random() * open.length)];
    grid[index] = 'O';

    // check if the server just won
    winner = checkWinner(grid);
    if(winner !== ' '){
        return winner
    }
}

function checkWinner(grid){
    // check if somebody has won on the rows
    if( grid[0] === grid[1] && grid[0] === grid[2]){
        return grid[0]
    }
    if( grid[3] === grid[4] && grid[3] === grid[5]){
        return grid[3]
    }
    if( grid[6] === grid[7] && grid[6] === grid[8]){
        return grid[6]
    }

    // check if somebody has won on cols
    if( grid[0] === grid[3] && grid[0] === grid[6]){
        return grid[0]
    }
    if( grid[1] === grid[4] && grid[1] === grid[7]){
        return grid[1]
    }
    if( grid[2] === grid[5] && grid[2] === grid[8]){
        return grid[2]
    }

    // check if someone has won on diags
    if(grid[0] == grid[4] && grid[0] == grid[8]){
        return grid[0]
    }
    if(grid[2] === grid[4] && grid[2] === grid[6]){
        return grid[2]
    }

    return ' '
}


/*
 * DATABASE FUNCTIONS
 */

function createNewGame(ownerId) {
    // make a game with empty fields, belonging to passed in user._id
    let newGame = new Game()
    newGame.grid = [' ', ' ', ' ',
                    ' ', ' ', ' ',
                    ' ', ' ', ' '];
    newGame.winner = ' ';
    newGame.owner = ownerId; 
    newGame.startDate = new Date().toString();
    newGame.completed = false;

    // save the game, if it succeeds return 1, fails return -1
    savedGame = newGame.save()
    if (!savedGame) {
        return -1
    }
    return 1
}