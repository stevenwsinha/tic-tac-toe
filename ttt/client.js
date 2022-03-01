var httpRequest;
const url = './play'

// make a move locally, then send a request to update the server
function makeMoveRequest(move) {
    // get the button element that was clicked on 
    button = move.target

    // get the index of button clicked on 
    index = button.id.substring("button-".length);

    // only allow moves on open squares, and if the game hasn't ended
    if (button.innerHTML !== ' ')

    // create new request
    httpRequest = new XMLHttpRequest();

    // change the button's symbol
    button.innerHTML=('X')

    // create the data to be sent
    data = JSON.stringify({move: index});
    
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
            
            // update the board to include the server move
            updateView(responseJson.completed, responseJson.grid);

            // if the games over, send an alert
            if(responseJson.completed){
                alert(`Winner: ${responseJson.winner === ' ' ? "Tie" : responseJson.winner}!`);
            }
        }
    }
}

// set the innerhtml to the correct value
function updateView(completed, grid) {
    for(let i = 0; i < 9; i++){
        if (completed) {
            document.getElementById('button-' + i).innerHTML = '-'
        }
        else{
            document.getElementById('button-' + i).innerHTML = (grid[i] == ' ') ? '-' : grid[i] 
        }
    }
}

// attach the make request function to each button
window.onload = ()=> {
    for(let i = 0; i < 9; i++){
        document.getElementById('button-' + i).addEventListener('click', makeMoveRequest)
    }
}
