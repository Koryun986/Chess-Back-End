let chessGames = {};

class Helper {
    static getWhitePlayer(game) {
        return chessGames[game] && chessGames[game].getWhitePlayer();
    }

    static getBlackPlayer(game) {
        return chessGames[game] && chessGames[game].getBlackPlayer(); 
    }

    static getGameFen (game) {
        return chessGames[game] && chessGames[game].getGameFen();
    }
}

exports.chessGames = chessGames;
exports.Helper = Helper;