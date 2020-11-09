import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { empty } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  constructor(@Inject(DOCUMENT) document) {}

  boardVerticalSize: Array<number>;
  boardHorizontalSize: Array<number>;
  stonePositions: Array<number> = [0, 12];
  boardSize: number;
  ngOnInit(): void {
    this.boardVerticalSize = Array(8)
      .fill(null)
      .map((x, i) => i);

    this.boardHorizontalSize = Array(8)
      .fill(null)
      .map((x, i) => i);
    this.boardSize =
      this.boardHorizontalSize.length * this.boardVerticalSize.length;
  }

  selectBoxID: number = null;
  onSubmit(boxID) {
    for (let i = 0; i < this.boardSize; i++) {
      document.getElementById(`box${i}`).classList.remove('board__box__green');
    }
    const selectBox: any = document.getElementById(`box${boxID}`);
    if (selectBox.getElementsByTagName('span').length) {
      this.markPathOfMotion(boxID);
      this.selectBoxID = boxID;
    } else if (
      this.selectBoxID != null &&
      (this.selectBoxID + this.boardVerticalSize.length == boxID ||
        this.selectBoxID - this.boardVerticalSize.length == boxID ||
        (this.selectBoxID + 1 == boxID &&
          this.selectBoxID % this.boardHorizontalSize.length !=
            this.boardHorizontalSize.length - 1) ||
        (this.selectBoxID - 1 == boxID &&
          this.selectBoxID % this.boardHorizontalSize.length != 0))
    ) {
      selectBox.innerHTML = document.getElementById(
        `box${this.selectBoxID}`
      ).innerHTML;
      document.getElementById(`box${this.selectBoxID}`).innerHTML = null;
      this.selectBoxID = null;
    } else {
      this.selectBoxID = null;
    }
  }

  markPathOfMotion(boxID) {
    if (
      boxID + 1 >= 0 &&
      boxID + 1 < this.boardSize &&
      boxID % this.boardHorizontalSize.length !=
        this.boardHorizontalSize.length - 1
    )
      document
        .getElementById(`box${boxID + 1}`)
        .classList.add('board__box__green');

    if (
      boxID - 1 >= 0 &&
      boxID - 1 < this.boardSize &&
      boxID % this.boardHorizontalSize.length != 0
    )
      document
        .getElementById(`box${boxID - 1}`)
        .classList.add('board__box__green');

    if (
      boxID - this.boardVerticalSize.length >= 0 &&
      boxID - this.boardVerticalSize.length < this.boardSize
    )
      document
        .getElementById(`box${boxID - this.boardVerticalSize.length}`)
        .classList.add('board__box__green');

    if (
      boxID + this.boardVerticalSize.length >= 0 &&
      boxID + this.boardVerticalSize.length < this.boardSize
    )
      document
        .getElementById(`box${boxID + this.boardVerticalSize.length}`)
        .classList.add('board__box__green');
  }
}
