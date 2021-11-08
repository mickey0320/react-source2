import React from "./react";
import ReactDOM from "./react-dom";

// function App(props) {
//   return <div>{props.msg}</div>;
// }
class App extends React.Component {
  handleClick = () => {
    console.log("click");
  };
  render() {
    return <div onClick={this.handleClick}>{this.props.msg}</div>;
  }
}
ReactDOM.render(<App msg="class component" />, document.getElementById("root"));
