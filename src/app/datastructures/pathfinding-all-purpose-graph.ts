export class AllPurposeGraph {
    public Nodes: any = {};
    public Edges: any = {};
    public startNode!: AllPurposeNode;
    public endNode!: AllPurposeNode;

    constructor(){}
}

export class AllPurposeNode {
    public id! : string;
    public x! : number;
    public y! : number;
    public z! : number;
    public type! : string;
    public visited! : boolean;
    public heuristicValue! : number;
    public outgoingEdges! : AllPurposeEdge[];
    public prevNode! : AllPurposeNode;
    public inDataStructure! : boolean;
    public distanceToStartNode! :number;
    public listIdx!:number;
  
    constructor(
        id:string,
        heuristicValue:number = Number.POSITIVE_INFINITY,
        visited:boolean = false,
        outgoingEdges = []
        ) {
        this.id = id;
        this.heuristicValue = heuristicValue;
        this.visited = visited;
        this.outgoingEdges = outgoingEdges;
        this.inDataStructure = false
        this.distanceToStartNode = Number.POSITIVE_INFINITY
        this.listIdx = Number.POSITIVE_INFINITY
        }    
}

export class AllPurposeEdge {
    public id! : string;
    public cost! : number;
    public type! : string;
    public directed! : boolean;
    public startnode! : AllPurposeNode;
    public endnode! : AllPurposeNode;
    

    constructor(
        id:string, 
        startnode:AllPurposeNode, 
        endnode:AllPurposeNode, 
        cost:number = 1, 
        directed:boolean = true,
        ) {
        this.id = id;
        this.startnode = startnode;
        this.endnode = endnode;
        this.cost = cost;
        this.directed = directed;       
        }
}   