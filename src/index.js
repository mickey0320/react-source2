import React from "./react";
import ReactDOM from "./react-dom";

// function App(props) {
//   return <div>{props.msg}</div>;
// }
function InputComponent(props, ref){
  return (
    <input ref={ref} />
  )
}
const InputComponentForward = React.forwardRef(InputComponent)
class App extends React.Component {
  constructor(props){
    super(props)
    this.inputRef = React.createRef()
    setTimeout(() =>{
      this.inputRef.current.focus()
    }, 1000)
  }
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
    return <div onClick={this.handleClick}>
     <span>{this.state.count}</span> 
     <InputComponentForward ref={this.inputRef} />
    </div>;
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
