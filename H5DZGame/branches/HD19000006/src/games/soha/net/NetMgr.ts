import NetCmdDef from "../confs/NetCmdDef";
import { dzapp } from "../../../Main";

export class NetMgr{

    private static mInstance:NetMgr=null;

    constructor(){
        
    }

    public static get instance(){
        if(NetMgr.mInstance==null){
            NetMgr.mInstance = new NetMgr();
        }
        return NetMgr.mInstance;
    }

    private regAllCmd(){
        // dzapp.mEvents.Listen(0, NetCmdDef.SITDOWN, ui, this.onRecvSitDown);
    }

    private onRecvSitDown(byte:Laya.Byte){

    }

}