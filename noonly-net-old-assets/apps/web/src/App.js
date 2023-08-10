import logo from './logo.svg';
import './App.css';
import { randomToken, giveString } from '@noonly-net/common'
import { getString } from '@noonly-net/common/dist/utils/getString'
import SomeComponent from '@noonly-net/common/dist/web/components'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          {getString()}
        </a>
        <div>
          {randomToken(55)}
        </div>
        <SomeComponent />
      </header>
    </div>
  );
}

export default App;
