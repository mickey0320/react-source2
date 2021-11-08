export const updateQueue = {
  updaters: new Set(),
  isBatchingUpdate: false,
  batchUpdate() {
    this.updaters.forEach((updater) => updater.updateComponent());
  },
};
export class Component {
  static isReact = true;
  constructor(props) {
    this.props = props;
    this.updater = new Updater(this);
  }
  setState(partialState) {
    this.updater.addState(partialState);
  }
}

class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance;
    this.pendingStates = [];
  }
  addState(partialState) {
    this.pendingStates.push(partialState)
    this.updateComponent()
  }
  updateComponent() {
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this);
    } else {
    }
  }
  getState() {
    const state = this.classInstance;
    const newState = { ...state };
    this.pendingStates.forEach((pendingState) => {
      if (typeof pendingState === "function") {
        pendingState = pendingState(newState);
      }
      Object.assign(newState, pendingState);
    });

    return newState;
  }
}

export default Component;
