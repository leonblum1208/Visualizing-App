import { Injectable } from '@angular/core';
import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';

export interface networkPlan{
  hiddenLayerSizes:number[]
  activationFunctionId:string
  inputs:number
  outputs:number
}

export interface aICarConstructionPlan{
  networkPlan:networkPlan
  distSensors:SensorConstructionPlan[]
  giveSensors:boolean
  givePosition:boolean
  giveVelocity:boolean
  giveAcceleration:boolean
  giveZentripetalAcceleration:boolean
  mergeThrottleandBreak:boolean
}

export interface SensorConstructionPlan{
  relPositionCarFrameCode:[number,number,number,number]
  relativeAngle:number
}

export interface instance{
  biasesGenotype:number[],
  weightsGenotype:number[],
  fitness:number,
}

export interface numberrange{
  min:number
  max:number
  size:number
}

export interface fitnessFunctionInfo{
  collisionPunishmentFactor:number
  energyConsumptionFactor:number
  tractionControlFactor:number
  jerkFactor:number
  uncomfAccelerationFactor:number
  trackCompletionFactor:number
  trackpertime:number
  optimalFrictionFactor:number
}

export interface breedingInfo{
  goalPopulationSize:number 
  totalFitness:number // [0, population.length * maxfitnessperperson]

  selectionFunctionID:string //rouletteSelection, tournamentSelection
  tournamentSelectionDepth:number // [1, any]
  selectionTopXPercent:number

  crossoverRate:number, //[0,1]
  crossoverPoints: number //[1, genotype.length - 1]

  mutationRate:number, //[0,1]
  mutationRateperGeneBiases:number, //[0,1]
  mutationRateperGeneWeights:number, //[0,1]
  mutationMagnitudeBiases:number, //[0,1]
  mutationMagnitudeWeights:number, //[0,1]

  elitismFraction:number, //[0,1] 
  randomFraction:number, //[0,1]
}


export interface optionAsStringID {
  viewvalue:string,
  id:string,
}

export class FFneuralnetwork{
  public plan:networkPlan
  public weigths:number[][][] = []
  public biases:number[][] = []
  public activationFunc:(inputs: number[]) => number[]
  public activationFunctionID:string
  private NNServ:NeuralNetworkService

  constructor(plan:networkPlan, NNServ:NeuralNetworkService){
    if(plan.inputs == 0 || plan.outputs == 0){throw Error("FFneuralnetwork constructor: inputs or outputs are 0: cant construct")}
    this.plan = plan
    this.NNServ = NNServ
    this.activationFunctionID = plan.activationFunctionId
    switch(plan.activationFunctionId){
      case "softplus": this.activationFunc = this.NNServ.softplus; break;
      case "sigmoid": this.activationFunc = this.NNServ.sigmoid; break;
      case "ReLU": this.activationFunc = this.NNServ.ReLU; break;
      case "LeakyReLU": this.activationFunc = this.NNServ.LeakyReLU; break;
      case "tanh": this.activationFunc = this.NNServ.tanh; break;
      default: throw Error(`activationFunctionId: "${plan.activationFunctionId}" unknown`)
    }

    let layerSizes = [plan.inputs, ...plan.hiddenLayerSizes, plan.outputs]

    for(let i:number = 1; i < layerSizes.length; i++){
        this.weigths.push([...Array(layerSizes[i])].map(_ =>  this.NNServ.randArrayofSize(layerSizes[i-1])))  
        this.biases.push(this.NNServ.randArrayofSize(layerSizes[i]))
    }   
  }



  predict(inputs:number[]){
    let y_i:number[] = inputs
    let i:number = 0
    for(i; i < this.weigths.length - 1; i++){
      y_i = this.NNServ.matDotvec(this.weigths[i], y_i)
      y_i = this.NNServ.addVectors(y_i, this.biases[i])
      y_i = this.activationFunc(y_i)
    }
    y_i = this.NNServ.matDotvec(this.weigths[i], y_i)
    return this.NNServ.addVectors(y_i, this.biases[i])
  }

  getGenotype():instance{
    let inst:instance = {biasesGenotype:[], weightsGenotype: [], fitness:0}
    for(let biasesofOneLayer of this.biases){
      for (let i:number = 0; i < biasesofOneLayer.length; i++){
        inst.biasesGenotype.push(biasesofOneLayer[i])
      }
    }
    for(let weigthsMatrixofOneLayer of this.weigths){
      for(let weigthsofaRow of weigthsMatrixofOneLayer){
        for (let i:number = 0; i < weigthsofaRow.length; i++){
          inst.weightsGenotype.push(weigthsofaRow[i])
        }
      }
    }
    return inst
  }

  setGenotype(inst:instance){
    let count = 0
    for(let biasesofOneLayer of this.biases){
      for (let i:number = 0; i < biasesofOneLayer.length; i++){
        biasesofOneLayer[i] = inst.biasesGenotype[count]
        count++
      }
    }
    count = 0
    for(let weigthsMatrixofOneLayer of this.weigths){
      for(let weigthsofaRow of weigthsMatrixofOneLayer){
        for (let i:number = 0; i < weigthsofaRow.length; i++){
          weigthsofaRow[i] = inst.weightsGenotype[count]
          count++
        }
      }
    }
  }

}


@Injectable({
  providedIn: 'root'
})


export class NeuralNetworkService {

  constructor() { }

  breedPopulation(population:instance[], breedingInfo:breedingInfo):instance[]{
    let selectionFunction:((population:instance[], breedingInfo:breedingInfo) => instance)
    switch(breedingInfo.selectionFunctionID){
      case "rouletteSelection": selectionFunction = this.rouletteSelection; break;
      case "tournamentSelection": selectionFunction = this.tournamentSelection; break;
      case "topXPercentSelecetion": selectionFunction = this.topXPercentSelecetion; break;

      default: throw Error(`breedingInfo.selectionFunctionID: "${breedingInfo.selectionFunctionID}" unknown`)
    }

    let numofInstances:number = population.length
    let sortedPopulation:instance[] = population.sort((a,b)=> a.fitness - b.fitness)
    let newPopulation:instance[] = []
    let idx:number = numofInstances - 1

    //Elitism
    let eliteSplitIdx:number = Math.max(0, Math.floor(numofInstances*(1-breedingInfo.elitismFraction)))
    for (idx; idx >= eliteSplitIdx && newPopulation.length < breedingInfo.goalPopulationSize; idx--){   
      newPopulation.push(this.copyInstance(sortedPopulation[idx]))
    }

    //New Random instances
    let RandomSplitIdx:number = Math.max(0, eliteSplitIdx - Math.ceil(numofInstances*(breedingInfo.randomFraction)))
    for (idx; idx >= RandomSplitIdx && newPopulation.length < breedingInfo.goalPopulationSize; idx--){
      newPopulation.push(this.getRandomInstance(sortedPopulation[idx]))
    }

    //CrossOver and Mutation
    let biasesGenotypeLength = population[0].biasesGenotype.length
    let weightsGenotypeLength = population[0].weightsGenotype.length
    while(newPopulation.length < breedingInfo.goalPopulationSize){
      let parent1:instance = selectionFunction(sortedPopulation, breedingInfo)   
      let parent2:instance = selectionFunction(sortedPopulation, breedingInfo)
     
      let child:instance = {weightsGenotype:[], biasesGenotype:[], fitness:0}
      
      // Crossover 

      // Biases
      let biasesSlicingIds:number[] = [0]
      let weightsSlicingIds:number[] = [0]
      if(Math.random() < breedingInfo.crossoverRate){
        biasesSlicingIds.push(...this.randArrayofSizeIntCostumRange(breedingInfo.crossoverPoints, 0, biasesGenotypeLength-1).sort((a,b)=> a-b))
        weightsSlicingIds.push(...this.randArrayofSizeIntCostumRange(breedingInfo.crossoverPoints, 0, weightsGenotypeLength-1).sort((a,b)=> a-b))
      }
      biasesSlicingIds.push(biasesGenotypeLength)
      weightsSlicingIds.push(weightsGenotypeLength)

      for (let i:number = 1; i < biasesSlicingIds.length; i++){
        if (i%2 == 1){        
          child.biasesGenotype.push(...parent1.biasesGenotype.slice(biasesSlicingIds[i-1],biasesSlicingIds[i]))
        }
        else{
          child.biasesGenotype.push(...parent2.biasesGenotype.slice(biasesSlicingIds[i-1],biasesSlicingIds[i]))
        }
      }

      // Weights    
      for (let i:number = 1; i < weightsSlicingIds.length; i++){
        if (i%2 == 1){        
          child.weightsGenotype.push(...parent1.weightsGenotype.slice(weightsSlicingIds[i-1],weightsSlicingIds[i]))
        }
        else{
          child.weightsGenotype.push(...parent2.weightsGenotype.slice(weightsSlicingIds[i-1],weightsSlicingIds[i]))
        }
      }  
      
      // Mutation
      if (Math.random() < breedingInfo.mutationRate){
        for (let i:number = 0; i < child.biasesGenotype.length; i++){
          if(Math.random() < breedingInfo.mutationRateperGeneBiases){
            child.biasesGenotype[i] += this.randFloatCostumRange(-breedingInfo.mutationMagnitudeBiases, breedingInfo.mutationMagnitudeBiases)
          }      
        }
        for (let i:number = 0; i < child.weightsGenotype.length; i++){
          if(Math.random() < breedingInfo.mutationRateperGeneWeights){
            child.weightsGenotype[i] += this.randFloatCostumRange(-breedingInfo.mutationMagnitudeWeights, breedingInfo.mutationMagnitudeWeights)
          }      
        }
      }
      newPopulation.push(child)
    }
    return newPopulation
  }

  rouletteSelection(sortedPopulation:instance[], breedingInfo:breedingInfo){
    let randomStopCount:number = Math.random() * breedingInfo.totalFitness
    let count:number = 0
    for (let instance of sortedPopulation){
      count += instance.fitness
      if (count > randomStopCount){
        return instance
      }
    }
    return sortedPopulation[sortedPopulation.length - 1]
  }

  tournamentSelection(sortedPopulation:instance[], breedingInfo:breedingInfo){
    let depth:number = breedingInfo.tournamentSelectionDepth
    if (depth < 1){throw Error ("tournamentSelection: depth smaller 1 is invalid")}
    let n:number = sortedPopulation.length
    let instanceIdx:number = Math.floor(Math.random()*(n))
    for (depth; depth > 0; depth--){
      let competitoridx:number = Math.floor(Math.random()*(n))
      instanceIdx = competitoridx > instanceIdx ? competitoridx : instanceIdx // possible because of sorted Population
    }
    return sortedPopulation[instanceIdx]
  }

  topXPercentSelecetion(sortedPopulation:instance[], breedingInfo:breedingInfo){
    let maxIdx:number = sortedPopulation.length - 1
    let lowerIdx:number = Math.max(0, Math.min(maxIdx, Math.floor(maxIdx*(100-breedingInfo.selectionTopXPercent)/100)))
    let randomTopXIdx:number = Math.floor(Math.random() * (maxIdx - lowerIdx + 1) + lowerIdx)
    return sortedPopulation[randomTopXIdx]
  } 



  copyInstance(instance:instance):instance{
    return {weightsGenotype:[...instance.weightsGenotype], 
      biasesGenotype:[...instance.biasesGenotype], 
      fitness:instance.fitness}
  }

  getRandomInstance(instance:instance):instance{
    return {weightsGenotype: instance.weightsGenotype.map(_ => Math.random() * 2 - 1), 
      biasesGenotype: instance.biasesGenotype.map(_ => Math.random() * 2 - 1), 
      fitness:0}
  }

  
  // Linear Algebra
  matDotvec(m:number[][], v:number[]){
    return [...Array(m.length)].map( (_,i) => this.dotProd(m[i],v))
  }

  dotProd(v1:number[], v2:number[]):number{
    if(v1.length != v2.length){throw Error("Function dotProd: vectors of unequal length are invalid")}
    let count:number = 0
    for(let i:number = 0; i < v1.length; i++){
      count += v1[i]*v2[i]
    }
    return count
  }

  addVectors(v1:number[], v2:number[]):number[]{
    if(v1.length != v2.length){throw Error("Function addVectors: vectors of unequal length are invalid")}
    return v1.map((x1, i) => x1 + v2[i])
  }

  
  // Math.random Functions
  randArrayofSize(length:number){return [...Array(length)].map(_ => Math.random() * 2 - 1)}
  randArrayofSizeIntCostumRange(length:number, min:number, max:number){
    return [...Array(length)].map(_ => Math.floor(Math.random() * (max - min + 1) + min))
  }
  randIntCostumRange(min:number, max:number):number{return Math.floor(Math.random() * (max - min + 1) + min)}
  randFloatCostumRange(min:number, max:number):number{return Math.random() * (max - min) + min}

  // Activation Functions for vectors
  softplus(v:number[]):number[]{return v.map(x => Math.log(1 + Math.exp(x)))}
  sigmoid(v:number[]):number[]{return v.map(x => 1/(1+Math.exp(-x)))}
  ReLU(v:number[]):number[]{return v.map(x => Math.max(x,0))}
  LeakyReLU(v:number[]):number[]{return v.map(x => Math.max(x,0.01*x))}
  tanh(v:number[]):number[]{return v.map(x => Math.tanh(x))}

}
