export class GridNode {
    public id! : string;
    public row! : number;
    public col! : number;
    public type! : string;
  
    constructor(rowIn:number, colIn:number, type:string = "unvisited") { 
      this.id = `${rowIn}:${colIn}`
      this.row = rowIn
      this.col = colIn
      this.type = type
    }
    
  }