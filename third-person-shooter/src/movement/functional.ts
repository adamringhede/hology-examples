
type AnimationLoader = 2
/**
 * 
 * I need a collection of clips.
 * 
 * If clips are stored as assets, I could fetch them by name
 * Maybe they should be based on a specific rig so many rigs can reuse the same names.
 */


// Also include a clip in the state
class State {
  constructor(public readonly onUpdate: (deltaTime: number) => void = () => {}) {}
}

function createGraph(loader: AnimationLoader, ) {

  let currentState: State

  const jumping = new State(() => {
    if (true) {
      currentState = walking
    }
  })
  // Some state should have a clip that has an inplace clip and have time scale 
  // updated based on movement speed
  // Others are simply ending after after the clip is ended and then the next 
  // state should be determined on if moving or stationary. 
  // You should still be able to cancel out of these though. 
  const walking = new State()
  const startWalking = new State()
  const running = new State()

  jumping

}

export const x = 0;