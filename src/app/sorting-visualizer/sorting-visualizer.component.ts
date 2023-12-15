import { Component, HostListener, OnInit } from '@angular/core';
import * as Tone from 'tone'

interface Value {
  number: number;
  color: boolean;
}

@Component({
  selector: 'app-sorting-visualizer',
  templateUrl: './sorting-visualizer.component.html',
  styleUrls: ['./sorting-visualizer.component.scss']
})
export class SortingVisualizerComponent implements OnInit {
  synth = new Tone.Synth().toDestination();
  volume: boolean = false;
  numberArray: Value[] = [];
  numberCeiling: number = 0;
  maxSpeed = 1000;

  size: number = 100;
  speed: number = 10;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.getCeiling();
    this.initializeArray(this.size);
  }

  // constructor() { }

  ngOnInit(): void {
    this.getCeiling();
    this.initializeArray(this.size);
    this.synth.volume.value = -20;
  }

  getCeiling() {
    const windowHeight = window.innerHeight;
    const header = document.getElementById('header');
    let headerHeight = 0;

    if (header) {
      headerHeight = header.clientHeight;
    }

    this.numberCeiling = windowHeight - headerHeight;
    const arrayContainer = document.getElementById('arrayContainer');
    if (arrayContainer) {
      arrayContainer.style.height = this.numberCeiling.toString() + "px";
    }
  }

  initializeArray(size: number) {
    let tempArray: Value[] = [];

    for (let i = 0; i < size; i++) {
      tempArray[i] = {
        number: Math.floor((Math.random() * this.numberCeiling) + 1),
        color: false
      }
    }

    this.numberArray = tempArray;
  }

  async bubbleSort() {
    let tempArray: Value[] = this.numberArray;
    let swapped: boolean = true;

    while (swapped) {
      swapped = false;
      for (let i = 0; i < tempArray.length - 1; i++) {
        tempArray[i].color = true;

        if (tempArray[i].number > tempArray[i+1].number) {
          await this.swapNums(tempArray, i, i + 1);

          this.numberArray = tempArray;
          swapped = true;
        }

        tempArray[i].color = false;
        this.makeTone(tempArray[i].number);
      }
    }

    this.makeTone(0);
  }

  async selectionSort() {
    let tempArray: Value[] = this.numberArray;

    for (let i = 0; i < tempArray.length; i++) {
      tempArray[i].color = true;
      this.makeTone(tempArray[i].number);

      let lowestIndex = i;
      let lowest = tempArray[i].number;
      for (let o = i + 1; o < tempArray.length; o++) {
        if (lowest > tempArray[o].number) {
          if (lowestIndex != i) tempArray[lowestIndex].color = false;

          lowest = tempArray[o].number;
          lowestIndex = o;

          tempArray[lowestIndex].color = true;
        }
      }

      await this.swapNums(tempArray, i, lowestIndex);
      tempArray[i].color = false;
      tempArray[lowestIndex].color = false;
    }

    this.makeTone(0);
  }

  async insertionSort() {
    let tempArray: Value[] = this.numberArray;

    for (let i = 1; i < tempArray.length; i++) {
      if (tempArray[i].number < tempArray[i - 1].number) {
        let tempIndex = i;
        tempArray[tempIndex].color = true;

        while (tempIndex > 0 && tempArray[tempIndex].number < tempArray[tempIndex - 1].number) {
          this.makeTone(tempArray[tempIndex - 1].number);
          await this.swapNums(tempArray, tempIndex, tempIndex - 1);

          tempArray[tempIndex].color = false;
          tempIndex--;
          tempArray[tempIndex].color = true;
        }
        tempArray[tempIndex].color = false; 
      }
    }

    this.makeTone(0);
  }

  async mergeSort() {
    const tempArray: Value[] = await this.mergeRecursive(this.numberArray, 0, this.numberArray.length - 1);

    this.numberArray = tempArray;
    this.makeTone(0);
  }

  async mergeRecursive(tempArray: Value[], startIndex: number, endIndex: number) : Promise<Value[]> {
    if (tempArray.length <= 1) {
      return tempArray;
    }

    let leftArray: Value[] = tempArray.slice(0, Math.floor(tempArray.length / 2));
    let rightArray: Value[] = tempArray.slice(Math.floor(tempArray.length / 2), tempArray.length);

    leftArray = await this.mergeRecursive(leftArray, startIndex, (leftArray.length - 1 + startIndex));
    rightArray = await this.mergeRecursive(rightArray, (leftArray.length + startIndex), endIndex);

    return this.merge(leftArray, rightArray, startIndex, endIndex);
  }

  async merge(leftArray: Value[], rightArray: Value[], startIndex: number, endIndex: number) : Promise<Value[]> {
    let leftIndex = 0;
    let rightIndex = 0;
    let sortedIndex = 0;
    let sortedArray: Value[] = [];

    while (!(leftIndex == leftArray.length && rightIndex == rightArray.length)) {
      if (rightIndex == rightArray.length || leftIndex != leftArray.length && leftArray[leftIndex].number <= rightArray[rightIndex].number) {
        sortedArray[sortedIndex] = leftArray[leftIndex];

        leftArray[leftIndex].color = true;
        await this.sleep(this.speed / 10);
        leftArray[leftIndex].color = false;
        this.makeTone(leftArray[leftIndex].number);

        sortedIndex++;
        leftIndex++;
      } else {
        sortedArray[sortedIndex] = rightArray[rightIndex];

        rightArray[rightIndex].color = true;
        await this.sleep(this.speed / 10);
        rightArray[rightIndex].color = false
        this.makeTone(rightArray[rightIndex].number);

        sortedIndex++;
        rightIndex++;
      }
    }

    for (let i = 0; i < sortedArray.length; i++) {
      this.numberArray[i + startIndex] = sortedArray[i];
    }

    return sortedArray;
  }

  async swapNums(array: Value[], currentIndex: number, lowestIndex: number) {
    const tempNum = array[currentIndex].number;
    array[currentIndex].number = array[lowestIndex].number;

    await this.sleep(this.speed);
    array[lowestIndex].number = tempNum;
  }

  makeTone(hertz: number) {
    if (this.volume) {
      const now = Tone.now()
      this.synth.triggerAttackRelease(hertz, now + .1);
    }
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sizeChange(value: string) {
    this.size = parseInt(value);
    this.initializeArray(this.size);
    this.makeTone(0);
  }

  speedChange(value: string) {
    this.speed = this.maxSpeed - parseInt(value);
  }

  volumeChange() {
    this.volume = !this.volume
    // this.makeTone(0);
    // const now = Tone.now();
    // this.synth.triggerAttackRelease(0, now + 1);
  }
}
