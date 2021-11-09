import React from "./react";
import ReactDOM from "./react-dom";

// class Counter extends React.Component {
//   componentWillMount() {
//     console.log("Counter componentWillMount");
//   }
//   componentDidMount() {
//     console.log("Counter componentDidMount");
//   }
//   render() {
//     console.log("Counter render");
//     return <span>counter</span>;
//   }
// }

// class App extends React.Component {
//   componentWillMount() {
//     console.log("App componentWillMount");
//   }
//   componentDidMount() {
//     console.log("App componentDidMount");
//   }
//   render() {
//     console.log("App render");
//     return (
//       <div>
//         <Counter />
//       </div>
//     );
//   }
// }

class Three extends React.Component {
  render() {
    return <div>three</div>
  }
}
 
function Two(){
  return <Three />;
}
class App extends React.Component{
  state = {count: 0}
  constructor(props){
    super(props)
    setTimeout(() => {
      this.setState({
        count: 10
      })
    })
  }
  render(){
    return <Two/>
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
