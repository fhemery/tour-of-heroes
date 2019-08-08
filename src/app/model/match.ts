import { Hero } from "../hero";

export class Match {
    public id: number; 
    public roundId: number;
    public opponent1: Hero;
    public opponent2: Hero;
    public isReady: boolean = false;

    public winner: Hero;
}