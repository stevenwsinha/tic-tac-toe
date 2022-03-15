const express = require('express');
const pug = require('pug');
const parser = require('body-parser')
const cookieParser = require('cookie-parser')
const {User} = require('./db.js') 
const {Game} = require('./db.js');
const app = express();
const port = 3003;

/*
 * SETUP EXPRESS MIDDLEWARE
 */
app.set('views', './views');
app.set('view engine', 'pug');

app.use(parser.json());
app.use(parser.urlencoded( { extended: true}))
app.use(cookieParser());

app.use(express.static('./'));

/*
 * SETUP EXPRESS REQUEST HANDLING 
 */

// front end rendering
app.get("/", function(req, res) {
    res.redirect('/ttt/play');
})

app.get("/ttt/play", function(req, res) {
    res.render('index', {grid: [' ', ' ', ' ', 
                                ' ', ' ', ' ',
                                ' ', ' ', ' ']});
});

app.get("/login", function(req, res) {
    res.render('login');
});

app.get("/adduser", function(req, res) {
    res.render('adduser');
});

app.get("/verify", function(req, res) {
    res.render('verify');
});

// create a new unverified user
app.post('/adduser', async function(req, res) {
    console.log(req.body)
    let {username, password, email} = req.body;
    console.log(`Received creation request for user: ${username} with email: ${email} and password: ${password}`);

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

    // make it easier for now
    newUser.verified = true;

    let savedUser = newUser.save()
    if(!savedUser){
        return res.json({
            status:"ERROR"
        });
    }

    return res.redirect('/ttt/play');

});

// verify a user account
app.post('/verify', async function(req, res) {
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
            return res.redirect('/ttt/play');
        }
    })
});

// start a user session
app.post('/login', async function(req, res) {
    let {username, password} = req.body;
    console.log(`Recieved login request for user: ${username} with password: ${password}`)

    await User.findOne({username: username}).then((user) => {
        if (!user) {
            return res.json({
                status:"ERROR"
            });
        }

        if(password !== user.password){
            console.log("invalid password")
            return res.json({
                status:"ERROR"
            });
        }

        if (!user.verified) {
            console.log("cannot log into unverified account")
            return res.json({
                status: "ERROR"
            })
        }

        res.cookie('id', user._id);
        return res.redirect('/ttt/play');
    })

});

// end the current session
app.post('/logout', async function(req, res) {
    res.clearCookie('id');
    return res.json({
        status: "OK"
    });
});

// accept a move and play the game
app.post('/ttt/play', async function(req, res) {
    // get the requesting user id from the cookie
    var userID = req.cookies['id'];
    // get the move sent by client
    let move = req.body.move

    if(!userID){        
        console.log("failed cookie authentication")
        return res.json({
            status: "ERROR",
            grid: [],
            winner: ' ',
            completed: false
        })
    }

    console.log(`finding uncompleted game from user with id: ${userID}`)
    // get the uncompleted game from this user
    await Game.findOne({owner: userID, completed: false}).then( (game) => {
        // if the game doesn't exit (shouldn't ever happen) return ERROR
        if (!game) {
            return res.json({
                status: "ERROR",
                grid: [],
                winner: ' ',
                completed: false
            })
        }

        // check if move is null, if so return current stuff
        if (move == 'null') {
            console.log("null move received")
            return res.json({
                        status: "OK",
                        grid: game.grid,
                        winner: game.winner,
                        completed: game.completed
                    });
        }

        // play the game
        console.log("player played square %s", move);
        var result = playGame(parseInt(move), game.grid);
        
        // if there was an error, return error 
        if (result.error) {
            return res.json({
                status: "ERROR",
                grid: result.grid,
                winner: result.winner,
                completed: result.completed
            })
        }

        // otherwise, save the new game state
        game.completed = result.completed;
        game.grid = result.grid;
        game.winner = result.winner;

        let savedGame = game.save()
        if (!savedGame) {
            return res.json({
                status: "ERROR",
                grid: result.grid,
                winner: result.winner,
                completed: result.completed
            })
        }

        // if game was completed, make a new game
        if (result.completed) {
            if (createNewGame(userID) < 0) {
                return res.json({
                    status: "ERROR",
                    grid: [],
                    winner: ' ',
                    completed: false
                });
            } 
        }

        // return the grid and winner from the original game (not the new game that might have been created)
        return res.json({
                status: "OK",
                grid: result.grid,
                winner: result.winner,
                completed: result.completed
                });
    });
});

// list all games from all users
app.post('/listgames', async function(req, res) {
    // get the requesting user id from the cookie
    var userID = req.cookies['id'];

    if(!userID){
        console.log("failed cookie authentication")
        return res.json({
            status: "ERROR",
            games: []
        })
    }

    await Game.find({}).then( (games)=> {
        console.log(games);

        gameArray = [];

        for (let i = 0; i < games.length; i++) {
            if(games[i].completed){
                gameArray.push({
                    id: games[i]._id,
                    start_date: games[i].startDate
                })
            }
        }

        res.json({
            status: "OK",
            games: gameArray
        })
    });
});


// get a game by ID
app.post('/getgame', async function(req, res) {
     // get the requesting user id from the cookie
     var userID = req.cookies['id'];

     if(!userID){
         console.log("failed cookie authentication")
         return res.json({
             status: "ERROR",
             grid: [],
             winner: ' ',
             completed: false
         })
     }

     let id = req.body.id
     console.log(`Looking for game with id: ${id}`);

     await Game.findById(id).then( (game)=>{
        if (!game) {
            return res.json({
                status: "ERROR",
                grid: [],
                winner: ' ',
                completed: false
            });
        }

        return res.json({
                    status: "OK",
                    grid: game.grid,
                    winner: game.winner,
                    completed: game.completed
                });

     });
});


// get the score of a particular user
app.post('/getscore', async function(req, res) {
    // get the requesting user id from the cookie
    var userID = req.cookies['id'];

    if(!userID){
        console.log("failed cookie authentication")
        return res.json({
            status: "ERROR",
            human: 0,
            wopr: 0,
            tie: 0,
        })
    }

    await Game.find({owner: userID}).then( (games)=> {
        humanscore = 0;
        woprscore = 0;
        tiescore = 0;

        for (let i = 0; i < games.length; i++) {
            let game = games[i];
            if (game.completed) {
                if (game.winner === 'X') {
                    humanscore++;
                }
                else if (game.winner === 'O') {
                    woprscore++;
                }
                else if (game.winner === ' ') {
                    tiescore++;
                }
            }
        }

        res.json({
            status: "OK",
            human: humanscore,
            wopr: woprscore,
            tie: tiescore,
        })
    });
});


/*
 *  SET EXPRESS TO LISTEN
 */

app.listen(port, ()=> {
    console.log(`Example app listening at http://localhost:${port}`);
})


/*
 *  HELPER FUNCTIONS. THEY ARE AN UGLY MESS BUT THEY WORK. KEKW
 */

// make the passed in move on the passed in grid, if it is valid
// returns an object with the updated grid, a winner var, a completed boolean
// and an error msg (null if no error)
function playGame (move, grid) {
    // check the players move is valid
    if (grid[move] !== ' ') {
        return {
            grid: grid,
            winner: ' ',
            completed: false,
            error: "invalid move"
            }
    }

    // make the move
    grid[move] = 'X'
   
    // check if they just won 
    let winner = checkWinner(grid);

    if (winner !== ' ') {
        return {
                grid: grid,
                winner: winner,
                completed: true,
                error: null
                }
    }

    // find the open squares
    let open =[];
    for(let i = 0; i < 9; i++){
        if(grid[i] === ' '){
            open.push(i);
        }
    }

    // if there are no open squares, its a tie
    if (open.length === 0) {
        return {
            grid: grid,
            winner: ' ',
            completed: true,
            error: null
            }
    }

    // otherwise, make a move
    index = open[Math.floor(Math.random() * open.length)];
    grid[index] = 'O';

    // check if the server just won
    winner = checkWinner(grid);
    if (winner !== ' ') {
        return {
            grid: grid,
            winner: winner,
            completed: true,
            error: null
            }
    }

    // if there was only 1 open square and wopr didn't just win, game is now a tie
    if (open.length === 1) {
        return {
            grid: grid,
            winner: ' ',
            completed: true,
            error: null
            }
    }

    // otherwise, game continues
    return {
        grid: grid,
        winner: ' ',
        completed: false,
        error: null
    }

}

// check the winner fo the game
// very primitive algorithm
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

// make a new game, with blank grid, owner being 
// user with the passed in ID
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