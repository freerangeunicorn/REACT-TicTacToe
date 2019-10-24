import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import FacebookLogin from 'react-facebook-login';
import { Button, Navbar } from 'react-bootstrap';
import { async } from 'q';


function Square(props) {
    return (
      <button className="square" onClick={props.onClick}>
        {props.value}
      </button>
    );
  }

 
  
  class Board extends React.Component {
    renderSquare(i) {
      return (
        <Square
          value={this.props.squares[i]}
          onClick={() => this.props.onClick(i)}
        />
      );
    }
  
    render() {
      return (
        <div>
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div>
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [
          {
            squares: Array(9).fill(null)
          }
        ],
        stepNumber: 0,
        xIsNext: true,
        userInfo: JSON.parse(localStorage.getItem("currentUser")) ||{},
        scores: [],
        gameOver: false,
      };
    }
     calculateWinner(squares) {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          console.log('someone won')
          if (!this.state.gameOver) {
            this.postScore ()
            this.setState({gameOver:true}, () => this.getScores())
          }
          return squares[a];
        }
      }
      return null;
    }
    
  
    handleClick(i) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (this.calculateWinner(squares) || squares[i]) {
        return;

      }
      squares[i] = this.state.xIsNext ? "X" : "O";
      this.setState({
        history: history.concat([
          {
            squares: squares
          }
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext
      });
    }
  
    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0
      });
    }
  
    signOut = () => {
      localStorage.removeItem('currentUser')
      this.setState({userInfo:{}})
    }

    componentDidMount = () => {
      this.getScores()
    }

    getScores = async() => {
      const response = await fetch('http://ftw-highscores.herokuapp.com/tictactoe-dev?reverse=true');
      const jsonData = await response.json()
      console.log('after parse', jsonData.items)
      this.setState({scores:jsonData.items})
    }
    postScore= async () => {
      let data = new URLSearchParams();
      data.append('player', 'Lil Mai');
      data.append('score', '1e+28');
      const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev`;
      const response = await fetch(url,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: data.toString(),
          json: true,
        }
      )      
    }

    render() {

      const responseFacebook = async (response) => {
        console.log(response);
        try{
          this.setState({userInfo:response})
          await localStorage.setItem('currentUser', JSON.stringify(this.state.userInfo))
        } catch (error) {
          console.log(error)
          this.setState({fbError: response.status})
        }
      }

      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winner = this.calculateWinner(current.squares);
  
      const moves = history.map((step, move) => {
        const desc = move ?
          'Go to move #' + move :
          'Go to game start';
        return (
          
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
      });
  
      let status;
      if (winner) {
        status = "Winner: " + winner; 
        
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
  if (this.state.userInfo.name && this.state.fbError!=="unknown") {
      return (
        <div>
        <div style={{display: 'flex',justifyContent: 'center'}}>
        <Navbar> 
        <Navbar.Brand>Exes and Ohs</Navbar.Brand >
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    </div>
      <div className="game">
          <div className="game-info">
      
            <div>{status}</div>
            <ol>{moves}</ol>
            
          </div>
          <button onClick={()=> this.signOut()}>Log out</button>
          <div className="game-board">
            
            <Board
              squares={current.squares}
              onClick={i => this.handleClick(i)}
            />
          </div>
          <ol>
          {this.state.scores.map(score => {

            return (
              <li key={score._id}>{score.player} has a score of {score.score}</li>
            )
          })}
          </ol>
        </div>
        </div>


        

      );
  } else {
    return (
      <FacebookLogin
        appId="376950623241521"
        // autoLoad={true}
        fields="name,email,picture"
        // onClick={componentClicked}
        callback={responseFacebook} />
      
    )
  }
    }
  }




  // ========================================
  
  ReactDOM.render(<Game />, document.getElementById("root"));
  
  
