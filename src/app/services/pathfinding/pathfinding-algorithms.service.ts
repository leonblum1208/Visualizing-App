import { Injectable } from '@angular/core';
import { GridNode } from '../../datastructures/pathfinding-grid-node';
import { AllPurposeGraph, AllPurposeNode, AllPurposeEdge }from '../../datastructures/pathfinding-all-purpose-graph';
import { BinaryMinHeapforNode }from '../../datastructures/heaps';



@Injectable({
  providedIn: 'root'
})
export class PathfindingAlgorithmsService {

  constructor() { }



  algorithmExecuter(argumentsObject:any){ 

    let newAPGraphDijkstra: AllPurposeGraph = this.transform(argumentsObject)
    let visitedNodesinOrderDijkstra: AllPurposeNode[] = this.dijkstra(newAPGraphDijkstra, argumentsObject)
    let pathinOrderDijkstra: AllPurposeNode[] = this.backtrack(newAPGraphDijkstra.endNode)

    let newAPGraph: AllPurposeGraph = this.transform(argumentsObject)
    let visitedNodesinOrder: AllPurposeNode[]  = this.chooseandExecuteAlgorithm(argumentsObject, newAPGraph)
    let pathinOrder: AllPurposeNode[] = this.backtrack(newAPGraph.endNode)

    return {"pathList" : pathinOrder, "visitedList" : visitedNodesinOrder, "graph" : newAPGraph,
            "pathListDijkstra" : pathinOrderDijkstra, "visitedListDijkstra" : visitedNodesinOrderDijkstra, "graphDijkstra" : newAPGraphDijkstra, }
  };

  transform(argObj:any): AllPurposeGraph{
    if(argObj.dataType === "tableMatrix"){return this.tableToAllPurpose(argObj.data, argObj.includeDiagonals)}
    
    else{throw Error(`Datatype: ${argObj.dataType} is not known. Thus no transforamtion is possible.`)}
  };

  chooseandExecuteAlgorithm(argObj:any, graph:AllPurposeGraph): AllPurposeNode[]{
    if      (argObj.algorithmId === 'dijkstra'){return this.dijkstra(graph, argObj)}
    else if (argObj.algorithmId === 'bfs'){return this.breadthFirstSearch(graph, argObj)}
    else if (argObj.algorithmId === 'a*'){return this.aStar(graph, argObj)}
    else if (argObj.algorithmId === 'dfs'){return this.depthFirstSearch(graph, argObj)}
   
    else{throw Error(`AlgorithmId: ${argObj.algorithmId} is not known. Thus no execution is possible.`)}
  };

  chooseandGetHeuristicValue(node1:AllPurposeNode, node2:AllPurposeNode, argObj:any):number{
    if      (argObj.heuristicId === 'manhatten-distance'){return this.getManhattenDistance(node1, node2)}
    else if (argObj.heuristicId === 'beeline'){return this.getbeelineDistance(node1, node2)}
    else if (argObj.heuristicId === 'diagonalManhatten'){return this.getdiagonalManhattenDistance(node1, node2)}
    
    else{throw Error(`HeuristicId: ${argObj.heuristicId} is not known. Thus no execution is possible.`)}
  
  }



  tableToAllPurpose(table:GridNode[][], inclDiags:boolean) : AllPurposeGraph {
    let newGraph:AllPurposeGraph = new AllPurposeGraph;
    let curIdCount:number = 0;
    let width:number = table[0].length;
    let height:number = table.length;
    // Dumping all Gridnodes as AllPurposeNodes in the Nodescontainer
    for (let row:number = 0; row < height; row++){
      for (let col = 0; col < width; col++){
        let type = table[row][col].type;
        if (type === "unvisited" || type === "isStart" || type === "isEnd") {
          newGraph.Nodes[curIdCount] = new AllPurposeNode(`${curIdCount}`);
          newGraph.Nodes[curIdCount].x = col;
          newGraph.Nodes[curIdCount].y = row;
          newGraph.Nodes[curIdCount].type = type;
          if (type === "isStart"){
            newGraph.Nodes[curIdCount].heuristicValue = 0;
            newGraph.Nodes[curIdCount].distanceToStartNode = 0;
            newGraph.startNode = newGraph.Nodes[curIdCount];
          } else if (type === "isEnd") {
            newGraph.endNode = newGraph.Nodes[curIdCount];
          }; 
        }
        curIdCount++ ;
      }
    }

    // Make Edges
    for(let key in newGraph.Nodes){
      let curNode:AllPurposeNode = newGraph.Nodes[key];
      let curId:number = parseInt(curNode.id);

      // get neighbours and distances
      let neighboursIds:number[][] = []
      if(curNode.x < width-1)   {neighboursIds.push([curId+1,1]) 
        if(inclDiags && curNode.y < height-1 && curId+1 in newGraph.Nodes && curId+width in newGraph.Nodes)
        {neighboursIds.push([curId+width+1,Math.SQRT2])}}
      if(curNode.y < height-1)  {neighboursIds.push([curId+width,1])
        if(inclDiags && curNode.x > 0 && curId-1 in newGraph.Nodes && curId+width in newGraph.Nodes)     
        {neighboursIds.push([curId+width-1,Math.SQRT2])}}
      if(curNode.x > 0)       {neighboursIds.push([curId-1,1])
        if(inclDiags && curNode.y > 0 && curId-1 in newGraph.Nodes && curId-width in newGraph.Nodes)     
        {neighboursIds.push([curId-width-1,Math.SQRT2])}}
      if(curNode.y > 0)       {neighboursIds.push([curId-width,1])
        if(inclDiags && curNode.x < width-1 && curId+1 in newGraph.Nodes && curId-width in newGraph.Nodes) 
        {neighboursIds.push([curId-width+1,Math.SQRT2])}}


      for(let listidx:number = 0; listidx < neighboursIds.length; listidx++){
        let endNodeId:number = neighboursIds[listidx][0]
        let curCost:number = neighboursIds[listidx][1]

        if(endNodeId in newGraph.Nodes){
          
          let curEdge: AllPurposeEdge  = new AllPurposeEdge(
            `${curId}.${endNodeId}`, 
            curNode, 
            newGraph.Nodes[endNodeId],
            curCost
            );
          curNode.outgoingEdges.push(curEdge);
          newGraph.Edges[curEdge.id] = curEdge;
        }
    }     
    }
    return newGraph
  };

  allPurposeNodeListToPosList(nodeList:AllPurposeNode[]): number[][]{
    return nodeList.map( Node => [Node.y, Node.x] )
  };

  breadthFirstSearch(graph:AllPurposeGraph, argObj:any):AllPurposeNode[]{

    let queue: AllPurposeNode[] = [graph.startNode]

    let visitedNodesinOrder: AllPurposeNode[] = []

    while (queue.length > 0) {
      let curNode:AllPurposeNode = queue[0] // otherwise says mimimi i can be undefined i dont work like this
      queue.shift()
      curNode.inDataStructure = false

      curNode.visited = true
      visitedNodesinOrder.push(curNode)
      if (curNode === graph.endNode) {break}
      
      for (let curidx:number = 0; curidx < curNode.outgoingEdges.length ; curidx++){
        let curedge: AllPurposeEdge = curNode.outgoingEdges[curidx]
        let endnode: AllPurposeNode = curedge.endnode
        if (endnode.visited === false && endnode.inDataStructure === false){
          endnode.prevNode = curNode
          endnode.inDataStructure = true
          endnode.distanceToStartNode = curNode.distanceToStartNode + curedge.cost
          queue.push(endnode)
        }
      }    
    }
    return visitedNodesinOrder
  };

  depthFirstSearch(graph:AllPurposeGraph, argObj:any):AllPurposeNode[]{

    let stack: AllPurposeNode[] = [graph.startNode]

    let visitedNodesinOrder: AllPurposeNode[] = []

    while (stack.length > 0) {
      let curNode:AllPurposeNode = stack[stack.length - 1] // otherwise says mimimi i can be undefined i dont work like this
      stack.pop()
      curNode.inDataStructure = false

      curNode.visited = true
      visitedNodesinOrder.push(curNode)
      if (curNode === graph.endNode) {break}
      
      for (let curidx:number = 0; curidx < curNode.outgoingEdges.length ; curidx++){
        let curedge: AllPurposeEdge = curNode.outgoingEdges[curidx]
        let endnode: AllPurposeNode = curedge.endnode
        if (endnode.visited === false && endnode.inDataStructure === false){
          endnode.prevNode = curNode
          endnode.inDataStructure = true
          endnode.distanceToStartNode = curNode.distanceToStartNode + curedge.cost
          stack.push(endnode)
        }
      }    
    }
    return visitedNodesinOrder
  };

  dijkstra(graph:AllPurposeGraph, argObj:any):AllPurposeNode[]{

    let minHeap = new BinaryMinHeapforNode([graph.startNode])
    let visitedNodesinOrder: AllPurposeNode[] = []
    
    while (minHeap.heap.length > 0){

      let curNode:AllPurposeNode = minHeap.remove()
      
      curNode.visited = true
      visitedNodesinOrder.push(curNode)
      if (curNode === graph.endNode) {break}

      for (let curidx:number = 0; curidx < curNode.outgoingEdges.length ; curidx++){
        let curedge: AllPurposeEdge = curNode.outgoingEdges[curidx]
        let endnode: AllPurposeNode = curedge.endnode
        if (endnode.visited === false){ 
          if (endnode.inDataStructure === false){ //insert
            minHeap.insert(endnode)
          } 
          if(curNode.heuristicValue + curedge.cost < endnode.heuristicValue) { // update
            endnode.prevNode = curNode
            endnode.distanceToStartNode = curNode.distanceToStartNode + curedge.cost
            endnode.heuristicValue = curNode.heuristicValue + curedge.cost
            minHeap.updatePosofNode(endnode.listIdx)
          }
        }
      }  
    }
    
    return visitedNodesinOrder
  };

  aStar(graph:AllPurposeGraph, argObj:any):AllPurposeNode[]{

    let minHeap = new BinaryMinHeapforNode([graph.startNode])
    let visitedNodesinOrder: AllPurposeNode[] = []
    
    while (minHeap.heap.length > 0){

      let curNode:AllPurposeNode = minHeap.remove()
      
      curNode.visited = true
      visitedNodesinOrder.push(curNode)
      if (curNode === graph.endNode) {break}

      for (let curidx:number = 0; curidx < curNode.outgoingEdges.length ; curidx++){
        let curedge: AllPurposeEdge = curNode.outgoingEdges[curidx]
        let endnode: AllPurposeNode = curedge.endnode

        let heuristicvalue:number = this.chooseandGetHeuristicValue(endnode, graph.endNode, argObj)
        heuristicvalue *= argObj.heuristicWeight
        
        if (endnode.visited === false){ 
          if (endnode.inDataStructure === false){ //insert
            minHeap.insert(endnode)
          } 
          if(curNode.distanceToStartNode + curedge.cost + heuristicvalue < endnode.heuristicValue) { // update           
            endnode.prevNode = curNode
            endnode.distanceToStartNode = curNode.distanceToStartNode + curedge.cost
            endnode.heuristicValue = endnode.distanceToStartNode + heuristicvalue
            minHeap.updatePosofNode(endnode.listIdx)
          }
        }
      }  
    }
    return visitedNodesinOrder
  };


  getManhattenDistance(node1:AllPurposeNode, node2:AllPurposeNode):number{
    return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y)
  }

  getbeelineDistance(node1:AllPurposeNode, node2:AllPurposeNode):number{
    return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)) * 1
  }

  getdiagonalManhattenDistance(node1:AllPurposeNode, node2:AllPurposeNode):number{
    let deltaX:number = Math.abs(node1.x - node2.x)
    let deltaY:number = Math.abs(node1.y - node2.y) 
    return  deltaX + deltaY + Math.min(deltaX, deltaY) * (Math.SQRT2 - 2) 
  }


  backtrack(endNode:AllPurposeNode):AllPurposeNode[]{
    let pathinOrder: AllPurposeNode[] = []
    let curNode: AllPurposeNode = endNode
    while(curNode.prevNode !== undefined){
      pathinOrder.push(curNode)
      curNode = curNode.prevNode
    }
    if (pathinOrder.length > 0){pathinOrder.push(curNode)}
    pathinOrder.reverse()
    return pathinOrder
  }
}
