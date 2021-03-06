import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EndgameWindowComponent } from '../../components';
import { SocketService } from 'src/app/utils';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _dialog: MatDialog,
    private _router: Router,
    private _socketServie: SocketService
  ) {}

  _socket = this._socketServie.connection;
  boardSizeArray: Array<number>;
  stonePositions: Array<number>;
  boardSize: number;
  onSubmit: Function = this.mainStoneSelection;
  mainStone: number;
  selectBoxID: number;
  numberOfStones: number = 3;
  boardSizeSquare: number;
  wallPositions: Array<number> = [];
  gameStart: boolean = !this._router.isActive('game/multiplayer', true);
  playerID: number;

  ngOnInit(): void {
    this.boardSize = parseInt(
      this._activatedRoute.snapshot.paramMap.get('BoardSize') || '9'
    );

    this.numberOfStones = parseInt(
      this._activatedRoute.snapshot.paramMap.get('NumberOfStones') || '5'
    );

    this.boardSizeArray = Array(this.boardSize)
      .fill(null)
      .map((x, i) => i);

    this.boardSizeSquare = Math.pow(this.boardSize, 2);

    if (!this._router.isActive('game/multiplayer', true)) {
      this.wallPositions = this.randomLaying(
        Math.floor(this.boardSizeSquare / 10),
        this.boardSizeSquare
      );

      this.stonePositions = this.randomLaying(
        this.numberOfStones,
        this.boardSizeSquare
      );
    } else {
      this._socket.on('gameStartingSituation', (data) => {
        this.gameStart = data.state;
        this.wallPositions = data.wallPositions;
        this.stonePositions = data.stonePositions;
        this.numberOfStones = data.stonePositions.length;
      });

      this._socket.on('gameOver', (data) => {
        if (data.state) {
          this.gameStart = false;
          this.endGameWindowOpen(this.playerID == data.playerID);
        }
      });
    }
  }

  motionAreaControl(boxID: number): boolean {
    return (
      this.selectBoxID != null &&
      (this.selectBoxID + this.boardSizeArray.length == boxID ||
        this.selectBoxID - this.boardSizeArray.length == boxID ||
        (this.selectBoxID + 1 == boxID &&
          this.selectBoxID % this.boardSizeArray.length !=
            this.boardSizeArray.length - 1) ||
        (this.selectBoxID - 1 == boxID &&
          this.selectBoxID % this.boardSizeArray.length != 0))
    );
  }

  mainStoneSelection(boxID: number) {
    if (
      document.getElementById(`box${boxID}`).getElementsByTagName('span').length
    ) {
      this.mainStone = boxID;
      this.numberOfStones -= 1;
      const mainBox = (<any>document.getElementById(`box${boxID}`)).firstChild;
      mainBox.classList.remove('board__stone__red');
      mainBox.classList.add('board__stone__green');
      mainBox.innerHTML = '';
      this.onSubmit = this.stoneMovement;
      this.stonePositions.forEach((x) => {
        if (x != boxID) this.numberOfMovesCalculation(x);
      });
    }
  }

  stoneMovement(boxID: number) {
    for (let i = 0; i < this.boardSizeSquare; i++) {
      document.getElementById(`box${i}`).classList.remove('board__box__green');
    }
    if (this.mainStone != boxID) {
      const selectBox: any = document.getElementById(`box${boxID}`);
      if (selectBox.getElementsByTagName('span').length) {
        this.markPathOfMotion(boxID);
        this.selectBoxID = boxID;
      } else if (
        this.motionAreaControl(boxID) &&
        !selectBox.getElementsByTagName('i').length
      ) {
        selectBox.innerHTML = document.getElementById(
          `box${this.selectBoxID}`
        ).innerHTML;
        document.getElementById(`box${this.selectBoxID}`).innerHTML = null;
        this.numberOfMovesCalculation(boxID);
        this.selectBoxID = null;
      } else {
        this.selectBoxID = null;
      }
    } else if (this.motionAreaControl(boxID)) {
      document.getElementById(`box${this.selectBoxID}`).innerHTML = null;
      this.numberOfStones -= 1;

      if (this.numberOfStones == 0) {
        if (this._router.isActive('game/multiplayer', true))
          this._socket.emit('gameOver', this.playerID);
        else this.endGameWindowOpen();
      }
    }
  }

  markPathOfMotion(boxID: number) {
    if (
      boxID + 1 >= 0 &&
      boxID + 1 < this.boardSizeSquare &&
      boxID % this.boardSizeArray.length != this.boardSizeArray.length - 1
    )
      if (
        !document.getElementById(`box${boxID + 1}`).getElementsByTagName('i')
          .length
      )
        document
          .getElementById(`box${boxID + 1}`)
          .classList.add('board__box__green');

    if (
      boxID - 1 >= 0 &&
      boxID - 1 < this.boardSizeSquare &&
      boxID % this.boardSizeArray.length != 0
    )
      if (
        !document.getElementById(`box${boxID - 1}`).getElementsByTagName('i')
          .length
      )
        document
          .getElementById(`box${boxID - 1}`)
          .classList.add('board__box__green');

    if (
      boxID - this.boardSizeArray.length >= 0 &&
      boxID - this.boardSizeArray.length < this.boardSizeSquare
    )
      if (
        !document
          .getElementById(`box${boxID - this.boardSizeArray.length}`)
          .getElementsByTagName('i').length
      )
        document
          .getElementById(`box${boxID - this.boardSizeArray.length}`)
          .classList.add('board__box__green');

    if (
      boxID + this.boardSizeArray.length >= 0 &&
      boxID + this.boardSizeArray.length < this.boardSizeSquare
    )
      if (
        !document
          .getElementById(`box${boxID + this.boardSizeArray.length}`)
          .getElementsByTagName('i').length
      )
        document
          .getElementById(`box${boxID + this.boardSizeArray.length}`)
          .classList.add('board__box__green');
  }

  randomLaying(numberOfStones: number, maxLimit: number): Array<number> {
    let positions: Array<number> = [];
    let randomNumber: number;
    do {
      randomNumber = Math.floor(Math.random() * maxLimit);
      if (
        positions.indexOf(randomNumber) === -1 &&
        this.wallPositions.indexOf(randomNumber) === -1
      )
        positions.push(randomNumber);
    } while (positions.length != numberOfStones);
    return positions;
  }

  numberOfMovesCalculation(boxID: number) {
    let numberOfMoves =
      Math.abs((this.mainStone % this.boardSize) - (boxID % this.boardSize)) +
      Math.abs(
        Math.floor(this.mainStone / this.boardSize) -
          Math.floor(boxID / this.boardSize)
      );

    let [initialValue, counter] =
      this.mainStone > boxID
        ? [this.mainStone, boxID]
        : [boxID, this.mainStone];

    if (
      !Math.abs((this.mainStone % this.boardSize) - (boxID % this.boardSize))
    ) {
      for (
        initialValue;
        initialValue != counter;
        initialValue -= this.boardSize
      ) {
        if (
          document
            .getElementById(`box${initialValue}`)
            .getElementsByTagName('i').length
        ) {
          console.log({ counter, initialValue });
          numberOfMoves += 2;
          break;
        }
      }
    }

    if (
      !Math.abs(
        Math.floor(this.mainStone / this.boardSize) -
          Math.floor(boxID / this.boardSize)
      )
    ) {
      for (initialValue; initialValue != counter; initialValue--) {
        if (
          document
            .getElementById(`box${initialValue}`)
            .getElementsByTagName('i').length
        ) {
          console.log({ counter, initialValue });
          numberOfMoves += 2;
          break;
        }
      }
    }

    (<any>(
      document.getElementById(`box${boxID}`)
    )).firstChild.innerHTML = numberOfMoves;
  }

  endGameWindowOpen(winningStatus: boolean = true) {
    const diologRef = this._dialog.open(EndgameWindowComponent, {
      data: { winningStatus },
    });

    diologRef.afterClosed().subscribe(async (result: boolean) => {
      if (result) {
        window.location.reload();
      }
    });
  }

  setPlayerID(playerID: number) {
    this.playerID = playerID;
  }
}
