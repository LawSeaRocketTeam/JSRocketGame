import { ui } from "../../../ui/layaMaxUI";
import { dzapp } from "../../../Main";
//export module dzgames{ 
export default class szlobbyview extends ui.games.sanzhang_example.szlobbyUI{
    constructor(){
        super();
    }

    //public btnBack:Laya.Button;

    onEnable():void{
       // this.btnBack.on(Laya.Event.CLICK,this,this.gotoLobby); 
    }

    gotoLobby():void{
        dzapp.enterLobby();
    }
}
//}