import "./App.css"
import {
  GameInstance,
  initiateGame,
  inject,
  PhysicsSystem,
  Service,
  ViewController,
  World,
} from "@hology/core/gameplay"
import { createRef, useEffect } from "react"
import shaders from "./shaders"
import { SpawnPoint } from "@hology/core/gameplay/actors"
import CharacterActor from "./actors/character-actor"
import {
  ActionInput,
  InputService,
  Keybind,
  Mousebind,
  Wheelbind,
} from "@hology/core/gameplay/input"
import PlayerController from "./services/player-controller"
import { Vector3 } from "three"
import { Pane } from "tweakpane"
import actors from './actors'
import { TriggerVolume } from "@hology/core/gameplay/actors"
import Instructions from "./Instructions"
import Game from "./services/game"

function App() {
  const containerRef = createRef<HTMLDivElement>()
  useEffect(() => {
    const runtime = initiateGame(Game, {
      element: containerRef.current as HTMLElement,
      sceneName: "boxes",
      dataDir: "data",
      shaders,
      actors,
    })
    return () => runtime.shutdown()
  }, [containerRef])
  return (
    <div className="App">
      <div ref={containerRef}></div>
      <Instructions></Instructions>
    </div>
  )
}

export default App
