import React from "./react";
import ReactDOM from "./react-dom";

// class Counter extends React.PureComponent {
//   render() {
//     console.log("counter render");
//     return <div>{this.props.count}</div>;
//   }
// }
function Counter(props) {
  console.log('counter render')
  return <div>{props.count}</div>;
}
const CounterMemo = React.memo(Counter)
class App extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }
  state = {
    count: 0,
  };
  handleClick = () => {
    this.setState({
      count: this.state.count + Number(this.inputRef.current.value),
    });
  };
  render() {
    return (
      <div>
        <input type="text" value="0" ref={this.inputRef} />
        <CounterMemo count={this.state.count} />
        <button onClick={this.handleClick}>计算</button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
