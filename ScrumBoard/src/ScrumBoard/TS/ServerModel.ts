module ServerModel {
    export interface Entity {

        Id: number;
        ClientId?: number;
        Type?: string;
        ProcessOnServer?:boolean;

    }
    
   export class WaypointConnection {
        Waypoint1Id:number;
        Waypoint2Id:number;
    }
    
    export class CategoryJob {
        JobId: number;
        CategoryId: number;
        Category: Entity;
        Job:Entity;
    }

    export class WaypointTack {
        WaypointId: number;
        Index: number;
        TackId: number;
    }

    export class Crew {
        TackId:number;
        PersonId:number;
    }

    export class Context {
        Jobs: Entity[];
        Projects: Entity[];
        Categories: Entity[];
        Columns:Entity[];
    }

}