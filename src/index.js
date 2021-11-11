import React from "./react";
import ReactDOM from "./react-dom";

import PersonContext from "./personContext";

class Child1 extends React.Component {
  static contextType = PersonContext;
  render() {
    return (
      <div>
        <p>child1:{this.context.name}</p>
        {this.props.children}
      </div>
    );
  }
}

class Child11 extends React.Component {
  static contextType = PersonContext;
  render() {
    return <p>child2:{this.context.name}</p>;
  }
}

class App extends React.Component {
  state = {
    name: "yanjian",
  };
  handleClick = () => {
    this.setState({
      name: "yanjian" + Math.random(),
    });
  };
  render() {
    return (
      <PersonContext.Provider value={{ name: this.state.name }}>
        <div>
          <button onClick={this.handleClick}>改变</button>
          <Child1>
            <Child11 />
          </Child1>
        </div>
      </PersonContext.Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
