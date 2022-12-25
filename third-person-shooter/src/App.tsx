import "./App.css"
import {
  initiateGame,
  inject,
  PhysicsSystem,
  Service,
  ViewController,
  World,
} from "@hology/core/gameplay"
import { createRef, useEffect } from "react"
import shaders from "./materials"
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

function App() {
  const containerRef = createRef<HTMLDivElement>()
  useEffect(() => {
    initiateGame(Game, {
      element: containerRef.current as HTMLElement,
      sceneName: "demo",
      dataDir: "data",
      shaders,
      actors: {},
    })
  }, [containerRef])
  return (
    <div className="App">
      <div ref={containerRef}></div>
    </div>
  )
}

export default App

@Service()
class Game {
  private world = inject(World)
  private viewController = inject(ViewController)
  private physics = inject(PhysicsSystem)
  private inputService = inject(InputService)
  private playerController = inject(PlayerController)

  constructor() {
    this.start()
  }

  async start() {
    this.physics.showDebug = true

    const spawnPoint = this.world.findActorByType(SpawnPoint)
    spawnPoint.position.y += 4

    const character = await this.world.spawnActor(CharacterActor, spawnPoint.position)
    //character.moveTo(spawnPoint.position)
    this.inputService.start()
    this.playerController.posess(character)
    this.playerController.start()

    console.log(this.world.scene)

    //  this.viewController.getCamera().position.copy(spawnPoint.position)
    //this.viewController.getCamera().lookAt(new Vector3(15,0,0))
    

  }
}
