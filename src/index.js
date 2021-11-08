import React from "./react";
import ReactDOM from "./react-dom";

// function App(props) {
//   return <div>{props.msg}</div>;
// }
class App extends React.Component {
  state = {
    count: 0
  }
  handleClick = () => {
    this.setState((previousState) => {
      return {
        count: previousState.count + 1
      }
    })
    this.setState((previousState) => {
      return {
        count: previousState.count + 1
      }
    })
    
  };
  render() {
    return <div onClick={this.handleClick}>{this.state.count}</div>;
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
