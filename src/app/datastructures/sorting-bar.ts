export class SortingBar {
    public id! : number;
    public value! : number;
    public type! : string;
    public height! : string;
    public fontSize! : string;

    constructor(id:number, value:number, height:number,fontSize:string , type:string = "inactive") { 
        this.id = id
        this.value = value
        this.type = type
        this.height = `${height}%`
        this.fontSize = fontSize
    }
    
  }