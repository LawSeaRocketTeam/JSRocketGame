import { dzapp } from "../../../Main";

export default class LobbyData{
    private constructor(){
        this.eventListen();
        this.start();
    }

    private static _instant:LobbyData = null;

    public static get Instant(){
        return this._instant;
    }

    public static init():void{
        this._instant = this.Instant || new LobbyData();
    }

    eventListen():void{
        
    }

    private start():void{
        dzapp.enterLobby();
    }
}