import { inject, Service } from "@hology/core/gameplay"
import {
  ActionInput,
  InputService,
  Keybind,
  Mousebind,
  Wheelbind,
} from "@hology/core/gameplay/input"
import CharacterActor from "../actors/character-actor"

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
  shoot,
}

@Service()
class PlayerController {
  private inputService = inject(InputService)
  private character: CharacterActor

  public start() {
    // TODO Add a mouse click feature
    this.inputService.setKeybind(InputAction.jump, new Keybind(" "))
    this.inputService.setKeybind(InputAction.sprint, new Keybind("Shift"))
    this.inputService.setKeybind(InputAction.moveForward, new Keybind("w"))
    this.inputService.setKeybind(InputAction.moveBackward, new Keybind("s"))
    this.inputService.setKeybind(InputAction.moveLeft, new Keybind("a"))
    this.inputService.setKeybind(InputAction.moveRight, new Keybind("d"))
    this.inputService.setMousebind(
      InputAction.rotate,
      new Mousebind(0.01, true, "x")
    )
    this.inputService.setMousebind(
      InputAction.rotateCamera,
      new Mousebind(0.003, false, "y")
    )
    this.inputService.setWheelbind(
      InputAction.zoomCamera,
      new Wheelbind(0.0003, false)
    )
  }

  public posess(character: CharacterActor) {
    this.character = character
    this.bindCharacterInput()
  }

  private bindCharacterInput() {
    const playerMove = this.character.movement.directionInput
    const playerJump = this.character.movement.jumpInput
    const playerSprint = this.character.movement.sprintInput

    this.inputService.bind(InputAction.jump, playerJump.toggle)
    this.inputService.bind(InputAction.sprint, playerSprint.toggle)
    this.inputService.bind(InputAction.moveForward, playerMove.togglePositiveY)
    this.inputService.bind(InputAction.moveBackward, playerMove.toggleNegativeY)
    this.inputService.bind(InputAction.moveLeft, playerMove.toggleNegativeX)
    this.inputService.bind(InputAction.moveRight, playerMove.togglePositiveX)
    this.inputService.bind(
      InputAction.rotate,
      this.character.movement.rotationInput.rotateY
    )
    this.inputService.bind(
      InputAction.rotateCamera,
      this.character.thirdPartyCamera.rotationInput.rotateX
    )
    this.inputService.bind(
      InputAction.zoomCamera,
      this.character.thirdPartyCamera.zoomInput.increment
    )

    document.addEventListener("mousedown", (event) => {
      if (event.button === leftMouseButton) {
        this.character.shoot()
      }
    })
  }
}

const leftMouseButton = 0

export default PlayerController