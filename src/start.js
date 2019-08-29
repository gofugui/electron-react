
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
class App extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
            <div style={{display: 'flex', 'justifyContent': 'center', alignItems: 'center'}}>
              <h1>welcome to electron-react</h1>
            </div>
    )
  }
}
ReactDOM.render(
    <App/>,
    document.getElementById('app'),
)

