import { ui } from "../../ui/layaMaxUI";
import { dzapp } from "../../Main";
import { lanres } from "../landlords/confs/res";
import LanLobbyView from "../landlords/views/lanlobby";
import { szres } from "../sanzhang/define/szres";
import lanLobbyData from "../landlords/data/lanlobbydata";
import szlobbyview from "../sanzhang/views/szlobby";

export default class GamesView extends ui.games.globalview.gamesUI{
    constructor(){
        super();
        this.mServerList = new Array<any>();
        this.eventListen();
    }

    private mServerList:any = null;

    eventListen():void{
        dzapp.Events.Listen(1,"REGI",this,this.getRoomList);
    }

    onEnable():void{
        this.btnLan.on(Laya.Event.CLICK,this,this.openGame,[1]);
        this.btnSZ.on(Laya.Event.CLICK,this,this.openGame,[2]);
    }

    openGame(num:number):void{
        if(num==1){
            dzapp.Net.enterGame("query","ddz_free"); 
        }else{
            let lan:szlobbyview = new szlobbyview();
            dzapp.openGame(lan,szres.lobby);
        }
    }

    private getRoomList(data:Laya.Byte):void{ 
        lanLobbyData.instance.initServers(data);
        this.openDDZ();
    }


    openDDZ():void{
        let lan:LanLobbyView = new LanLobbyView();
        dzapp.openGame(lan,lanres.lobby); 
    }
}