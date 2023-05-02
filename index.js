const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const route = require("./route");
const EventEmitter = require("events");
const {GAME_CHANGES ,REMOVE_GAMER ,ADD_GAMER, GAME_STARTED, CONNECTION, DISCONNECT, SOCKET_CREATE_GAME, SOCKET_ENTRY_GAME, CHESS_GAME_COLOR_WHITE, CHESS_GAME_COLOR_BLACK, DISCONNECT_FROM_GAME, WAIT_OPONENT, GAME_MOVE, SEND_GAME_FEN} = require("./config");
const {games, addGame, ifGameExist} = require("./games");
const GameConfig = require("./gameConfig");
// const stockfish = require("stockfish");
const {Chess} = require("chess.js");
const {Helper} = require("./utils");
let {chessGames} = require("./utils");

const emitter = new EventEmitter();

app.use(cors({ origin: "*" }));
app.use(route);

emitter.on(ADD_GAMER, (game) => {
    const whitePlayer = Helper.getWhitePlayer(game);
    const blackPlayer = Helper.getBlackPlayer(game);
    if(chessGames[game].isStarted()) {
        const newGame = new Chess();
        chessGames[game].setGameFen(newGame.fen());
        io.to(whitePlayer).emit(GAME_STARTED, newGame, newGame.fen());
        io.to(blackPlayer).emit(GAME_STARTED, newGame, newGame.fen());
    }
})

emitter.on(REMOVE_GAMER, (game, color) => {
    const whitePlayer = color == CHESS_GAME_COLOR_BLACK ? Helper.getWhitePlayer(game) : null;
    const blackPlayer = color == CHESS_GAME_COLOR_WHITE ? Helper.getBlackPlayer(game) : null;
    if(!whitePlayer && !blackPlayer) {
        delete chessGames[game];
    }else if (!whitePlayer) {
        chessGames[game].removeWhitePlayer();
        io.to(blackPlayer).emit(WAIT_OPONENT);
    }else if (!blackPlayer) {
        chessGames[game].removeBlackPlayer();
        io.to(whitePlayer).emit(WAIT_OPONENT);
    }
})

emitter.on(GAME_MOVE, (fen, game) => {
    chessGames[game].setGameFen(fen);
    emitter.emit(SEND_GAME_FEN, game, fen);
})

emitter.on(SEND_GAME_FEN, (game, fen) => {
    const whitePlayer = Helper.getWhitePlayer(game);
    const blackPlayer = Helper.getBlackPlayer(game);

    io.to(whitePlayer).emit(GAME_CHANGES, fen);
    io.to(blackPlayer).emit(GAME_CHANGES, fen);
})

const server = http.createServer(app);

server.listen(5000, () => {
    console.log("Server is Started");
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

function moveEmit (game, sourceSquare, targetSquare) {
    try{
        const moveObj = {
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // always promote to a queen for example simplicity
        };
        const gameCopy = new Chess(Helper.getGameFen(game));
        const result = gameCopy.move(moveObj);
        if(result) {
            chessGames[game].setGameFen(gameCopy.fen());
            emitter.emit(GAME_MOVE, gameCopy.fen(), game);
        }else {
    
        }
    }catch (err) {
        console.log(err);
    }
    
}

io.on(CONNECTION, (socket) => {
    socket.on(SOCKET_CREATE_GAME, () => {
        const game = addGame();
        console.log(games);
        socket.emit(SOCKET_CREATE_GAME, {game, color:CHESS_GAME_COLOR_WHITE});
        chessGames[game]= new GameConfig(socket.id);
        emitter.emit(WAIT_OPONENT, game);
        socket.on(WAIT_OPONENT, (game, color) => emitter.emit(REMOVE_GAMER, game, color));
        socket.on(GAME_MOVE, moveEmit);
    });
    socket.on(SOCKET_ENTRY_GAME, (game) => {
        let ifExist = ifGameExist(game);
        if(ifExist) {
            const currentGame = chessGames[game];
            if(!currentGame.getWhitePlayer()) {
                socket.emit(SOCKET_ENTRY_GAME, {ifExist, color:CHESS_GAME_COLOR_WHITE});
                chessGames[game].setWhitePlayer(socket.id);
            }else if (!currentGame.getBlackPlayer()){
                socket.emit(SOCKET_ENTRY_GAME, {ifExist, color:CHESS_GAME_COLOR_BLACK});
                chessGames[game].setBlackPlayer(socket.id);
            }else {
                ifExist = false;
            }
            emitter.emit(ADD_GAMER, game);
        }
        if(!ifExist) {
            socket.emit(SOCKET_ENTRY_GAME, {ifExist});
        }else {
            emitter.emit()
        }
        socket.on(WAIT_OPONENT, (game, color) => emitter.emit(REMOVE_GAMER, game, color));
        socket.on(GAME_MOVE, moveEmit);
    });
    
    
    io.on(DISCONNECT, () => {
        
    });
} )