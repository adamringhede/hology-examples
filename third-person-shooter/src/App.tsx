import "reflect-metadata"
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

enum InputAction {
  moveForward,
  moveBackward,
  moveLeft,
  moveRight,
  jump,
  sprint,
  crouch,
  rotate,
  rotateCamera,
  zoomCamera,
}

@Service()
class Game {
  private world = inject(World)
  private viewController = inject(ViewController)
  private physics = inject(PhysicsSystem)
  private inputService = inject(InputService)

  constructor() {
    this.start()
  }

  start() {
    this.physics.showDebug = false

    const spawnPoint = this.world.findActorByType(SpawnPoint)
    spawnPoint.position.y += 2

    const character = this.world.spawnActor(CharacterActor)
    character.moveTo(spawnPoint.position)

    this.inputService.start()

    const playerMove = character.movement.directionInput
    const playerJump = character.movement.jumpInput
    const playerSprint = character.movement.sprintInput
    const playerCrouch = new ActionInput()

    this.inputService.bind(InputAction.jump, playerJump.toggle)
    this.inputService.setKeybind(InputAction.jump, new Keybind(" "))

    this.inputService.bind(InputAction.sprint, playerSprint.toggle)
    this.inputService.setKeybind(InputAction.sprint, new Keybind("Shift"))

    this.inputService.bind(InputAction.crouch, playerCrouch.toggle)
    this.inputService.setKeybind(InputAction.crouch, new Keybind("c"))

    this.inputService.bind(InputAction.moveForward, playerMove.togglePositiveY)
    this.inputService.bind(InputAction.moveBackward, playerMove.toggleNegativeY)

    this.inputService.setKeybind(InputAction.moveForward, new Keybind("w"))
    this.inputService.setKeybind(InputAction.moveBackward, new Keybind("s"))

    // TODO Register these actions in the movement component instead? If not, they would have to be part of the initially generated code base.

    this.inputService.bind(InputAction.moveLeft, playerMove.toggleNegativeX)
    this.inputService.bind(InputAction.moveRight, playerMove.togglePositiveX)

    this.inputService.setKeybind(InputAction.moveLeft, new Keybind("a"))
    this.inputService.setKeybind(InputAction.moveRight, new Keybind("d"))

    this.inputService.bind(
      InputAction.rotate,
      character.movement.rotationInput.rotateY
    )
    this.inputService.setMousebind(
      InputAction.rotate,
      new Mousebind(0.01, true, "x")
    )

    this.inputService.bind(
      InputAction.rotateCamera,
      character.thirdPartyCamera.rotationInput.rotateX
    )
    this.inputService.setMousebind(
      InputAction.rotateCamera,
      new Mousebind(0.003, false, "y")
    )

    this.inputService.bind(
      InputAction.zoomCamera,
      character.thirdPartyCamera.zoomInput.increment
    )
    this.inputService.setWheelbind(
      InputAction.zoomCamera,
      new Wheelbind(0.0003, false)
    )
  }
}
