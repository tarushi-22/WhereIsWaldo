const express=require('express');
const cors=require('cors' );
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});
const app=express();
app.use(express.json());
app.use(cors());

const characters=require('./characters');
const targets=require('./targets');
const games=[];
const mongoose=require('mongoose');
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

app.get('/api/characters',(req,res)=>{
res.json(characters);
})
app.post("/api/game/start",(req,res)=>{
const gameId=games.length+1;
games.push({id:gameId,foundCharacters:[]});
res.json({gameId});

});
app.get("/api/targets",(req,res)=>{
    res.json(targets);
})
app.post("/api/game/check",(req,res)=>{

    const {gameId,characterId,x,y}=req.body;
    console.log("Received:", { gameId, characterId, x, y });
    const game=games.find(game=>game.id===gameId);
    if(!game){
        return res.status(404).json({error:"Game not found"});
    }
    const target=targets[characterId];
    console.log("Target for characterId", characterId, ":", target);
    if(!target){
        console.log("TARGET NOT FOUND. characterId =", characterId, "type =", typeof characterId);
        return res.status(404).json({error:"Target not found"});
    }

    if(x>=target.x1 && x<=target.x2 && y>=target.y1 && y<=target.y2){
        if(game.foundCharacters.includes(characterId)){
            return res.json({found:true,foundAlready:true});
        }
        game.foundCharacters.push(characterId);

        res.json({found:true});
        if(game.foundCharacters.length===characters.length){
            return res.json({
                found: true,
                characterId,
                gameComplete: true
            });
        }
    }
    else{
        res.json({found:false});
    }

})
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB connected!");

    app.listen(process.env.PORT || 3000, () => {
      console.log("Server running!");
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();







