import {AllPurposeNode} from './pathfinding-all-purpose-graph'
import {Animation} from '../services/sorting/sorting-algorithms.service'


export class BinaryMinHeapforNode {
    public heap!:AllPurposeNode[]

    constructor(_array:AllPurposeNode[] = []){
        for (let idx:number = 0; idx < _array.length; idx++){
            let curNode = _array[idx]
            curNode.listIdx = idx
            curNode.inDataStructure = true
        }
        this.heap = _array;
        this.buildHeap();     
    }

    buildHeap(): void{
        let lastParentIdx:number = Math.floor((this.heap.length-2)/2)
        for(let parentIdx = lastParentIdx; parentIdx >= 0; parentIdx-- ){
            this.siftDown(parentIdx)
        }}

    siftDown(parentIdx:number):void {
        let lastParentIdx:number = Math.floor((this.heap.length-2)/2)
        while(parentIdx <= lastParentIdx){
            let child1Idx:number = parentIdx * 2 + 1
            let child2Idx:number = parentIdx * 2 + 2

            if (child2Idx >= this.heap.length || this.heap[child1Idx].heuristicValue < this.heap[child2Idx].heuristicValue){          // MIN MAX
                if(this.heap[child1Idx].heuristicValue < this.heap[parentIdx].heuristicValue){this.swap(child1Idx, parentIdx)}        // MIN MAX
                else {return}
                parentIdx = child1Idx
            } else {
                if(this.heap[child2Idx].heuristicValue < this.heap[parentIdx].heuristicValue){this.swap(child2Idx, parentIdx)}        // MIN MAX
                else {return}
                parentIdx = child2Idx
            }                             
        }
        }

    siftUp(childIdx:number):void {
        while(childIdx > 0){
            let parentIdx:number = Math.floor((childIdx-1)/2)
            if(this.heap[childIdx].heuristicValue <= this.heap[parentIdx].heuristicValue){this.swap(childIdx, parentIdx)}        // MIN MAX
            else {return}
            childIdx = parentIdx
        }
    }

    peek():number {
        return this.heap[0].heuristicValue
    }

    remove():AllPurposeNode {
        let ele:AllPurposeNode = this.heap[0]
        this.swap(0, this.heap.length-1)  
        this.heap.pop()
        this.siftDown(0)
        ele.inDataStructure = false
        ele.listIdx = Number.POSITIVE_INFINITY
        return ele
    }

    insert(node:AllPurposeNode):void {
        this.heap.push(node)
        node.listIdx = this.heap.length-1
        node.inDataStructure = true
        this.siftUp(this.heap.length-1)
    }

    updatePosofNode(listIdx:number):void{
        this.siftUp(listIdx)
        this.siftDown(listIdx)
    }

    swap(i:number,j:number):void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]

        let node1:AllPurposeNode =  this.heap[i]
        let node2:AllPurposeNode =  this.heap[j]
        let node1listidx:number = node1.listIdx
        node1.listIdx = node2.listIdx
        node2.listIdx = node1listidx
    }               
}

export class BinaryMaxHeapforSorting {
    public heap:number[] = []
    public effectiveLength:number = 0
    public animationArray:Animation[] = []

    constructor(array:number[] = []){
        this.heap = array;
        this.effectiveLength = this.heap.length
        this.buildHeap();         
    }

    buildHeap(): void{
        let lastParentIdx:number = Math.floor((this.effectiveLength-2)/2)
        for(let parentIdx = lastParentIdx; parentIdx >= 0; parentIdx-- ){
            this.siftDown(parentIdx)
        }
    }

    siftDown(parentIdx:number):void {
        let lastParentIdx:number = Math.floor((this.effectiveLength-2)/2)
        while(parentIdx <= lastParentIdx){
            let child1Idx:number = parentIdx * 2 + 1
            let child2Idx:number = parentIdx * 2 + 2
            if (child2Idx < this.effectiveLength ){this.animationArray.push({compare:{idx1: child1Idx,idx2: child2Idx}})}
            if (child2Idx >= this.effectiveLength || this.heap[child1Idx] > this.heap[child2Idx]){          // MIN MAX
                this.animationArray.push({compare:{idx1: child1Idx,idx2: parentIdx}})
                if(this.heap[child1Idx] > this.heap[parentIdx]){                                            // MIN MAX
                    this.swap(child1Idx, parentIdx)
                }        
                else {return}
                parentIdx = child1Idx
            } else {
                this.animationArray.push({compare:{idx1: child2Idx,idx2: parentIdx}})
                if(this.heap[child2Idx] > this.heap[parentIdx]){                                            // MIN MAX                                     
                    this.swap(child2Idx, parentIdx)
                }        
                else {return}
                parentIdx = child2Idx
            }                             
        }
        }

    siftUp(childIdx:number):void {
        while(childIdx > 0){
            let parentIdx:number = Math.floor((childIdx-1)/2)
            if(this.heap[childIdx] > this.heap[parentIdx]){                                               // MIN MAX
                this.swap(childIdx, parentIdx)
            }        
            else {return}
            childIdx = parentIdx
        }
    }

    peek():number {
        return this.heap[0]
    }

    moveMaxToEnd():void {
        if(this.effectiveLength === 0) {return}
        let ele:number = this.heap[0]
        this.swap(0, this.effectiveLength-1)  
        this.effectiveLength--
        this.siftDown(0)
    }

    insert(value:number):void {
        this.heap.push(value)
        this.effectiveLength++
        this.siftUp(this.effectiveLength-1)
    }

    swap(i:number,j:number):void {
        this.animationArray.push({swap:{idx1: i,idx2: j}})
        let temp:number = this.heap[i]
        this.heap[i] = this.heap[j]
        this.heap[j] = temp
    }               
}