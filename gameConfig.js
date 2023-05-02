module.exports = class {
    constructor(whitePlayer = null, blackPlayer = null, gameFen = null) {
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;
        this.gameFen = gameFen;
    }

    getGameFen () {
        return this.gameFen;
    }

    setGameFen (gameFen) {
        this.gameFen = gameFen;
    }

    isStarted () {
        return (this.whitePlayer && this.blackPlayer);
    }

    getWhitePlayer() {
        return this.whitePlayer;
    }

    getBlackPlayer() {
        return this.blackPlayer;
    }

    setWhitePlayer(playerId) {
        this.whitePlayer = playerId;
    }

    setBlackPlayer(playerId) {
        this.blackPlayer = playerId;
    }

    removeWhitePlayer() {
        this.whitePlayer = null;
    }

    removeBlackPlayer() {
        this.blackPlayer = null;
    }
}