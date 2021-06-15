import { Injectable } from '@angular/core';
import { SortingBar } from '../../datastructures/sorting-bar';
import { SortingAlgorithmsService, Animation } from './sorting-algorithms.service';
import { DEFAULT_ARRAY_LENGTH, DEFAULT_ALGORITHM, DEFAULT_SPEED, 
  GENERATE_AT_LEAST, NUMBER_RANGE, DEFAULT_NUMBER_PROPERTY, MAX_ARRAY_SIZE } from '../../data/sorting-config';


export interface Algorithm {
  id: string;
  viewValue: string;
}

export interface NumberProperty{
  id: string;
  viewValue: string;
}


@Injectable({
  providedIn: 'root'
})
export class SortingServiceService {

  public numberProperties: NumberProperty[] = [
    {id: 'random', viewValue: 'Random'},  
    {id: 'nearlySorted', viewValue: 'Random Nearly Sorted'},
    {id: 'reversed', viewValue: 'Random Reversed'},
    {id: 'reversedStairCase', viewValue: 'Reversed Stair Case'},
    {id: 'shuffledstairCase', viewValue: 'Shuffled Stair Case'},
  ];
  public currentNumberProperty:NumberProperty = this.numberProperties[DEFAULT_NUMBER_PROPERTY]

  public algorithms: Algorithm[] = [
    {id: 'bubbleSort', viewValue: "Bubble Sort"},
    {id: 'selectionSort', viewValue: 'Selection Sort'},
    {id: 'insertionSort', viewValue: 'Insertion Sort'},
    {id: 'binInsertionSort', viewValue: 'Bin. Search Insertion Sort'},
    {id: 'shellSort', viewValue: 'Shell Sort'},
    {id: 'mergeSort', viewValue: 'Merge Sort'},
    {id: 'timsort', viewValue: 'Tim Sort (uses Merge Low)'},
    {id: 'quickSort', viewValue: 'Quick Sort'},
    {id: 'heapSort', viewValue: 'Heap Sort'},
    {id: 'radixSort', viewValue: 'Radix Sort'},
  ];

  public selectedAlgorithm:Algorithm = this.algorithms[DEFAULT_ALGORITHM];


  // Toolbar
  public speedValue:number = DEFAULT_SPEED;

  //Sidenav
  public sortingSideNavOpened:boolean = false;
  public showNumbers:boolean = false;
 
  // Array
  public barArray:SortingBar[] = [];
  public numberArray:number[] = [];
  public arrayLength:number = DEFAULT_ARRAY_LENGTH;
  public maxArraySize: number = MAX_ARRAY_SIZE
  public generateAtLeast:number = GENERATE_AT_LEAST;
  public numberRange:number = NUMBER_RANGE;
  public curArrayMin!:number;
  public curArrayMax!:number;
 
  // Animation
  public currentlyAutoPlaying:boolean = false;
  public currentPositionInAnimationArray: number = -1;
  public currentSliderPosition:number = -1;
  public AnimationArray: Animation[] = [];
  public currentlyMarked: number[] = [];
  public prevMovedForwardsinAnimation: boolean = false;
  public prevMovedBackwardsinAnimation: boolean = false;
  public playButton:string = "play";

  // Info
  public algoInfoShown:boolean = false;

  constructor(public sortalgorithms:SortingAlgorithmsService) { }

  checkInputs(){
    if( this.numberRange < 1){this.numberRange = 1}
    else if( this.numberRange > 1000000){this.numberRange = 1000000}
    if(this.generateAtLeast < -1000000){this.generateAtLeast = -1000000}
    else if(this.generateAtLeast > 1000000){this.generateAtLeast = 1000000}
    this.numberRange = Math.floor(this.numberRange)
    this.generateAtLeast = Math.floor(this.generateAtLeast)
    this.updateState()
  }

  updateState(){
    this.playButton = "play"
    this.currentlyAutoPlaying = false;
    this.numberArray.length = 0
    this.setNewArray();

    let argsSortAlgorithm = {"array" : this.numberArray, "algorithmId" : this.selectedAlgorithm.id};
    this.AnimationArray = this.sortalgorithms.getSortingAnimationArray(argsSortAlgorithm);
    
    this.resetAnimationProperties();
  }

  resetAnimationProperties(){
    this.currentPositionInAnimationArray = -1;
    this.currentSliderPosition = this.currentPositionInAnimationArray;
    this.currentlyMarked.length = 0;
    this.prevMovedForwardsinAnimation = false;
    this.prevMovedBackwardsinAnimation = false;
  }

  toggleAutoPlay(){
    this.currentlyAutoPlaying = !this.currentlyAutoPlaying
    if(this.currentlyAutoPlaying){this.playButton = "stop"} 
    this.autoPlay()
  }

  async autoPlay(){
    while (this.currentPositionInAnimationArray < this.AnimationArray.length) {
      if (!this.currentlyAutoPlaying) {break}
      this.goNextStepInAnimation()
      await this.sleep(Math.floor(330/(Math.pow(this.speedValue, 2))))    
    }
    
    if (this.currentPositionInAnimationArray >= this.AnimationArray.length){this.playButton = "reset"}
    else{this.playButton = "play"}
    this.currentlyAutoPlaying = false
  }

  catchUpWithSlider(value:any){

    this.currentSliderPosition = value
    let differenceBetweenSliderandAnimation = this.currentSliderPosition - this.currentPositionInAnimationArray
    while (differenceBetweenSliderandAnimation > 0) {
      this.goNextStepInAnimation()
      differenceBetweenSliderandAnimation--
    }
    while (differenceBetweenSliderandAnimation < 0) {
      this.goPrevStepInAnimation()
      differenceBetweenSliderandAnimation++
    }
  }

  goNextStepInAnimation(){

    if (this.prevMovedBackwardsinAnimation){    
      this.prevMovedBackwardsinAnimation = false
      this.goNextStepInAnimation()
      this.goNextStepInAnimation()
      return
    }
   
    if (this.currentPositionInAnimationArray >= this.AnimationArray.length){
      this.currentlyMarked.forEach(idx => this.barArray[idx].type = "inactive");
      this.currentlyMarked.length = 0;
      if (this.currentPositionInAnimationArray >= this.AnimationArray.length){this.playButton = "reset"}
      return
    }

    this.currentPositionInAnimationArray++
    this.currentSliderPosition = this.currentPositionInAnimationArray
    this.prevMovedForwardsinAnimation = true
    if (this.currentPositionInAnimationArray >= this.AnimationArray.length){
      this.goNextStepInAnimation()
      return
    }

    this.currentlyMarked.forEach(idx => this.barArray[idx].type = "inactive")
    this.currentlyMarked.length = 0

    let curanimation:Animation = this.AnimationArray[this.currentPositionInAnimationArray]    
    if      (curanimation.hasOwnProperty("compare")){ this.compareAnimation(curanimation)}
    else if (curanimation.hasOwnProperty("swap")){this.swapAnimation(curanimation)} 
    else if (curanimation.hasOwnProperty("overwrite")){this.overwriteAnimation(curanimation)}
  }

  goPrevStepInAnimation(){
    this.playButton = "play"
    if (this.currentPositionInAnimationArray <= -1){
      this.currentlyMarked.forEach(idx => this.barArray[idx].type = "inactive");
      this.currentlyMarked.length = 0
      this.prevMovedBackwardsinAnimation = false
      return
    }

    if (this.prevMovedForwardsinAnimation){  
      this.prevMovedForwardsinAnimation = false
      if (this.currentPositionInAnimationArray >= this.AnimationArray.length){     
        this.currentPositionInAnimationArray--
        this.currentSliderPosition = this.currentPositionInAnimationArray
        this.prevMovedBackwardsinAnimation = true 
        this.goPrevStepInAnimation()
        return
      }
      this.goPrevStepInAnimation()
      this.goPrevStepInAnimation()
      return
    }

    this.currentlyMarked.forEach(idx => this.barArray[idx].type = "inactive")
    this.currentlyMarked.length = 0
    
    let curanimation:Animation = this.AnimationArray[this.currentPositionInAnimationArray]
    if      (curanimation.hasOwnProperty("compare")){ this.compareAnimation(curanimation)}
    else if (curanimation.hasOwnProperty("swap")){this.swapAnimation(curanimation)} 
    else if (curanimation.hasOwnProperty("overwrite")){this.reverseoverwriteAnimation(curanimation)}

    this.currentPositionInAnimationArray--
    this.currentSliderPosition = this.currentPositionInAnimationArray
    this.prevMovedBackwardsinAnimation = true
  }

  compareAnimation(animation:Animation){
    if (animation.compare == undefined ){throw Error(`compareAnimation: animation is undefined`)}
    this.currentlyMarked.push(animation.compare.idx1)
    this.currentlyMarked.push(animation.compare.idx2)
    this.barArray[animation.compare.idx1].type = "compare"
    this.barArray[animation.compare.idx2].type = "compare"
  }

  swapAnimation(animation:Animation){
    if (animation.swap == undefined){throw Error(`swapAnimation: animation is undefined`)}
    this.currentlyMarked.push(animation.swap.idx1)
    this.currentlyMarked.push(animation.swap.idx2)
    this.barArray[animation.swap.idx1].type = "swap"
    this.barArray[animation.swap.idx2].type = "swap"
    let tempbar:SortingBar = this.barArray[animation.swap.idx1]
    this.barArray[animation.swap.idx1] = this.barArray[animation.swap.idx2]
    this.barArray[animation.swap.idx2] = tempbar 
  }

  overwriteAnimation(animation:Animation){
    if (animation.overwrite == undefined){throw Error(`overwriteAnimation: animation is undefined`)}
    this.currentlyMarked.push(animation.overwrite.idx)
    this.barArray[animation.overwrite.idx].type = "overwrite"
    this.barArray[animation.overwrite.idx].value = animation.overwrite.toValue
    this.barArray[animation.overwrite.idx].height = `${this.valuetoHeightPercentage(animation.overwrite.toValue)}%`
  }

  reverseoverwriteAnimation(animation:Animation){
    if (animation.overwrite == undefined){throw Error(`reverseoverwriteAnimation: animation is undefined`)}
    this.currentlyMarked.push(animation.overwrite.idx)
    this.barArray[animation.overwrite.idx].type = "overwrite"
    this.barArray[animation.overwrite.idx].value = animation.overwrite.fromValue
    this.barArray[animation.overwrite.idx].height = `${this.valuetoHeightPercentage(animation.overwrite.fromValue)}%`   
  }

  sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setNewArray(){
    if (this.arrayLength < 2) {throw Error("Array-Length is smaller then 2 please increase length")}
    if (this.numberRange <= 0) {throw Error("Range of allowed numbers is <=0 please increase to atleast 1")}

    do{
    this.numberArray = this.getNumberArray();
    this.curArrayMax = Math.max(...this.numberArray);
    this.curArrayMin = Math.min(...this.numberArray);
    } while (this.curArrayMax === this.curArrayMin)

    this.barArray.length = 0;
    for (let idx:number = 0; idx < this.numberArray.length; idx++){
      let curValue:number = this.numberArray[idx]
      let heightPercentage:number = this.valuetoHeightPercentage(curValue)
      let fontSize:string = `${Math.min(900/Math.pow(this.numberArray.length, 0.5), 380)}%`
      this.barArray.push(new SortingBar(idx, curValue, heightPercentage, fontSize))
    }
  }

  valuetoHeightPercentage(value:number):number{
    return Math.floor(((value - this.curArrayMin)/(this.curArrayMax - this.curArrayMin)*90)*100)/100 + 10
  }

  getNumberArray():number[]{
    if (this.currentNumberProperty.id === "random"){return this.getRandomNumberArray()}
    else if (this.currentNumberProperty.id === "shuffledstairCase"){return this.getShuffledStairCaseNumberArray()}
    else if (this.currentNumberProperty.id === "nearlySorted"){return this.getNearlySorted()}
    else if (this.currentNumberProperty.id === "reversed"){return this.getReversedArray()}
    else if (this.currentNumberProperty.id === "reversedStairCase"){return this.getreversedStairCase()}

    
    else{throw Error(`Number Property Id: ${this.currentNumberProperty} is not known. Thus no execution is possible.`)}
  }

  getreversedStairCase(){
    let numberArray:number[] = []
    for(let arrayIdx = this.arrayLength - 1; arrayIdx >= 0; arrayIdx--){
      numberArray.push(arrayIdx + this.generateAtLeast);
    }
    return numberArray
  }

  getRandomNumberArray():number[]{
    let numberArray:number[] = []
    for(let arrayIdx = 0; arrayIdx < this.arrayLength; arrayIdx++){
      numberArray.push(this.randomIntRange(this.generateAtLeast, this.numberRange));
    }
    return numberArray
  }
  
  getShuffledStairCaseNumberArray():number[]{
    let numberArray:number[] = []
    for(let arrayIdx = 0; arrayIdx < this.arrayLength; arrayIdx++){
      numberArray.push(arrayIdx + this.generateAtLeast);
    }
    this.FisherYatesShuffle(numberArray)
    return numberArray
  }

  FisherYatesShuffle(array:number[]){
    let counter = array.length;
    while (counter > 0) {
        let idx = Math.floor(Math.random() * counter);
        counter--;
        this.swap(counter, idx, array)
    }
  }

  getNearlySorted():number[]{
    let numberArray:number[] = this.getRandomNumberArray().sort((a,b)=>a-b)
    this.onlySurfaceShuffle(numberArray)
    return numberArray
  }

  onlySurfaceShuffle(array:number[]){
    for(let arrayIdx = 4; arrayIdx < this.arrayLength; arrayIdx += 2){
      this.swap(arrayIdx, arrayIdx - this.randomIntRange(1,3), array)
    }
  }

  getReversedArray():number[]{
    return this.getRandomNumberArray().sort((a,b)=>b-a)
  }

  randomIntRange(min:number, numberRange:number){
    return Math.floor(Math.random()*(numberRange+1) + min)
  }

  swap(i1:number, i2:number, array:number[]){
    let temp = array[i1]
    array[i1] = array[i2]
    array[i2] =  temp
  }

}
