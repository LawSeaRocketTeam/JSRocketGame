/** 
配置加载管理器，用来管理加载JSON配置文件并统一保存数据的管理工具
author by：jackson
**/

export default class ConfigControl extends Laya.Script{
    // /** @prop {name:folder,tips:"配置文件所在的文件夹",type:string}*/
    constructor(){
        super();
        ConfigControl.instance = this;
        this.configList = []
        this.folder = "config"
        this.json_data = []
        Laya.loader.load(this.folder + "/configList.json",Laya.Handler.create(this,this.onConfigLoad),null,Laya.Loader.JSON);
    }

    onConfigLoad(){
        var config = Laya.loader.getRes(this.folder + "/configList.json");
        var arr = config["children"]
        for(var i = 0;i < arr.length;i++){
            this.configList.push(this.folder + "/" + arr[i]["fileName"] + ".json")
        }
        Laya.loader.load(this.configList,Laya.Handler.create(this,this.onLoadConfigCompleted),null,Laya.loader.JSON);
    }

    onLoadConfigCompleted(){
        for(var i = 0;i < this.configList.length;i++){
            var json_arr = Laya.loader.getRes(this.configList[i])
            if(typeof json_arr!="undefined"){
                //提取文件名字
                var name = this.configList[i];
                var lastIdx = name.indexOf(".");
                var name = name.substring(7,lastIdx);
                this.json_data[name] = json_arr
                //自己已经保存了，就清楚一下系统保存的
                Laya.loader.clearRes(this.configList[i]);
            }
        } 
    }

    //根据JSON文件文字获取相关数据
    GetJsonDataByFileName(_fileName){
        return this.json_data[_fileName];
    }
}

//工厂模式，获取单例
ConfigControl.getInstance = function(){
    if(ConfigControl.instance == null || typeof ConfigControl.instance == "undefined")
    {
        new ConfigControl();
    }
    return ConfigControl.instance;
}