import {findDOM, compareTwoVdom} from './react-dom'

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
  forceUpdate(){
    const classInstance = this
    const oldDOM = findDOM(classInstance.oldRenderVdom)
    const oldRenderVdom = classInstance.render()
    compareTwoVdom(oldDOM, classInstance.oldRenderVdom, oldRenderVdom)
    if(classInstance.componentDidUpdate){
      classInstance.componentDidUpdate()
    }
    classInstance.oldRenderVdom = oldRenderVdom
  }
}

class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance;
    this.pendingStates = [];
  }
  addState(partialState) {
    this.pendingStates.push(partialState)
    this.emitUpdate()
  }
  emitUpdate(){
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this);
    } else {
      this.updateComponent()
    }
  }
  updateComponent() {
    shouldComponent(this.classInstance, this.getState())
  }
  getState() {
    const {state} = this.classInstance;
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

function shouldComponent(classInstance, newState){
  classInstance.state = newState
  if(classInstance.componentWillUpdate){
    classInstance.componentWillUpdate()
  }
  classInstance.forceUpdate()
}

export default Component;
