import React from "./react";
import ReactDOM from "./react-dom";

class Counter extends React.Component {
  componentWillMount() {
    console.log("Counter componentWillMount");
  }
  componentDidMount() {
    console.log("Counter componentDidMount");
  }
  render() {
    return <span>{this.props.count}</span>;
  }
}

class App extends React.Component {
  state = {
    count: 0,
  };
  componentWillMount() {
    console.log("App componentWillMount");
  }
  componentDidMount() {
    console.log("App componentDidMount");
  }
  handleClick = () => {
    this.setState({
      count: this.state.count + 1,
    });
  };
  render() {
    console.log("App render");
    return (
      <div>
        <p>{this.state.count}</p>
        <Counter count={this.state.count} />
        <button onClick={this.handleClick}>点击+1</button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
