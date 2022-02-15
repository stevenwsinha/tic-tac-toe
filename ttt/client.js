var httpRequest;
var board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
const url = './ttt/play'

function makeRequest() {
    httpRequest = new XMLHttpRequest();

    // make a random move 
    var index = Math.floor(Math.random() * 9); 
    board[index] = 'X';

    let requestJson = {};
    requestJson.grid = board;

    httpRequest.onreadystatechange = responseHandler;
    httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.send(requestJson);
}

function responseHandler(){
    if(httpRequest.readyState === XMLHttpRequest.DONE) {
        if(httpRequest.status === 200) {
            var responseJson = JSON.parse(httpRequest.responseText);
            board = responseJson.grid;
            if(responseJson.winner !== ' '){
                alert(`Winner: ${responseJson.winner}!`);
            }
        }
    }
}