import React from "./react";
import ReactDOM from "./react-dom";

function Counter() {
  const [count, setCount] = React.useState(0);
  const x = React.useMemo(() => {
    return count + "x";
  }, [count]);

  const handleClick = React.useCallback(() => {
    setCount(count + 1);
  }, [count]);

  React.useEffect(() => {
    console.log("useEffect");
  }, [count]);

  return <p onClick={handleClick}>{count}</p>;
}
class App extends React.Component {
  render() {
    return (
      <div>
        <Counter />
        <p>this is a App Component</p>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
