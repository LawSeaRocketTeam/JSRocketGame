/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import BaseView from "../dzgames/components/dzpage/BaseView";
import BaseDialog from "../dzgames/components/dzpage/BaseDailog";
import BaseScene from "../dzgames/components/dzpage/BaseScene";
export module ui.dzgame.common {
    export class LoadingUI extends BaseView {
		public lblTips:Laya.Label;
        public static  uiView:any ={"type":"BaseView","props":{"width":1728,"height":864},"compId":2,"child":[{"type":"Label","props":{"y":375,"x":668,"var":"lblTips","text":"loading...","fontSize":35,"color":"#FFFFFF","anchorY":0.5,"anchorX":0.5},"compId":3}],"loadList":[],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(LoadingUI.uiView);
        }
    }
    export class MaskUI extends BaseView {
        public static  uiView:any ={"type":"BaseView","props":{"width":1728,"renderType":"mask","height":864,"autoDestroyAtClosed":true},"compId":2,"loadList":[],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(MaskUI.uiView);
        }
    }
    export class PreloadUI extends BaseScene {
		public lblTips:Laya.Label;
		public btnLogin:Laya.Button;
        public static  uiView:any ={"type":"BaseScene","props":{"width":1728,"name":"gameBox","height":864},"compId":1,"child":[{"type":"Sprite","props":{"y":0,"x":0,"width":1336,"name":"UI","height":750},"compId":14,"child":[{"type":"Label","props":{"y":375,"x":668,"var":"lblTips","valign":"middle","text":"Game is starting,Pls wait...","fontSize":40,"color":"#c6302e","anchorY":0.5,"anchorX":0.5,"align":"center"},"compId":16},{"type":"Sprite","props":{"y":329,"x":326,"texture":"test/c1.png"},"compId":22},{"type":"Button","props":{"y":367.5,"x":931,"visible":false,"var":"btnLogin","skin":"comp/button.png","label":"login"},"compId":25}]}],"loadList":["test/c1.png","comp/button.png"],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(PreloadUI.uiView);
        }
    }
    export class ProgressUI extends BaseView {
		public lblTips:Laya.Label;
        public static  uiView:any ={"type":"BaseView","props":{"width":1728,"height":750},"compId":2,"child":[{"type":"Label","props":{"y":375,"x":668,"var":"lblTips","anchorY":0.5,"anchorX":0.5},"compId":3}],"loadList":[],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(ProgressUI.uiView);
        }
    }
    export class ToastUI extends BaseView {
		public lblTips:Laya.Label;
        public static  uiView:any ={"type":"BaseView","props":{"width":1728,"height":864},"compId":2,"child":[{"type":"Label","props":{"y":375,"x":668,"var":"lblTips","text":"-","fontSize":45,"color":"#FFFFFF","anchorY":0.5,"anchorX":0.5},"compId":3}],"loadList":[],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(ToastUI.uiView);
        }
    }
}
export module ui.dzgame.GameLobby {
    export class LobbyUI extends BaseScene {
		public btnDDZ:Laya.Button;
		public btnRoom:Laya.Button;
		public btnLogin:Laya.Button;
        public static  uiView:any ={"type":"BaseScene","props":{"width":1728,"name":"Lobby","height":864},"compId":2,"child":[{"type":"Button","props":{"y":363.5,"x":614,"var":"btnDDZ","skin":"comp/button.png","label":"斗地主"},"compId":3},{"type":"Button","props":{"y":363.5,"x":801,"visible":false,"var":"btnRoom","skin":"comp/button.png","label":"进入房间"},"compId":5},{"type":"Button","props":{"y":352,"x":411,"var":"btnLogin","skin":"comp/button.png","label":"login GC"},"compId":6}],"loadList":["comp/button.png"],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(LobbyUI.uiView);
        }
    }
}
export module ui.games.globalview {
    export class gamesUI extends BaseView {
		public btnLan:Laya.Button;
		public btnSZ:Laya.Button;
        public static  uiView:any ={"type":"BaseView","props":{"width":500,"height":300},"compId":2,"child":[{"type":"Button","props":{"y":50,"x":50,"width":78,"var":"btnLan","skin":"comp/button.png","label":"斗地主","height":49},"compId":3},{"type":"Button","props":{"y":63,"x":165,"var":"btnSZ","skin":"comp/button.png","label":"三张"},"compId":4}],"loadList":["comp/button.png"],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(gamesUI.uiView);
        }
    }
}
export module ui.games.landrods {
    export class LanLobbyUI extends BaseScene {
		public btnBack:Laya.Button;
		public lblTips:Laya.Label;
		public btnRoom:Laya.Button;
		public btnSend:Laya.Button;
        public static  uiView:any ={"type":"BaseScene","props":{"width":1336,"height":750},"compId":2,"child":[{"type":"Sprite","props":{"y":0,"x":0,"width":1336,"texture":"games/landords/lobby/main.png","height":750},"compId":3},{"type":"Button","props":{"y":64,"x":62,"width":183,"var":"btnBack","skin":"comp/button.png","labelSize":40,"label":"返回大厅","height":105},"compId":4},{"type":"Label","props":{"y":602,"x":377,"var":"lblTips","text":"label"},"compId":5},{"type":"Button","props":{"y":208,"x":703,"width":181,"var":"btnRoom","skin":"comp/button.png","label":"进入第一个房间","height":113},"compId":6},{"type":"Button","props":{"y":602,"x":1076,"var":"btnSend","skin":"comp/button.png","label":"发送消息"},"compId":7}],"loadList":["games/landords/lobby/main.png","comp/button.png"],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(LanLobbyUI.uiView);
        }
    }
}
export module ui.games.lobby {
    export class GameLobbyUI extends BaseView {
        public static  uiView:any ={"type":"BaseView","props":{"width":1728,"height":864},"compId":2,"child":[{"type":"Button","props":{"y":327,"x":520,"skin":"comp/button.png","label":"label"},"compId":3}],"loadList":["comp/button.png"],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(GameLobbyUI.uiView);
        }
    }
}
export module ui.games.sanzhang_example {
    export class szlobbyUI extends BaseScene {
        public static  uiView:any ={"type":"BaseScene","props":{"width":500,"height":300},"compId":2,"child":[{"type":"Sprite","props":{"y":0,"x":0,"width":1336,"texture":"games/sanzhang/main1.png","height":750},"compId":4}],"loadList":["games/sanzhang/main1.png"],"loadList3D":[]};
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.createView(szlobbyUI.uiView);
        }
    }
}