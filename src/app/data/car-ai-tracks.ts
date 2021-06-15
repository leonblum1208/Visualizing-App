import { CollisionDetectionService, point, track, vector, edge, circlePart, carStats, trackConstructionPlanObject} from '../services/AI/collision-detection.service';
import { fitnessFunctionInfo, networkPlan,  FFneuralnetwork, NeuralNetworkService, breedingInfo, instance, aICarConstructionPlan, SensorConstructionPlan} from '../services/AI/neural-network.service';


export const PIXEL_PER_METER:number = 10 //px/m
export const GRID_CELL_DIM:number = 30;//px 30 seems to be optimal for start of track01

export const GAME_WIDTH:number = 192;//m
export const GAME_HEIGTH:number = 90;//m
export const START_ANGLE:number = 0; //Rad

export const SELECTED_TRACK_ID:number = 1
export const MAX_LAPS:number = 3

//AI
export const POPULATION_SIZE:number = 100;
export const ACTIVATION_FUNCTION_ID:string = "ReLU";
export const TIME_CAP_PER_GENERATION:number = 100000;
export const SPEED_UP_FACTOR:number = 1
export const HIDDEN_LAYER_SIZES:number[] = [12,6]; // 

export const BREEDING_INFO:breedingInfo = {
    goalPopulationSize : POPULATION_SIZE,
    totalFitness : 0,

    selectionFunctionID : "tournamentSelection", // topXPercentSelecetion  tournamentSelection  rouletteSelection
    tournamentSelectionDepth : 30,
    selectionTopXPercent: 20,

    crossoverRate : 0.5,
    crossoverPoints : 3,

    mutationRate : 1,
    mutationRateperGeneBiases:0.1, //[0,1]
    mutationRateperGeneWeights:0.1, //[0,1]
    mutationMagnitudeBiases:0.2, //[0,1]
    mutationMagnitudeWeights:0.2, //[0,1]

    elitismFraction: 0.05,
    randomFraction : 0.1,
}

export const FITNESS_FUNCTION_INFO:fitnessFunctionInfo = {
    collisionPunishmentFactor: 0,
    energyConsumptionFactor: 0,
    tractionControlFactor: 0,
    jerkFactor: 0,
    uncomfAccelerationFactor: 0,
    trackCompletionFactor: 100,
    trackpertime: 0,
    optimalFrictionFactor: 0,
}


export const DIST_SENSORS:SensorConstructionPlan[] = [
    {relPositionCarFrameCode:[0,1,1,0], relativeAngle:0},
    {relPositionCarFrameCode:[0,1,0,0], relativeAngle:-Math.PI/4},
    {relPositionCarFrameCode:[0,0,1,0], relativeAngle:+Math.PI/4},
    {relPositionCarFrameCode:[0,1,0,0], relativeAngle:-Math.PI/2},
    {relPositionCarFrameCode:[0,0,1,0], relativeAngle:+Math.PI/2},
]

export const CAR_STATS:carStats = {
    enginePower: 600, // kw
    engineEfficiency:0.9,
    engineTorque:450, //Nm
    enginetoTyreRatio:10, 
    drivetrainEfficiency:0.95,
    tyreRadius: 0.3,
    tyreFrictionCoefficient: 1,
    rollingResistanceCoefficient: 0.012 ,
    skewStiffnessCoefficientV: 50000 ,
    skewStiffnessCoefficientH: 55000 ,
    dragCoefficient: 1,
    liftCoefficient: 4,
    frontSurface: 1.8,
    l_v_dividedBy_l_h: 1,
    centerofGravityHeigth: 0.2,
    length:3.5,
    width:1.6,
    weight:800,
    MaxsteeringAngle:45,
    uncomfAcceleration:2,
  }

export const AI_CAR_CONSTRUCTION_PLAN:aICarConstructionPlan ={
    distSensors:DIST_SENSORS,
    giveSensors:true,
    givePosition:false,
    giveVelocity:true,
    giveAcceleration:false,
    giveZentripetalAcceleration:false,
    mergeThrottleandBreak:true,
    networkPlan:{ 
        hiddenLayerSizes:HIDDEN_LAYER_SIZES,
        activationFunctionId:ACTIVATION_FUNCTION_ID,
        inputs:0,
        outputs:0,
    },
}

AI_CAR_CONSTRUCTION_PLAN.networkPlan.inputs = 0
AI_CAR_CONSTRUCTION_PLAN.networkPlan.inputs +=  AI_CAR_CONSTRUCTION_PLAN.distSensors.length
AI_CAR_CONSTRUCTION_PLAN.networkPlan.inputs +=  AI_CAR_CONSTRUCTION_PLAN.giveVelocity ? 1 : 0
AI_CAR_CONSTRUCTION_PLAN.networkPlan.inputs +=  AI_CAR_CONSTRUCTION_PLAN.giveAcceleration ? 1 : 0
AI_CAR_CONSTRUCTION_PLAN.networkPlan.inputs +=  AI_CAR_CONSTRUCTION_PLAN.giveZentripetalAcceleration ? 1 : 0

AI_CAR_CONSTRUCTION_PLAN.networkPlan.outputs = AI_CAR_CONSTRUCTION_PLAN.mergeThrottleandBreak ? 2 : 3



export const FRAME:trackConstructionPlanObject[] = [ //m
        {id:"Jump", p: {x: -1, y: 0}},
        {id:"Jump", p: {x: 0, y: 0}},
        {id:"Line", p: {x: GAME_WIDTH, y: 0}},
        {id:"Line", p: {x: GAME_WIDTH, y: GAME_HEIGTH}},
        {id:"Line", p: {x: 0, y: GAME_HEIGTH}},
        {id:"Line", p: {x: 0, y: 0}},     
        {id:"Checkpoint", p: {x: 0, y: 45}},   
        {id:"Checkpoint", p: {x: 192, y: 45}},   
];

export const ai_buster:trackConstructionPlanObject[] = [ //m
    {id:"Jump", p: {x: 0, y: 1}},
    {id:"Jump", p: {x: 1, y: 1}},
    {id:"Line", p: {x: 41, y: 1}},
    {id:"Circle", p: {x: 56, y: 16}},
    {id:"Line", p: {x: 56, y: 26}},
    {id:"Circle", p: {x: 80, y: 26}},
    {id:"Line", p: {x: 80, y: 1}},
    {id:"Line", p: {x: 191, y: 1}},
    {id:"Line", p: {x: 191, y: 21}},
    {id:"Line", p: {x: 100, y: 21}},

    {id:"Jump", p: {x: 181, y: 11}},
    {id:"Line", p: {x: 97, y: 11}},
    {id:"Line", p: {x: 90, y: 18}},
    {id:"Line", p: {x: 90, y: 26}},
    {id:"Circle", p: {x: 46, y: 26}},
    {id:"Line", p: {x: 46, y: 16}},
    {id:"Circle", p: {x: 41, y: 11}},
    {id:"Line", p: {x: 10, y: 11}},

    {id:"Jump", p: {x: 191, y: 21}},
    {id:"Line", p: {x: 191, y: 89}},
    {id:"Line", p: {x: 130, y: 89}},
    {id:"Line", p: {x: 130, y: 47}},
    {id:"Jump", p: {x: 160, y: 47}},
    {id:"Line", p: {x: 100, y: 47}},

    {id:"Jump", p: {x: 90, y: 26}},
    {id:"Line", p: {x: 97, y: 33}},
    {id:"Line", p: {x: 175, y: 33}},
    {id:"Line", p: {x: 175, y: 74}},
    {id:"Line", p: {x: 145, y: 74}},
    {id:"Line", p: {x: 145, y: 61}},
    {id:"Line", p: {x: 160, y: 61}},
    {id:"Circle", p: {x: 160, y: 33}},

    {id:"Jump", p: {x: 100, y: 33}},
    {id:"Circle", p: {x: 100, y: 61}},
    {id:"Line", p: {x: 115, y: 61}},
    {id:"Line", p: {x: 115, y: 74}},
    {id:"Line", p: {x: 105, y: 64}},
    {id:"Line", p: {x: 50, y: 64}},
    {id:"Line", p: {x: 20, y: 74}},
    {id:"Line", p: {x: 15, y: 74}},
    {id:"Line", p: {x: 15, y: 43}},
    {id:"Circle", p: {x: 27, y: 52}},

    {id:"Line", p: {x: 20, y: 54}},
    {id:"Line", p: {x: 20, y: 74}},
  
    {id:"Jump", p: {x: 98, y: 89}},
    {id:"Line", p: {x: 98, y: 70}},

    {id:"Jump", p: {x: 79, y: 64}},
    {id:"Line", p: {x: 79, y: 86}},

    {id:"Jump", p: {x: 60, y: 89}},
    {id:"Line", p: {x: 60, y: 70}},

    {id:"Jump", p: {x: 130, y: 89}},
    {id:"Line", p: {x: 50, y: 89}},
    {id:"Line", p: {x: 20, y: 79}},
    {id:"Line", p: {x: 1, y: 79}},
    {id:"Line", p: {x: 1, y: 40}},
    {id:"Circle", p: {x: 28, y: 56}},
    {id:"Line", p: {x: 25, y: 64}},
    {id:"Line", p: {x: 37, y: 60}},
    {id:"Line", p: {x: 37, y: 50}},
    {id:"Line", p: {x: 42, y: 50}},
    {id:"Line", p: {x: 42, y: 40}},
    {id:"Line", p: {x: 37.38, y: 40}},


    {id:"Jump", p: {x: 1, y: 1}},
    {id:"Line", p: {x: 1, y: 21.8}},
    {id:"Line", p: {x: 20, y: 21.8}},

    {id:"Jump", p: {x: 51, y: 64}},
    {id:"Line", p: {x: 51, y: 50}},
    {id:"Line", p: {x: 46, y: 50}},
    {id:"Line", p: {x: 46, y: 26}},
    {id:"Line", p: {x: 42, y: 20}},
    {id:"Line", p: {x: 34, y: 23}},
    {id:"Line", p: {x: 34, y: 11}},

    {id:"Jump", p: {x: 1, y: 53}},
    {id:"Line", p: {x: 7, y: 60}},

    {id:"Jump", p: {x: 15, y: 63}},
    {id:"Line", p: {x: 8, y: 70}},

    {id:"Jump", p: {x: 15, y: 43}},
    {id:"Line", p: {x: 8, y: 50}},

  

    {id:"Checkpoint", p: {x: 6, y: 6}},   
    {id:"Checkpoint", p: {x: 41, y: 6}},   
    {id:"Checkpoint", p: {x: 51, y: 16}},   
    {id:"Checkpoint", p: {x: 51, y: 26}},   
    {id:"Checkpoint", p: {x: 55, y: 38}},   
    {id:"Checkpoint", p: {x: 68, y: 43}},   
    {id:"Checkpoint", p: {x: 81, y: 38}},   
    {id:"Checkpoint", p: {x: 85, y: 26}},   
    {id:"Checkpoint", p: {x: 85, y: 17}},     
    {id:"Checkpoint", p: {x: 97, y: 7}},   
    {id:"Checkpoint", p: {x: 183, y: 7}},     
    {id:"Checkpoint", p: {x: 183, y: 15}},
    {id:"Checkpoint", p: {x: 98, y: 15}},   
    {id:"Checkpoint", p: {x: 95, y: 18}},   
    {id:"Checkpoint", p: {x: 95, y: 24}},   
    {id:"Checkpoint", p: {x: 98, y: 27}},   
    {id:"Checkpoint", p: {x: 183, y: 27}},   
    {id:"Checkpoint", p: {x: 183, y: 81.5}},   
    {id:"Checkpoint", p: {x: 137.5, y: 81.5}},   
    {id:"Checkpoint", p: {x: 137.5, y: 55}},   
    {id:"Checkpoint", p: {x: 160, y: 55}},   
    {id:"Checkpoint", p: {x: 167, y: 47}},   
    {id:"Checkpoint", p: {x: 160, y: 39}},   
    {id:"Checkpoint", p: {x: 100, y: 39}},  
    {id:"Checkpoint", p: {x: 93, y: 47}},   
    {id:"Checkpoint", p: {x: 100, y: 55}},   
    {id:"Checkpoint", p: {x: 122.5, y: 55}},   
    {id:"Checkpoint", p: {x: 122.5, y: 81.5}},   
    {id:"Checkpoint", p: {x: 109, y: 81.5}},   
    {id:"Checkpoint", p: {x: 98, y: 69}},   
    {id:"Checkpoint", p: {x: 79, y: 87}},   
    {id:"Checkpoint", p: {x: 60, y: 69}},   
    {id:"Checkpoint", p: {x: 20, y: 77}},   
    {id:"Checkpoint", p: {x: 13, y: 77}},  
    {id:"Checkpoint", p: {x: 13, y: 67}},  

    {id:"Checkpoint", p: {x: 7, y: 71}},   
    {id:"Checkpoint", p: {x: 3, y: 58}},   
    {id:"Checkpoint", p: {x: 8, y: 61}},   
    {id:"Checkpoint", p: {x: 13, y: 47}},   
    {id:"Checkpoint", p: {x: 7, y: 51}},   

    {id:"Checkpoint", p: {x: 11, y: 29}},   
    {id:"Checkpoint", p: {x: 21, y: 26}},   
    {id:"Checkpoint", p: {x: 32, y: 32}},   
    {id:"Checkpoint", p: {x: 35, y: 40}},   
    {id:"Checkpoint", p: {x: 32, y: 50}},   
    {id:"Checkpoint", p: {x: 24, y: 58}},   
    {id:"Checkpoint", p: {x: 22, y: 70}},   
    {id:"Checkpoint", p: {x: 42.5, y: 61}},    
    {id:"Checkpoint", p: {x: 42.5, y: 40}},   
    {id:"Checkpoint", p: {x: 41, y: 29}},    
    {id:"Checkpoint", p: {x: 31, y: 17}},   
    {id:"Checkpoint", p: {x: 6, y: 16}},   
    {id:"Checkpoint", p: {x: 6, y: 6}},   
];

export const diagonals:trackConstructionPlanObject[] = [ //m
    {id:"Jump", p: {x: 1, y: 32}},
    {id:"Jump", p: {x: 1, y: 31}},
    {id:"Circle", p: {x: 36, y: 1.5}},
    {id:"Line", p: {x: 81, y: 11}},
    {id:"Line", p: {x: 131, y: 1}},
    {id:"Line", p: {x: 166, y: 1}},
    {id:"Circle", p: {x: 166, y: 51}},
    {id:"Line", p: {x: 165, y: 51}},
    {id:"Circle", p: {x: 162, y: 59}},
    {id:"Line", p: {x: 179, y: 76}},
    {id:"Circle", p: {x: 173, y: 89}},

    {id:"Line", p: {x: 161, y: 89}},
    {id:"Line", p: {x: 131, y: 71}},
    {id:"Line", p: {x: 101, y: 87}},
    {id:"Circle", p: {x: 86, y: 60}},
    {id:"Line", p: {x: 152, y: 29}},
    {id:"Line", p: {x: 149.3, y: 26}},
    {id:"Line", p: {x: 81, y: 57}},
    {id:"Line", p: {x: 72, y: 89}},
    {id:"Line", p: {x: 1, y: 89}},
    {id:"Line", p: {x: 1, y: 74}},
    {id:"Line", p: {x: 117, y: 21}},
    {id:"Line", p: {x: 1, y: 69}},
    {id:"Line", p: {x: 1, y: 31}},

    {id:"Jump", p: {x: 81, y: 13.5}},
    {id:"Line", p: {x: 131, y: 8}},
    {id:"Line", p: {x: 166, y: 11}},
    {id:"Circle", p: {x: 166, y: 36}},
    {id:"Line", p: {x: 165, y: 36}},
    {id:"Circle", p: {x: 153, y: 62}},
    {id:"Line", p: {x: 166, y: 78}},
    {id:"Line", p: {x: 131, y: 61}},
    {id:"Line", p: {x: 94, y: 73}},

    {id:"Line", p: {x: 173, y: 25}},

    {id:"Line", p: {x: 155, y: 12}},
    
    {id:"Line", p: {x: 13, y: 80}},   
    {id:"Line", p: {x: 64, y: 80}}, 
    {id:"Line", p: {x: 71.7, y: 51.9}},

    {id:"Jump", p: {x: 124.5, y: 26.6}},
    {id:"Circle", p: {x: 118, y: 10.5}},
    {id:"Line", p: {x: 10, y: 56}},
    {id:"Line", p: {x: 7, y: 28}},
    {id:"Line", p: {x: 12, y: 14}},
    {id:"Line", p: {x: 21, y: 6}},
    {id:"Line", p: {x: 33, y: 4}},
    {id:"Line", p: {x: 81, y: 13.5}},

    {id:"Checkpoint", p: {x: 131, y: 2}},   
    {id:"Checkpoint", p: {x: 169, y: 6}},   
    {id:"Checkpoint", p: {x: 182, y: 15}},   
    {id:"Checkpoint", p: {x: 183, y: 31}},   
    {id:"Checkpoint", p: {x: 173, y: 42}},   
    {id:"Checkpoint", p: {x: 159, y: 45}},   
    {id:"Checkpoint", p: {x: 156, y: 58}},   
    {id:"Checkpoint", p: {x: 174, y: 82}},   
    {id:"Checkpoint", p: {x: 163, y: 83}},   
    {id:"Checkpoint", p: {x: 131, y: 67}},    
    {id:"Checkpoint", p: {x: 93, y: 81}},   
    {id:"Checkpoint", p: {x: 85, y: 69}},   
    {id:"Checkpoint", p: {x: 164, y: 26}},   
    {id:"Checkpoint", p: {x: 152, y: 19}},   
    {id:"Checkpoint", p: {x: 77, y: 54}},   
    {id:"Checkpoint", p: {x: 68, y: 84}},   
    {id:"Checkpoint", p: {x: 8, y: 84}},   
    {id:"Checkpoint", p: {x: 8, y: 76}},   
    {id:"Checkpoint", p: {x: 123, y: 22}},   
    {id:"Checkpoint", p: {x: 123, y: 16}},   
    {id:"Checkpoint", p: {x: 115, y: 17}},   
    {id:"Checkpoint", p: {x: 7, y: 61}},   
    {id:"Checkpoint", p: {x: 4, y: 28}},   
    {id:"Checkpoint", p: {x: 10, y: 13}},   
    {id:"Checkpoint", p: {x: 20.7, y: 4.5}},   
    {id:"Checkpoint", p: {x: 33, y: 2.5}},   
    {id:"Checkpoint", p: {x: 81, y: 12}},   
    {id:"Checkpoint", p: {x: 131, y: 2}},
];

export const snake:trackConstructionPlanObject[] = [ //m
    {id:"Jump", p: {x: 0, y: 1}},
    {id:"Jump", p: {x: 1, y: 1}},
    {id:"Line", p: {x: 20, y: 1}},
    {id:"Circle", p: {x: 40, y: 21}},
    {id:"Line", p: {x: 40, y: 31}},
    {id:"Circle", p: {x: 60, y: 31}},
    {id:"Line", p: {x: 60, y: 21}},
    {id:"Circle", p: {x: 100, y: 21}},
    {id:"Line", p: {x: 100, y: 31}},
    {id:"Circle", p: {x: 120, y: 31}},
    {id:"Line", p: {x: 120, y: 21}},
    {id:"Circle", p: {x: 160, y: 21}},
    {id:"Line", p: {x: 160, y: 31}},
    {id:"Circle", p: {x: 170, y: 31}},
    {id:"Line", p: {x: 170, y: 21}},
    {id:"Circle", p: {x: 190, y: 21}},
    {id:"Line", p: {x: 190, y: 60}},
    {id:"Circle", p: {x: 170, y: 80}},
    {id:"Line", p: {x: 140, y: 89}},
    {id:"Line", p: {x: 51, y: 89}},
    {id:"Line", p: {x: 22, y: 80}},
    {id:"Line", p: {x: 21, y: 80}},
    {id:"Circle", p: {x: 1, y: 60}},
    {id:"Line", p: {x: 1, y: 1}},


    {id:"Jump", p: {x: 11, y: 11}},
    {id:"Line", p: {x: 20, y: 11}},
    {id:"Circle", p: {x: 30, y: 21}},
    {id:"Line", p: {x: 30, y: 31}},
    {id:"Circle", p: {x: 70, y: 31}},
    {id:"Line", p: {x: 70, y: 21}},
    {id:"Circle", p: {x: 90, y: 21}},
    {id:"Line", p: {x: 90, y: 31}},
    {id:"Circle", p: {x: 130, y: 31}},
    {id:"Line", p: {x: 130, y: 21}},
    {id:"Circle", p: {x: 150, y: 21}},
    {id:"Line", p: {x: 150, y: 31}},
    {id:"Circle", p: {x: 180, y: 31}},
    {id:"Line", p: {x: 180, y: 21}},
    {id:"Line", p: {x: 180, y: 60}},
    {id:"Circle", p: {x: 170, y: 70}},
    {id:"Line", p: {x: 140, y: 61}},
    {id:"Line", p: {x: 51, y: 61}},
    {id:"Line", p: {x: 22, y: 70}},
    {id:"Line", p: {x: 21, y: 70}},
    {id:"Circle", p: {x: 11, y: 60}},
    {id:"Line", p: {x: 11, y: 11}},

    {id:"Jump", p: {x: 140, y: 68}},
    {id:"Jump", p: {x: 141, y: 68}},
    {id:"Circle", p: {x: 141, y: 82}},

    {id:"Jump", p: {x: 120, y: 65}},
    {id:"Jump", p: {x: 121, y: 65}},
    {id:"Circle", p: {x: 121, y: 73}},
    {id:"Jump", p: {x: 120, y: 77}},
    {id:"Jump", p: {x: 121, y: 77}},
    {id:"Circle", p: {x: 121, y: 85}},

    {id:"Jump", p: {x: 104, y: 61}},
    {id:"Line", p: {x: 104, y: 71}},
    {id:"Jump", p: {x: 104, y: 89}},
    {id:"Line", p: {x: 104, y: 79}},



    {id:"Jump", p: {x: 80, y: 68}},
    {id:"Jump", p: {x: 81, y: 68}},
    {id:"Circle", p: {x: 81, y: 82}},

    {id:"Jump", p: {x: 60, y: 65}},
    {id:"Jump", p: {x: 61, y: 65}},
    {id:"Circle", p: {x: 61, y: 73}},
    {id:"Jump", p: {x: 60, y: 77}},
    {id:"Jump", p: {x: 61, y: 77}},
    {id:"Circle", p: {x: 61, y: 85}},

    {id:"Jump", p: {x: 40, y: 68}},
    {id:"Jump", p: {x: 41, y: 68}},
    {id:"Circle", p: {x: 41, y: 82}},


    {id:"Checkpoint", p: {x: 6, y: 6}},   
    {id:"Checkpoint", p: {x: 20, y: 6}}, 
    {id:"Checkpoint", p: {x: 35, y: 21}}, 
    {id:"Checkpoint", p: {x: 35, y: 31}}, 
    {id:"Checkpoint", p: {x: 50, y: 46}}, 
    {id:"Checkpoint", p: {x: 65, y: 31}}, 
    {id:"Checkpoint", p: {x: 65, y: 21}},
    {id:"Checkpoint", p: {x: 80, y: 6}}, 
    {id:"Checkpoint", p: {x: 95, y: 21}}, 
    {id:"Checkpoint", p: {x: 95, y: 31}}, 
    {id:"Checkpoint", p: {x: 110, y: 46}}, 
    {id:"Checkpoint", p: {x: 125, y: 31}}, 
    {id:"Checkpoint", p: {x: 125, y: 21}},
    {id:"Checkpoint", p: {x: 140, y: 6}}, 
    {id:"Checkpoint", p: {x: 155, y: 21}}, 
    {id:"Checkpoint", p: {x: 155, y: 31}}, 
    {id:"Checkpoint", p: {x: 165, y: 41}}, 
    {id:"Checkpoint", p: {x: 175, y: 31}}, 
    {id:"Checkpoint", p: {x: 175, y: 21}}, 
    {id:"Checkpoint", p: {x: 180, y: 16}}, 
    {id:"Checkpoint", p: {x: 185, y: 21}}, 
    {id:"Checkpoint", p: {x: 185, y: 60}}, 
    {id:"Checkpoint", p: {x: 170, y: 75}}, 
    {id:"Checkpoint", p: {x: 21, y: 75}}, 
    {id:"Checkpoint", p: {x: 6, y: 60}}, 
    {id:"Checkpoint", p: {x: 6, y: 6}},   
];

export const threeUTurns:trackConstructionPlanObject[] = [
    {id:"Jump", p: {x: 1, y: 1}},
    {id:"Jump", p: {x: 45, y: 5}},
    {id:"Line", p: {x: 147, y: 5}},
    {id:"Circle", p: {x: 147, y: 85}},
    {id:"Line", p: {x: 140, y: 85}},
    {id:"Circle", p: {x: 110, y: 55}},
    {id:"Line", p: {x: 110, y: 50}},
    {id:"Circle", p: {x: 82, y: 50}},
    {id:"Line", p: {x: 82, y: 55}},
    {id:"Circle", p: {x: 52, y: 85}},
    {id:"Line", p: {x: 45, y: 85}},
    {id:"Circle", p: {x: 45, y: 5}},

    {id:"Jump", p: {x: 45, y: 20}},
    {id:"Line", p: {x: 147, y: 20}},
    {id:"Circle", p: {x: 147, y: 70}},
    {id:"Line", p: {x: 140, y: 70}},
    {id:"Circle", p: {x: 125, y: 55}},
    {id:"Line", p: {x: 125, y: 50}},
    {id:"Circle", p: {x: 67, y: 50}},
    {id:"Line", p: {x: 67, y: 55}},
    {id:"Circle", p: {x: 52, y: 70}},
    {id:"Line", p: {x: 45, y: 70}},
    {id:"Circle", p: {x: 45, y: 20}},

    {id:"Checkpoint", p: {x: 96, y: 12.5}}, 
    {id:"Checkpoint", p: {x: 147, y: 12.5}}, 
    {id:"Checkpoint", p: {x: 170, y: 22}}, 
    {id:"Checkpoint", p: {x: 179.5, y: 45}},  
    {id:"Checkpoint", p: {x: 170, y: 68}}, 
    {id:"Checkpoint", p: {x: 147, y: 77.5}},  
    {id:"Checkpoint", p: {x: 125, y: 72}}, 
    {id:"Checkpoint", p: {x: 117.5, y: 50}}, 
    {id:"Checkpoint", p: {x: 111, y: 34}},   
    {id:"Checkpoint", p: {x: 96, y: 28.5}},  
    {id:"Checkpoint", p: {x: 81, y: 34}},  
    {id:"Checkpoint", p: {x: 74.5, y: 50}},   
    {id:"Checkpoint", p: {x: 67, y: 72}}, 
    {id:"Checkpoint", p: {x: 45, y: 77.5}}, 
    {id:"Checkpoint", p: {x: 22, y: 68}}, 
    {id:"Checkpoint", p: {x: 12.5, y: 45}},   
    {id:"Checkpoint", p: {x: 22, y: 22}}, 
    {id:"Checkpoint", p: {x: 45, y: 12.5}},  
    {id:"Checkpoint", p: {x: 96, y: 12.5}},  
];

export const oval:trackConstructionPlanObject[] = [
    {id:"Jump", p: {x: 1, y: 1}},
    {id:"Jump", p: {x: 45, y: 5}},
    {id:"Line", p: {x: 147, y: 5}},
    {id:"Circle", p: {x: 147, y: 85}},
    {id:"Line", p: {x: 45, y: 85}},
    {id:"Circle", p: {x: 45, y: 5}},

    {id:"Jump", p: {x: 45, y: 20}},
    {id:"Line", p: {x: 147, y: 20}},
    {id:"Circle", p: {x: 147, y: 70}},
    {id:"Line", p: {x: 45, y: 70}},
    {id:"Circle", p: {x: 45, y: 20}},

    {id:"Checkpoint", p: {x: 96, y: 12.5}}, 
    {id:"Checkpoint", p: {x: 147, y: 12.5}}, 
    {id:"Checkpoint", p: {x: 170, y: 22}}, 
    {id:"Checkpoint", p: {x: 179.5, y: 45}},  
    {id:"Checkpoint", p: {x: 170, y: 68}}, 
    {id:"Checkpoint", p: {x: 147, y: 77.5}},    
    {id:"Checkpoint", p: {x: 45, y: 77.5}}, 
    {id:"Checkpoint", p: {x: 22, y: 68}}, 
    {id:"Checkpoint", p: {x: 12.5, y: 45}},   
    {id:"Checkpoint", p: {x: 22, y: 22}}, 
    {id:"Checkpoint", p: {x: 45, y: 12.5}},  
    {id:"Checkpoint", p: {x: 96, y: 12.5}},  
]



export const TRACKS:track[] = [
    {
        id:"oval",
        viewValue:"Oval [very Easy]",
        constructionPlan:oval,
        startPosition:{x:100,y:12.5},
    },
    {
        id:"threeUTurns",
        viewValue:"Three U-Turns [Easy]",
        constructionPlan:threeUTurns,
        startPosition:{x:100,y:12.5},
    },
    {
        id:"snake",
        viewValue:"Snake [Medium]",
        constructionPlan:snake,
        startPosition:{x:14,y:6},
    },
    {
        id:"diagonals",
        viewValue:"Skewed [Hard]",
        constructionPlan:diagonals,
        startPosition:{x:133,y:4.5},
    },
    {
        id:"ai_buster",
        viewValue:"AI-Buster [very Hard]",
        constructionPlan:ai_buster,
        startPosition:{x:12,y:6},
    },
    {
        id:"frame",
        viewValue:"Only Frame",
        constructionPlan:FRAME,
        startPosition:{x:5,y:45},
    },
 
    
]

