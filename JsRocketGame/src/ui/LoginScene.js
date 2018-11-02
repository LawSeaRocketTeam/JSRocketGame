import RoomScene from "./RoomScene";

//登录界面
//create by jackson


export default class LoginScene extends Laya.Scene {
    constructor() {
        super();
        LoginScene.instance = this;
        this.loadScene("Login.scene");
    }

    onEnable() {
        this.bt_login.on(Laya.Event.CLICK,this,this.onLoginClick)
    }

    onLoginClick(e){
        this.removeSelf();
        LoginScene.roomScene = new RoomScene();
        Laya.stage.addChild(LoginScene.roomScene);
    }
}