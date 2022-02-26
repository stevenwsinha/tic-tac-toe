var httpRequest;
var board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
var winner
const url = './play'

// make a move locally, then send a request to update the server
function makeMoveRequest(move) {
    // get the button element that was clicked on 
    button = move.target

    // get the index of button clicked on 
    index = parseInt(button.id.substring("button-".length));

    // only allow moves on open squares, and if the game hasn't ended
    if(board[index] !== ' ' || winner){
        return;
    }

    // create new request
    httpRequest = new XMLHttpRequest();

    // change the button's symbol
    button.innerHTML=('X')

    // change the board
    board[index] = 'X'

    // create the data to be sent
    let requestJson = {};
    requestJson.grid = board;
    data = JSON.stringify(requestJson);
    
    // send the request, wait for response, then call responseHandler()
    httpRequest.onreadystatechange = responseHandler;
    httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.send(data);
}

function responseHandler(){
    if(httpRequest.readyState === XMLHttpRequest.DONE) {
        if(httpRequest.status === 200) {
            // set our local board to include the server move
            var responseJson = JSON.parse(httpRequest.responseText);
            board = responseJson.grid;

            // update the board to include the server move
            updateView();

            // if there's a winner, send an alert
            if(responseJson.winner){
                
            }
            if(responseJson.winner !== ' '){
                alert(`Winner: ${responseJson.winner}!`);
                winner = responseJson.winner
            }
        }
    }
}

// set the innerhtml to the correct value
function updateView() {
    for(let i = 0; i < 9; i++){
        document.getElementById('button-' + i).innerHTML = (board[i] == ' ') ? '-' : board[i] 
    }
}

// attach the make request function to each button
window.onload = ()=> {
    for(let i = 0; i < 9; i++){
        document.getElementById('button-' + i).addEventListener('click', makeMoveRequest)
    }
}
