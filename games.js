let games = [];


function addGame () {
    let game = Math.trunc(Math.random()*9999);
    if(games.includes(game)){
        game = addGame();
    }else {
        games.push(game);
        return game;
    }
}

function ifGameExist(game) {
    return games.includes(game);
}

exports.addGame = addGame;
exports.ifGameExist = ifGameExist;
exports.games = games;