import { Injectable } from '@angular/core';
import { BinaryMaxHeapforSorting } from '../../datastructures/heaps'
import { RADIX_BASE } from '../../data/sorting-config'


export interface Animation{
  compare?:{idx1:number, idx2:number}
  swap?:{idx1:number, idx2:number}
  overwrite?:{idx:number, fromValue:number, toValue:number}
}

@Injectable({
  providedIn: 'root'
})

export class SortingAlgorithmsService {

  constructor() { }

  public types:string[] = ["inactive", "compare", "overwrite", "swap"]
  public animationArray:Animation[] = []

  // Radix Sort
  public radixBase:number = RADIX_BASE

  // Shell Sort
  public shellSortGaps:number[] = [701,301,132,57,23,10,4,1]

  // timsort
  public minGallop:number = 7
  public minRunBaseExponent:number = 6
  public minRunBase:number = Math.pow(2, this.minRunBaseExponent)


  // Statistics
  public comparisonsDone:number = 0 ;
  public swapsDone:number = 0 ;
  public overwritesDone:number = 0 ;
  public comparisonsDonePerNumber:number = 0 ;
  public swapsDonePerNumber:number = 0 ;
  public overwritesDonePerNumber:number = 0 ;


  getSortingAnimationArray(argObj:any):Animation[]{
    this.animationArray = []
    let controlArray:number[] = argObj.array.slice()
    controlArray.sort((a, b) => a - b)
    if      (argObj.algorithmId === 'bubbleSort'){this.bubbleSort(argObj.array)}
    else if (argObj.algorithmId === 'selectionSort'){this.selectionSort(argObj.array)}
    else if (argObj.algorithmId === 'insertionSort'){this.insertionSort(argObj.array)}
    else if (argObj.algorithmId === 'binInsertionSort'){this.insertionSortBinSearch(argObj.array)}
    else if (argObj.algorithmId === 'shellSort'){this.shellSort(argObj.array)}
    else if (argObj.algorithmId === 'mergeSort'){this.mergeSort(argObj.array)}
    else if (argObj.algorithmId === 'timsort'){this.timsort(argObj.array)}
    else if (argObj.algorithmId === 'quickSort'){this.quickSort(argObj.array)}
    else if (argObj.algorithmId === 'heapSort'){this.heapSort(argObj.array)}
    else if (argObj.algorithmId === 'radixSort'){this.radixSort(argObj.array)}
   
    else{throw Error(`AlgorithmId: ${argObj.algorithmId} is not known. Thus no sorting is possible.`)}

    this.doStatistics(argObj.array)

    console.log(`Used ${argObj.algorithmId}. Array is correctly sorted:` ,this.arraysAreTheSame(argObj.array, controlArray))
    return this.animationArray
  };

  doStatistics(array:number[]){
    this.comparisonsDone = 0
    this.swapsDone = 0
    this.overwritesDone = 0
    for (let idx = 0; idx < this.animationArray.length; idx++){
      let animation:any = this.animationArray[idx]

    if(animation.compare){this.comparisonsDone++}
    if(animation.swap){this.swapsDone++}
    if(animation.overwrite){this.overwritesDone++}
    }
    this.comparisonsDonePerNumber = Math.round(10 * this.comparisonsDone / array.length) /10;
    this.swapsDonePerNumber = Math.round(10 * this.swapsDone / array.length) /10;
    this.overwritesDonePerNumber = Math.round(10 * this.overwritesDone / array.length) /10;
  }


  bubbleSort(array: number[]){
    let unsorted:boolean = false;  
    let idx:number = 1; 
    let stopidx:number = array.length; 
    do{
      unsorted = false
      idx = 1
      while (idx < stopidx){
        this.animationArray.push({compare:{idx1: idx - 1,idx2: idx}})
        if(array[idx] < array[idx - 1]){
          this.swap(idx-1, idx, array); 
          unsorted = true;
        };
        idx++   
      }
      stopidx--
    } while(unsorted)
  }


  selectionSort(array: number[]){
    let curMinIdx:number = 0;
    for (let unsortedstartidx:number = 0; unsortedstartidx < array.length; unsortedstartidx++) {
      curMinIdx = unsortedstartidx;
      for (let workidx:number = unsortedstartidx + 1; workidx < array.length; workidx++){
        this.animationArray.push({compare:{idx1: curMinIdx, idx2: workidx}})
        if(array[curMinIdx] > array[workidx]){
          curMinIdx = workidx
        }
      }
      this.swap(curMinIdx, unsortedstartidx, array); 
    }
  }


  insertionSort(array: number[]){
    for (let mainidx:number = 1; mainidx < array.length; mainidx++) {
      for (let insertidx:number = mainidx; 0 < insertidx; insertidx--){
        this.animationArray.push({compare:{idx1: insertidx - 1,idx2: insertidx}})
        if(array[insertidx - 1] <= array[insertidx]){break}
        this.swap(insertidx - 1, insertidx, array); 
      }
    }
  }


  binarySearchInsertionLastIdx(array: number[], left:number, right:number, targetIdx:number):number{
    if(left===right){throw(Error("binarySearchInsertionLastIdx: left === right. left < right required"))}
    let middle
    let target:number = array[targetIdx]
    while (left < right){
        middle = left + ((right - left) >> 1)
        this.animationArray.push({compare:{idx1: middle,idx2: targetIdx}})
        if (array[middle] > target) {right = middle} 
        else {left = middle + 1}
    }
  return left
  }
  binarySearchInsertionFirstIdx(array: number[], left:number, right:number, targetIdx:number):number{
    if(left===right){throw(Error("binarySearchInsertionFirstIdx: left === right. left < right required"))}
    let middle
    let target:number = array[targetIdx]
    while (left < right){
        middle = left + ((right - left) >> 1)
        this.animationArray.push({compare:{idx1: middle,idx2: targetIdx}})
        if (array[middle] >= target) {right = middle} 
        else {left = middle + 1}
    }
  return left
  }
  insertionSortBinSearch(array:number[], left:number = 0, right:number = array.length, startIdx:number = left + 1){
    let curNumber:number
    let shiftidx:number
    let insertidx:number
    for(let curIdx:number = startIdx; curIdx < right; curIdx++){
        curNumber = array[curIdx];
        insertidx = this.binarySearchInsertionLastIdx(array, left, curIdx, curIdx);
        if(insertidx === curIdx){continue}
        shiftidx = curIdx;
        while (shiftidx > insertidx) {
            this.animationArray.push({overwrite:{idx: shiftidx, fromValue: array[shiftidx], toValue: array[shiftidx - 1]}})
            array[shiftidx] = array[shiftidx - 1];
            shiftidx--;
        }
        this.animationArray.push({overwrite:{idx: insertidx, fromValue: array[insertidx], toValue: curNumber}})
        array[insertidx] = curNumber;
    }
  }


  setMinRunBase(){
    this.minRunBase = Math.pow(2, this.minRunBaseExponent)
  }
  computeMinRun(n:number):number{
    this.setMinRunBase()
    let r = 0; // is 1 if any bit of the first six is set
    while(n >= this.minRunBase) {
        r |= n&1; // r = 1 if r is already 1 or if n's least signgificant bit is set (=1) (n&1 is 1 if n is uneven and 0 if even)
        n >>= 1; // equivalent to x = Math.floor(x/2)
    }
    return n + r // array.length/(n+r) =< 2^x to maximaize merge efficiency and avoid merging like 65/64 and mergin 64 and 1 
  }
  reverseRun(array:number[], left:number, right:number) {
    right--;
    while (left < right) {
      this.swap(left, right, array)
      left++
      right--
    }
  }
  countRun(array:number[], left:number, right:number):number{ 
    if(left===right){throw(Error("countRun: left === right. left < right required"))}
    let count:number = 1;
    let descending:boolean = false;
    left++
    count++
    if(left===right){return count}
    this.animationArray.push({compare:{idx1: left - 1,idx2: left}})
    if(array[left] < array[left - 1]){ // descending >
      descending = true
      for(left = left + 1; left < right; left++, count++){
        this.animationArray.push({compare:{idx1: left - 1,idx2: left}})
        if(array[left] < array[left - 1]){}
        else{
          break
        }
      }
    }else{//ascending <=
      for(left = left + 1; left < right; left++, count++){
        this.animationArray.push({compare:{idx1: left - 1,idx2: left}})
        if(array[left] < array[left - 1]){break}
      }
    }

    if(descending){this.reverseRun(array, left - count, left)}
    return count
  }
  gallopRightLastIdx(array:number[], start:number, right:number, targetIdx:number){ // search in left run so target == left[idx] favors left's values
    let nextStep:number = 1;
    let target:number = array[targetIdx]
    let runningIdx:number = start
    while (runningIdx < right && target >= array[runningIdx]){     
      this.animationArray.push({compare:{idx1: runningIdx,idx2: targetIdx}})
      runningIdx += nextStep
      nextStep *= 2
    }
    if(runningIdx >= right){this.animationArray.push({compare:{idx1: right - 1,idx2: targetIdx}}) }
    if (runningIdx >= right && target >= array[right - 1]){return right}
    return this.binarySearchInsertionLastIdx(array, runningIdx - (nextStep>>1), Math.min(runningIdx, right), targetIdx)
  }
  gallopRightFirstIdx(array:number[], start:number, right:number, targetIdx:number){ // search in right run so target == left[idx] favors target and breaks
    let nextStep:number = 1;
    let target:number = array[targetIdx]
    let runningIdx:number = start
    while (runningIdx < right && target > array[runningIdx]){     
      this.animationArray.push({compare:{idx1: runningIdx,idx2: targetIdx}})
      runningIdx += nextStep
      nextStep *= 2
    }
    if(runningIdx >= right){ this.animationArray.push({compare:{idx1: right - 1,idx2: targetIdx}}) }
    if (runningIdx >= right && target > array[right - 1]){return right}
    return this.binarySearchInsertionFirstIdx(array, runningIdx - (nextStep>>1), Math.min(runningIdx, right), targetIdx)
  }
  adaptiveMerge(array:number[], left:number, middle:number, right:number){
    if (left === middle || right === middle){return}
    let insertPosofLeftLast = this.binarySearchInsertionFirstIdx(array, middle, right, middle - 1)
    let insertPosofRightFirst = this.binarySearchInsertionLastIdx(array, left, middle, middle)
    let gallopCountLeft:number = 0
    let gallopCountRight:number = 0
    let overwriteidx:number = insertPosofRightFirst
    let arraySlice = array.slice()
    let i1: number = insertPosofRightFirst
    let i2: number = middle

    while (overwriteidx < insertPosofLeftLast){
        
      for (overwriteidx; overwriteidx < insertPosofLeftLast; overwriteidx++){
        if (gallopCountRight >= this.minGallop || gallopCountLeft >= this.minGallop){break}

        if(i1 < middle && i2 < insertPosofLeftLast){this.animationArray.push({compare:{idx1: i1,idx2: i2}})}
        if(i1 < middle && (i2 >= insertPosofLeftLast || arraySlice[i1] <= arraySlice[i2])){
          this.animationArray.push({overwrite:{idx: overwriteidx, fromValue: array[overwriteidx], toValue: arraySlice[i1]}})
          array[overwriteidx] = arraySlice[i1]   
          i1++
          if(i2 < insertPosofLeftLast){gallopCountLeft++}
          gallopCountRight = 0
        } else {
          this.animationArray.push({overwrite:{idx: overwriteidx, fromValue: array[overwriteidx], toValue: arraySlice[i2]}})
          array[overwriteidx] = arraySlice[i2]
          i2++
          if(i1 < middle){gallopCountRight++}
          gallopCountLeft = 0
        }
      }

      if (gallopCountRight >= this.minGallop){ 
        gallopCountRight = 0
        let insertRigthValuesuntil:number = this.gallopRightFirstIdx(arraySlice, i2 - 1, insertPosofLeftLast, i1)
        while (i2 < insertRigthValuesuntil){
          this.animationArray.push({overwrite:{idx: overwriteidx, fromValue: array[overwriteidx], toValue: arraySlice[i2]}})
          array[overwriteidx] = arraySlice[i2]
          i2++
          overwriteidx++
        }
      }else if (gallopCountLeft >= this.minGallop){
        gallopCountLeft = 0
        let insertLeftValuesuntil:number = this.gallopRightLastIdx(arraySlice, i1 - 1, middle , i2)
        while (i1 < insertLeftValuesuntil){
          this.animationArray.push({overwrite:{idx: overwriteidx, fromValue: array[overwriteidx], toValue: arraySlice[i1]}})
          array[overwriteidx] = arraySlice[i1]
          i1++
          overwriteidx++
        }
      }
    }
  }
  timsort(array: number[]){
    let n:number = array.length
    let minRun:number = this.computeMinRun(n);
    let stack:number[] = []
    let runStartIdx:number = 0
    let runLength:number = 0
    let firstRange:number
    let secondRange:number
    let thirdRange:number
    while (runStartIdx < n){
      runLength = this.countRun(array, runStartIdx, n)
      if (runLength < minRun){
        this.insertionSortBinSearch(array, runStartIdx, Math.min(n, runStartIdx + minRun), runStartIdx + runLength)
        stack.push(runStartIdx)
        runStartIdx =  Math.min(n, runStartIdx + minRun)
      } else {
        stack.push(runStartIdx)
        runStartIdx = Math.min(n, runStartIdx + runLength)
      }
      
      firstRange = runStartIdx - stack[stack.length - 1]
      secondRange = stack.length > 1 ? stack[stack.length - 1] - stack[stack.length - 2] : Number.POSITIVE_INFINITY
      thirdRange = stack.length > 2 ? stack[stack.length - 2] - stack[stack.length - 3] : Number.POSITIVE_INFINITY
      while (firstRange >= secondRange || ((firstRange + secondRange) >= thirdRange && stack.length > 2) || runStartIdx >= n && stack.length > 1){
        let temp1:number = stack[stack.length - 1]; stack.pop();   
        let temp2:number = stack[stack.length - 1]; stack.pop();                     
        if((firstRange + secondRange) >= thirdRange && firstRange > thirdRange){ //merge second and third
            let temp3:number = stack[stack.length - 1]; stack.pop();
            this.adaptiveMerge(array, temp3, temp2, temp1)
            stack.push(temp3)
            stack.push(temp1)      
        } else { //merge first and second
          this.adaptiveMerge(array, temp2, temp1, runStartIdx)
          stack.push(temp2)
          }      
        firstRange = runStartIdx - stack[stack.length - 1]
        secondRange = stack.length > 1 ? stack[stack.length - 1] - stack[stack.length - 2]  : Number.POSITIVE_INFINITY
        thirdRange = stack.length > 2 ? stack[stack.length - 2] - stack[stack.length - 3] : Number.POSITIVE_INFINITY
      }
    }
  }


  shellSort(array: number[]){
    for(let gapidx:number = 0; gapidx < this.shellSortGaps.length; gapidx++){
      let gap:number = this.shellSortGaps[gapidx]
      for(let mainidx:number = gap; mainidx < array.length; mainidx++){
        let curNumber:number = array[mainidx]
        let insertidx:number = mainidx
        if(insertidx >= gap){this.animationArray.push({compare:{idx1: insertidx - gap,idx2: mainidx}})}
        for(insertidx; insertidx >= gap && array[insertidx - gap] > curNumber ; insertidx -= gap){  
          if(insertidx >= gap && insertidx !== mainidx){this.animationArray.push({compare:{idx1: insertidx - gap,idx2: insertidx}})}   
          this.swap(insertidx - gap, insertidx, array); 
        }
        array[insertidx] = curNumber
      }
    }
  }


  mergeSort(array: number[]){
    this.mergeSortHelper(0, array.length, array, array.slice())
  }
  mergeSortHelper(left:number, right:number, arr1: number[], arr2: number[]){
    if(right - left <= 1){return}

    let middle:number = Math.floor((right + left)/2)
    this.mergeSortHelper(left, middle, arr2, arr1)
    this.mergeSortHelper(middle, right, arr2, arr1)

    this.mergeArraySnippets(left, middle, right, arr1, arr2)
  }
  mergeArraySnippets(left:number, middle:number, right:number, arr1:number[], arr2:number[]){
    let i1: number = left
    let i2: number = middle
    for (let overwriteidx:number = left; overwriteidx < right; overwriteidx++){
      if(i1 < middle && i2 !== right){this.animationArray.push({compare:{idx1: i1,idx2: i2}})}
      if(i1 < middle && (i2 === right || arr2[i1] <= arr2[i2])){
        this.animationArray.push({overwrite:{idx: overwriteidx, fromValue: arr1[overwriteidx], toValue: arr2[i1]}})
        arr1[overwriteidx] = arr2[i1]   
        i1++
      } else {
        this.animationArray.push({overwrite:{idx: overwriteidx, fromValue: arr1[overwriteidx], toValue: arr2[i2]}})
        arr1[overwriteidx] = arr2[i2]
        i2++
      }
    }
  }


  quickSort(array: number[], left:number = 0, right:number = array.length - 1){
    if(left >= right){return}

    let pivotidx:number = Math.floor((right + left)/2)
    let pivot:number = array[pivotidx]
    this.swap(left, pivotidx, array)

    let rightidx:number = right
    for (let leftidx:number = left + 1; leftidx <= rightidx; leftidx++){

      this.animationArray.push({compare:{idx1: leftidx,idx2: left}})
      if (array[leftidx] <= pivot) {continue}
      
      if(leftidx < rightidx){this.animationArray.push({compare:{idx1: rightidx,idx2: left}})}
      while (leftidx <= rightidx && array[rightidx] >= pivot){
        rightidx--
        if(leftidx < rightidx){this.animationArray.push({compare:{idx1: rightidx,idx2: left}})}
      }
      if(leftidx > rightidx){break}
      this.swap(leftidx, rightidx, array)
    }
    
    this.swap(rightidx, left, array)

    let rightSubarrayisBigger:boolean = rightidx - left - 1 < right - rightidx + 1 //to optimize worst case space complexity from n to log(n)
    if(rightSubarrayisBigger){ //then go for the right subarray first, so log(n) space on call stack is garuanteed
      this.quickSort(array, rightidx + 1, right) 
      this.quickSort(array, left, rightidx - 1)
    } else {
      this.quickSort(array, left, rightidx - 1)
      this.quickSort(array, rightidx + 1, right)      
    }
  }


  heapSort(array: number[]){
    let maxHeap:BinaryMaxHeapforSorting = new BinaryMaxHeapforSorting(array)
    while(maxHeap.effectiveLength > 1){
      maxHeap.moveMaxToEnd()
    }
    this.animationArray = maxHeap.animationArray
  }


  radixSort(array: number[]){
    let minValue:number = Math.min(...array);
    let maxValue:number = Math.max(...array);
    let exponent:number = 0;  
    let iterationCount:number = 0;
    let arr1:number[] = array;
    let arr2:number[] = array.slice(0, array.length);
    while (Math.max(maxValue, Math.abs(minValue)) >= Math.pow(this.radixBase, exponent) ){
      iterationCount++
      this.countSort(arr1, arr2, this.radixBase, exponent)
      let temp:number[] = arr1
      arr1 = arr2
      arr2 = temp
      exponent++
    }
    if(iterationCount % 2 == 0){ // needed because array = arr2 is not a copy that is deep enough
      for(let idx:number = 0; idx < arr2.length; idx++){
        array[idx] = arr2[idx]
      }
    }
   
  }
  countSort(arr1:number[], arr2:number[], base:number, exponent:number){
    let countarray:number[] = new Array(base + base - 1); //support negativ numbers
    countarray.fill(0);
    let divisor:number = Math.pow(base, exponent);

    for (let idx = 0; idx < arr2.length; idx++){
      this.animationArray.push({compare:{idx1: idx, idx2: idx}})
      let digit:number
      if(arr2[idx] < 0){digit = Math.ceil(arr2[idx]/divisor) % base + base - 1;}//support negativ numbers
      else{digit = Math.floor(arr2[idx]/divisor) % base + base - 1;} //support negativ numbers
      countarray[digit]++;
    }

    let count:number = 0;
    for (let countidx = 0; countidx < countarray.length; countidx++){
      count += countarray[countidx]
      countarray[countidx] = count
    }

    for (let idx = arr2.length - 1; idx >= 0; idx--){
      let digit:number
      if(arr2[idx] < 0){digit = Math.ceil(arr2[idx]/divisor) % base + base - 1;}//support negativ numbers
      else{digit = Math.floor(arr2[idx]/divisor) % base + base - 1;}//support negativ numbers
      
      countarray[digit] -= 1
      let position:number = countarray[digit]
      this.animationArray.push({overwrite:{idx: position, fromValue: arr2[position], toValue: arr2[idx]}})
      arr1[position] = arr2[idx]
    }
  }


  swap(i1:number, i2:number, array:number[]){
    this.animationArray.push({swap:{idx1: i1,idx2: i2}})
    let temp = array[i1]
    array[i1] = array[i2]
    array[i2] =  temp
  }

  isArraySorted (array:number[]) {
    let isSorted:boolean = true
    for(let j:number = 0 ; j < array.length - 1 ; j++){
      if(array[j] > array[j+1]) {
        isSorted  = false;
          break;
      }
  }
    return isSorted
  }

  arraysAreTheSame(a:number[], b:number[]) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }



}
