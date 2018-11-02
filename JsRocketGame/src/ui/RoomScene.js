import LoginScene from "./LoginScene";
import ConfigMgr from "../mgr/ConfigMgr"

//关卡选择界面
//create by jackson

export default class RoomScene extends Laya.Scene {
    constructor(){
        super();
        RoomScene.instance = this;
        this.arr = []
        this.loadScene("Room.scene")
    }

    onEnable() {
        this.bt_back.on(Laya.Event.CLICK,this,this.onBackClick);
        this.initGuanQia();
    }

    onBackClick(e){
        this.removeSelf();
        RoomScene.loginScene = new LoginScene();
        Laya.stage.addChild(RoomScene.loginScene);
    }

    //初始化关卡信息
    initGuanQia(){
        var roomData = ConfigMgr.getInstance().GetJsonDataByFileName("room");
        if(typeof roomData!="undefined")
        {
            var a = 1;
        }
        // for(var i = 1; i <= 30; i++){
        //     var isOpen = false
        //     if(i < 5){
        //         isOpen = true
        //     }
        //     this.arr.push({m_labelNum:{text:i},isOpen:isOpen});
        // }
        // this.m_gqList.array = this.arr //这里不添加的话，renderHandler是不会回调进自己的函数的
        // this.m_gqList.renderHandler = new Laya.Handler(this,this.onRender);
        // this.m_gqList.vScrollBarSkin='';
    }

    onRender(cell,index){
        if(index > this.arr.length)
            return;
        var data = this.arr[index];
        var itemNum = cell.getChildByName("m_labelNum");
        var itemImg = cell.getChildByName("imgItemBg");
        if(data.isOpen){
            itemNum.text = data.m_labelNum.text;
            itemImg.skin = "ui/room/000.png"
        }           
        else
        {
            itemNum.text = ""
            itemImg.skin = "ui/room/00.png"
        }           
    }
}