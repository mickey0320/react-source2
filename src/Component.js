import { findDOM, compareTwoVdom } from "./react-dom";

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
  forceUpdate() {
    const classInstance = this;
    const oldDOM = findDOM(classInstance.oldRenderVdom);
    const newRenderVdom = classInstance.render();
    compareTwoVdom(
      oldDOM.parentNode,
      classInstance.oldRenderVdom,
      newRenderVdom
    );
    classInstance.oldRenderVdom = newRenderVdom;
    if (classInstance.componentDidUpdate) {
      classInstance.componentDidUpdate(this.props, this.state);
    }
  }
}

class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance;
    this.pendingStates = [];
  }
  addState(partialState) {
    this.pendingStates.push(partialState);
    this.emitUpdate();
  }
  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this);
    } else {
      this.updateComponent();
    }
  }
  updateComponent() {
    const { classInstance, nextProps } = this;
    shouldComponent(classInstance, nextProps, this.getState());
  }
  getState() {
    const { state } = this.classInstance;
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

function shouldComponent(classInstance, newProps, newState) {
  let willUpdate = true;
  if (
    classInstance.shouldComponentUpdate &&
    !classInstance.shouldComponentUpdate()
  ) {
    willUpdate = false;
  }
  if (willUpdate && classInstance.componentWillUpdate) {
    classInstance.componentWillUpdate();
  }
  classInstance.state = newState;
  classInstance.props = newProps;
  if (willUpdate) {
    classInstance.forceUpdate();
  }
}

export default Component;
