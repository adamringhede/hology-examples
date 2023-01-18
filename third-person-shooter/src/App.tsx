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
import { Pane } from "tweakpane"
import actors from './actors'
import { TriggerVolume } from "@hology/core/gameplay/actors"

function App() {
  const containerRef = createRef<HTMLDivElement>()
  useEffect(() => {
    initiateGame(Game, {
      element: containerRef.current as HTMLElement,
      sceneName: "demo",
      dataDir: "data",
      shaders,
      actors,
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
    this.physics.showDebug = false

    const spawnPoint = this.world.findActorByType(SpawnPoint)
    spawnPoint.position.y += 1

    const character = await this.world.spawnActor(CharacterActor, spawnPoint.position)
    //character.moveTo(spawnPoint.position)
    this.inputService.start()
    this.playerController.posess(character)
    this.playerController.start()

    console.log(this.world.scene)

    const tv = this.world.findActorByType(TriggerVolume)
/*
    this.physics.onBeginOverlapWithActor(character, tv).subscribe(c => {
      console.log('entered', c)
    })

    this.physics.onEndOverlapWithActorType(character, TriggerVolume).subscribe(c => {
      console.log('exited', c)
    })*/

    //setInterval(() => character.shoot(), 50)

  }
}

function setUpPane(character: CharacterActor) {

  const PARAMS = {
    autoStepMaxHeight: character.movement.autoStepMaxHeight,
    autoStepMinWidth: character.movement.autoStepMinWidth,
    snapToGround: character.movement.snapToGround,
    shadowBias: 0
  };
  const pane = new Pane()
  pane.addInput(PARAMS, 'autoStepMaxHeight', {
    min: 0,
    max: 1,
  }).on('change', ev => {
    character.movement.autoStepMaxHeight = ev.value as number
  })
  pane.addInput(PARAMS, 'autoStepMinWidth', {
    min: 0,
    max: 1, 
  }).on('change', ev => {
    character.movement.autoStepMinWidth = ev.value as number
  })

  pane.addInput(PARAMS, 'snapToGround', {
    min: 0,
    max: 2,
  }).on('change', ev => {
    character.movement.snapToGround = ev.value as number
  })

  pane.addInput(PARAMS, 'shadowBias', {
    min: -.1,
    max: .1
  }).on('change', ev => {
    this.viewController['view'].csm.shadowBias = ev.value
    this.viewController['view'].csm.updateShadowBounds()
    this.viewController['view'].csm.updateUniforms()
    this.viewController['view'].csm.update()
  })

}
