import { dzapp } from "../../../Main";
import { ui } from "../../../ui/layaMaxUI";
import { lanres } from "../../../games/landlords/confs/res";
import LanLobbyView from "../../../games/landlords/views/lanlobby";
import GamesView from "../../../games/global/gamesview";

export default class LobbyView extends ui.dzgame.GameLobby.LobbyUI {
 
    constructor() {
        super();
        
    }

    onEnable():void{
        this.eventBind();
        this.eventListen();
    }

    private showGames():void{
        let games:GamesView = new GamesView();
        games.zOrder = 1;
        this.addChild(games);
    }

    private eventListen():void{
       
        dzapp.Events.Listen(1,"RELG",this,this.afterLogin);
    }

    private afterLogin(data:Laya.Byte):void{
        dzapp.Logger.info("login callback.");
        let statu:number = data.getUint16();
    }

    private eventBind():void{
        this.btnDDZ && this.btnDDZ.on(Laya.Event.CLICK,this,this.onClick);
        this.btnLogin&&this.btnLogin.on(Laya.Event.CLICK,this,this.onLogin);
    }

    public btnDDZ:Laya.Button;
    public btnRoom:Laya.Button;
    public btnLogin:Laya.Button; 

    createChildren():void{
        super.createChildren();
        this.showGames();
        //Laya.loader.load("GameLobby/Lobby.scene");
    }

    onLogin():void{
        //dzapp.Net.LoginToGC("111","11",0)
        //dzapp.showToast("on click the login button.");
        dzapp.openGame(new LanLobbyView(),lanres.lobby);
       // dzapp.openGame("LanLobby",lanres.lobby);
    }

    onClick():void{
        dzapp.Net.enterGame("query","ddz_free");
    }
 
 
}