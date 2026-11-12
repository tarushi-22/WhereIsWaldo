import "./App.css";

import { useState, useEffect } from "react";
function App() {

  const [gameId,setGameId]=useState(null);
  const [gameStarted,setGameStarted]=useState(false);
  const [foundCharacters,setFoundCharacters]=useState([]);
  const [selectedCharacterId,setSelectedCharacterId]=useState(null);
  const [characters, setCharacters] = useState([]);
  const [characterSelected, setCharacterSelected] = useState(false);
  const [time,setTime]=useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timerActive,setTimerActive]=useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);
  useEffect(() => {
    fetch("http://localhost:3000/api/game/start", {
  method: "POST"
})
.then(response => response.json())
.then(data => {
  console.log("GAME START RESPONSE:", data);
  setGameId(data.gameId);
})
.catch(error => console.error("GAME START ERROR:", error));
    fetch("http://localhost:3000/api/characters")
      .then(response => {
        console.log("RESPONSE RECEIVED:", response.status);
        return response.json();
      })
      .then(data => {
        console.log("CHARACTERS RECEIVED:", data);
        setCharacters(data);
      })
      .catch(error => {
        console.error("FETCH ERROR:", error);
      });

  }, []);

useEffect(() => {

 if (!timerActive || isPaused || startTime === null) {
  return ;
 }
 const interval=setInterval(()=>{
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  setTime(elapsed);
 },250);
 return () => clearInterval(interval);
},[timerActive,isPaused,startTime]);
 
function startGame() {
  if (gameId === null) {
    console.log("Game is not initialized yet");
    return;
  }
setTimerActive(true);
resumeGame();
  setStartTime(Date.now());
  setTime(0);
  setElapsedBeforePause(0);
  
  
setTime(0);
  setGameStarted(true);
}
function pauseGame() {
  setIsPaused(true);
  setElapsedBeforePause(time);
  setTimerActive(false);
}
function resumeGame() {
  setStartTime(Date.now() - elapsedBeforePause * 1000); 
  setIsPaused(false);
  setTimerActive(true);
}


function handleImageClick(event) {
     if (isPaused) return;
  if (selectedCharacterId === null) {
  console.log("NO CHARACTER SELECTED");
  return;
}
setCharacterSelected(true);
  const image = event.currentTarget;

  const rect = image.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const scaleX = image.naturalWidth / rect.width;
  const scaleY = image.naturalHeight / rect.height;

  const imageX = x * scaleX;
  const imageY = y * scaleY;

  console.log("SENDING TO BACKEND:", {
  gameId,
  characterId: selectedCharacterId,
  x: imageX,
  y: imageY
});

fetch("http://localhost:3000/api/game/check",{
  method:"POST",
  headers:{
    "Content-Type":"application/json"
  },
  body:JSON.stringify({
    gameId,
    characterId:selectedCharacterId,
    x:imageX,
    y:imageY  
  }),
}).then((response)=>response.json()).then((data)=>{
  console.log("Check result:",data);
  if(data.found && !data.foundAlready){
    setFoundCharacters((prev)=>[...prev,selectedCharacterId]);
  }
})
}
 return (
  <div className="page">

    <header>
      <h1>Where's Waldo?</h1>
    </header>

    <main>
      <div className="game-layout">

        {/* Game image */}
        <div id="game-container">
          {gameStarted && gameId!==null && (
            <img
              id="game-image"
              src="game-image.png"
              alt="Where's Waldo puzzle"
              onClick={handleImageClick}
            />
          )}
        </div>

        <aside className="game-sidebar">

 <div className="timer">
  {Math.floor(time / 60)
    .toString()
    .padStart(2, "0")}
  :
  {(time % 60).toString().padStart(2, "0")}
</div>

  <button id="start-button" onClick={startGame}>
    Start Game
  </button>
{gameStarted && (
  <button onClick={isPaused ? resumeGame : pauseGame}>
    {isPaused ? "Resume" : "Pause"}
  </button>
)}
  <div className="find-section">
    <h3>Find these characters</h3>

    <div id="characters">
      {characters.map((character) => (
        <div
          key={character.id}
          className={`character-card ${
            foundCharacters.includes(character.id)
              ? "found"
              : selectedCharacterId === character.id
              ? "selected"
              : ""
          }`}
          onClick={() => setSelectedCharacterId(character.id)}
        >
          <img
            src={character.image}
            alt={character.name}
            className="character-avatar"
          />

          <span>{character.name}</span>
        </div>
      ))}
    </div>
  </div>

</aside>

      </div>
    </main>

  </div>
);
}

export default App;