var httpRequest;
var board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
const url = './play'

function makeMoveRequest(move) {
    httpRequest = new XMLHttpRequest();

    button = move.target

    // change the button
    button.innerHTML=('X')

    // get the index of button clicked on 
    index = parseInt(button.id.substring("button-".length));

    board[index] = 'X'

    let requestJson = {};
    requestJson.grid = board;

    data = JSON.stringify(requestJson);
    httpRequest.onreadystatechange = responseHandler;
    httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.send(data);
}

function responseHandler(){
    if(httpRequest.readyState === XMLHttpRequest.DONE) {
        if(httpRequest.status === 200) {
            console.log(httpRequest.responseText);
            var responseJson = JSON.parse(httpRequest.responseText);
            board = responseJson.grid;
            updateView();
            if(responseJson.winner !== ' '){
                alert(`Winner: ${responseJson.winner}!`);
            }
        }
    }
}

function updateView() {
    for(let i = 0; i < 9; i++){
        document.getElementById('button-' + i).innerHTML = (board[i] == ' ') ? '-' : board[i] 
    }
}

window.onload = ()=> {
    for(let i = 0; i < 9; i++){
        document.getElementById('button-' + i).addEventListener('click', makeMoveRequest)
    }
}
