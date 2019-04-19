export default class lanLobbyData{
    constructor(){
        this.mServerList = new Array<any>(); 
    }

    private static mInstance:lanLobbyData=null;

    private mServerList:any = null;

    public static get instance(){
        if(lanLobbyData.mInstance==null){
            lanLobbyData.mInstance = new lanLobbyData();
        }
        return lanLobbyData.mInstance;
    }

    public getServers():Array<any>{
        return this.mServerList;
    }

    public initServers(data:Laya.Byte):void{
        let groupid = ""; 
        this.mServerList.length=0;
        let name = data.getUTFString();
        while((groupid = data.getUTFString()) != ""&&data.pos<data.length)
        {
            let item: Object = {};
            item["groupid"]         = groupid;
            item["groupname"]       = data.getUTFString();
            item["gamepeilv"]       = data.getInt32();
            item["ip"]              = data.getUTFString();
            item["port"]            = data.getInt32();
            item["curronline"]      = data.getInt32();
            item["maxonline"]       = data.getInt32();
            item["isguildroom"]     = data.getInt32();
            item["istourroom"]      = data.getInt32();
            item["at_least_gold"]   = data.getInt32();
            item["at_most_gold"]    = data.getInt32();
            item["ishighroom"]      = data.getInt32();
            item["ishuanle"]        = data.getInt32();
            item["nocheat"]         = data.getInt32();
            item["choushui"]        = data.getInt32();
            item["name"]            = name;
            this.mServerList.push(item);
        } 
    }

}