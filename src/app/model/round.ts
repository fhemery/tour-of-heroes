import { Match } from "./match";

export class Round {
    public id: number;
    public matches: Match[];

    public constructor(){
        this.matches = [];
    }
}