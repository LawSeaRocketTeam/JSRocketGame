var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalPlayer_1 = require("./dzgames/modes/lobby/LocalPlayer");
var ToastView_1 = require("./dzgames/views/common/ToastView");
var LobbyView_1 = require("./dzgames/views/lobby/LobbyView");
var MaskView_1 = require("./dzgames/views/common/MaskView");
var Logger_1 = require("./dzgames/core/logmgr/Logger");
var NetworkMgr_1 = require("./dzgames/core/netmgr/NetworkMgr");
var SoundManager_1 = require("./dzgames/core/soundmgr/SoundManager");
var PreloadView_1 = require("./dzgames/views/preload/PreloadView");
var LoadingView_1 = require("./dzgames/views/common/LoadingView");
var LobbyData_1 = require("./dzgames/modes/lobby/LobbyData");
var ResourceMgr_1 = require("./dzgames/core/resmgr/ResourceMgr");
var GameItem_1 = require("./dzgames/modes/lobby/GameItem");
var ProgressView_1 = require("./dzgames/views/common/ProgressView");
var Main_1 = require("./Main");
var EventDispatch_1 = require("./dzgames/core/eventmgr/EventDispatch");
/**
 * brief:game center presenter.
 * Author: wenzuoli
 * Date: 2019/04/08
 */
var AppPresenter = /** @class */ (function () {
    function AppPresenter() {
        /**layer control start*/
        this.ZORDER_LOADING = 11;
        this.ZORDER_PROGRESS = 10;
        this.ZORDER_TOAST = 9;
        this.ZORDER_MASK = 8;
        this.ZORDER_MESSAGE = 7;
        this.ZORDER_LOBBY = 0;
        /**layer control end */
        this._enableLoading = true;
        this._log = null;
        this._event = null;
        this._net = null;
        this._sound = null;
        this._player = null;
        this._mainView = null;
        this._lobby = null;
        this._progressView = null;
        this._loadingView = null;
        this._games = null;
        this.regClass();
        this.moduleInitial();
        //this.gameStart();
    }
    AppPresenter.prototype.regClass = function () {
        // Laya.ClassUtils.regClass("LanLobby",dzgames.LanLobbyView);
    };
    /**
     * starting game lobby.
     */
    AppPresenter.prototype.startGame = function () {
        // GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        var preload = new PreloadView_1.default();
        preload.name = "preload";
        this._mainView.addChild(preload); //enter lobby need to remove the preload view.
    };
    /**
     * close all open games and back to lobby.
     */
    AppPresenter.prototype.enterLobby = function () {
        this.destroyGames();
        var preload = this._mainView.getChildByName("preload");
        if (preload) {
            this._mainView.removeChild(preload);
        }
        if (this._lobby == null) {
            this._lobby = new LobbyView_1.default();
        }
        this._mainView.addChild(this._lobby);
    };
    /**
     *
     * @param scene the main scene of the game you need to open.
     * @param res the new game resource list:system will help you load the resource list and management.
     */
    // public openGame2(url:string,res:Array<string>):void{
    //     let clas:any = Laya.ClassUtils.getClass(url);
    //     let scene:any = null;
    //     if(clas){
    //         scene = new clas();
    //     }
    //     if(scene==null){
    //         this.mLogger.error("can't find scene.");
    //         return;
    //     }
    //     if(res==null||res.length<1){
    //         this.mLogger.warn("system will open the new scene but no load any resource. pls confirm.");
    //     }
    //     this.showLoading();
    //     this.destroyGames();
    //     this._games.push(new GameItem(scene.mSceneKey,res,scene));
    //     let _completed:Laya.Handler = Laya.Handler.create(this,this.openNewScene,[scene.mSceneKey]);
    //     let _progress:Laya.Handler = Laya.Handler.create(this,this.showProgress,null,false);
    //     ResourceMgr.loadRes(res,_completed,_progress,null,0,true,scene.mSceneKey);
    // }
    /**
     *
     * @param scene the main scene of the game you need to open.
     * @param res the new game resource list:system will help you load the resource list and management.
     */
    AppPresenter.prototype.openGame = function (scene, res) {
        if (scene == null) {
            this.Logger.error("error calling. the scene is null.");
            return;
        }
        if (res == null || res.length < 1) {
            this.Logger.warn("system will open the new scene but no load any resource. pls confirm.");
        }
        this.showLoading();
        this.destroyGames();
        this._games.push(new GameItem_1.default(scene.mSceneKey, res, scene));
        var _completed = Laya.Handler.create(this, this.openNewScene, [scene.mSceneKey]);
        var _progress = Laya.Handler.create(this, this.showProgress, null, false);
        ResourceMgr_1.default.loadRes(res, _completed, _progress, null, 0, true, scene.mSceneKey);
    };
    /**
     * destroy current games.
     */
    AppPresenter.prototype.destroyGames = function () {
        var len = this._games.length;
        while (len > 0) {
            var _tem = this._games.pop();
            this._mainView.removeChild(_tem.mGameView);
            _tem.mGameView.exitAndDestroy();
            ResourceMgr_1.default.clearResByGroup(_tem.mGameKey);
            _tem = null;
            len = this._games.length;
        }
    };
    /**
     * open scene for new game.
     * @param args game key
     */
    AppPresenter.prototype.openNewScene = function (key) {
        var view = null;
        for (var i = 0; i < this._games.length; i++) {
            if (this._games[i].mGameKey == key) {
                view = this._games[i].mGameView;
                break;
            }
        }
        if (view) {
            this._mainView.addChild(view);
            var node = this._mainView.removeChild(this._lobby);
            this._lobby = null;
            node.destroy(true);
            this.hideLoading();
        }
        else {
            this.showToast("Can't find scene.");
        }
    };
    /**
     * initial relative modules.
     */
    AppPresenter.prototype.moduleInitial = function () {
        this._mainView = Laya.Scene.root;
        this._games = new Array();
        this._player = new LocalPlayer_1.default();
        this._event = new EventDispatch_1.default();
        this._log = new Logger_1.default();
        var _onconnected = Laya.Handler.create(this, this.onConnected);
        var _onConnectFailed = Laya.Handler.create(this, this.onConnectFailed);
        var _onSendMsgFailed = Laya.Handler.create(this, this.onSendMsgFailed, null, false);
        this._net = new NetworkMgr_1.default(_onconnected, _onConnectFailed, _onSendMsgFailed);
        this._sound = new SoundManager_1.SoundManager();
    };
    Object.defineProperty(AppPresenter.prototype, "Net", {
        get: function () {
            return this._net;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppPresenter.prototype, "Sound", {
        /**Sound manager */
        get: function () {
            return this._sound;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppPresenter.prototype, "Events", {
        /**
         * event dispatch module.
         */
        get: function () {
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppPresenter.prototype, "Logger", {
        /**
         * Logger module
         */
        get: function () {
            return this._log;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppPresenter.prototype, "Player", {
        /**
         * game player data
         */
        get: function () {
            if (this._player == null) {
                this._player = new LocalPlayer_1.default();
            }
            return this._player;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppPresenter.prototype, "enableLoading", {
        /**
         * switch the loading status.
         * true: enable show loading view. show loading view when system in loading res.
         * false: hide the loading view when system in loading.
         */
        set: function (enable) {
            this._enableLoading = enable;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * show toast message.
     * @param msg message string
     */
    AppPresenter.prototype.showToast = function (msg) {
        var toast = new ToastView_1.default(msg);
        toast.zOrder = this.ZORDER_TOAST;
        Laya.Scene.root.addChild(toast);
    };
    /**
     * Show message window
     * @param message display message
     * @param okCallback ok callback
     * @param cancelCallback cancel callback
     */
    AppPresenter.prototype.showMsg = function (message, okCallback, cancelCallback) {
        //TODO:wenzuoli
        if (confirm(message)) {
            okCallback && okCallback.run();
        }
        else {
            cancelCallback && cancelCallback.run();
        }
    };
    /**
     * Show mask for disable any touch/click event.
     */
    AppPresenter.prototype.showMask = function () {
        var mask = new MaskView_1.default();
        mask.zOrder = this.ZORDER_MASK;
        Laya.Scene.root.addChild(mask);
    };
    /**
     * hide the loading view.
     */
    AppPresenter.prototype.hideLoading = function () {
        if (this._enableLoading && this._loadingView) {
            var node = this._mainView.removeChild(this._loadingView);
            this._loadingView = null;
            node.destroy(true);
        }
    };
    /**
     * show loading view. use for transition or switching the scenes
     */
    AppPresenter.prototype.showLoading = function () {
        if (this._enableLoading) {
            if (!this._loadingView) {
                this._loadingView = new LoadingView_1.default();
                this._loadingView.zOrder = this.ZORDER_LOADING;
                this._mainView.addChild(this._loadingView);
            }
        }
    };
    /**
     * show loading progress.
     * @param val progress for loading
     */
    AppPresenter.prototype.showProgress = function (val) {
        if (!this._progressView) {
            this._progressView = new ProgressView_1.default();
            this._progressView.zOrder = this.ZORDER_PROGRESS;
            this._mainView.addChild(this._progressView);
        }
        if (!this._progressView.visible) {
            this._progressView.visible = true;
        }
        if (val == 1) {
            this._progressView.visible = false;
        }
        else {
            this._progressView.progressChange(val);
        }
    };
    AppPresenter.prototype.showLoginPanel = function () {
        Main_1.dzapp.Logger.warn("function 'showLoginPanel' not implemented.");
    };
    /**
     * connect to forward result.
     * @param data received data
     */
    AppPresenter.prototype.onConnected = function (data) {
        //connect to forward success.
        LobbyData_1.default.init();
    };
    /**
     * connect to forward result.
     * @param data received data
     */
    AppPresenter.prototype.onConnectFailed = function (data) {
        //connect to forward success.
        this.showToast("Connect to server failed.");
    };
    AppPresenter.prototype.onSendMsgFailed = function () {
        this.showToast("Message send failed.");
    };
    /**
     * play sound
     * @param url path
     * @param loops loops,optional
     * @param complete callback
     */
    AppPresenter.prototype.playerSoundEffect = function (url, loops, complete) {
        this._sound.playSound(url, loops, complete);
    };
    return AppPresenter;
}());
exports.default = AppPresenter;
},{"./Main":3,"./dzgames/core/eventmgr/EventDispatch":10,"./dzgames/core/logmgr/Logger":11,"./dzgames/core/netmgr/NetworkMgr":12,"./dzgames/core/resmgr/ResourceMgr":14,"./dzgames/core/soundmgr/SoundManager":15,"./dzgames/modes/lobby/GameItem":16,"./dzgames/modes/lobby/LobbyData":17,"./dzgames/modes/lobby/LocalPlayer":18,"./dzgames/views/common/LoadingView":21,"./dzgames/views/common/MaskView":22,"./dzgames/views/common/ProgressView":23,"./dzgames/views/common/ToastView":24,"./dzgames/views/lobby/LobbyView":25,"./dzgames/views/preload/PreloadView":26}],2:[function(require,module,exports){
"use strict";
/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
Object.defineProperty(exports, "__esModule", { value: true });
/*
* 游戏初始化配置;
*/
var GameConfig = /** @class */ (function () {
    function GameConfig() {
    }
    GameConfig.init = function () {
        var reg = Laya.ClassUtils.regClass;
    };
    GameConfig.width = 1728;
    GameConfig.height = 864;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "dzgame/common/Preload.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    return GameConfig;
}());
exports.default = GameConfig;
GameConfig.init();
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameConfig_1 = require("./GameConfig");
var AppPresenter_1 = require("./AppPresenter");
var ResourceMgr_1 = require("./dzgames/core/resmgr/ResourceMgr");
var res_1 = require("./dzgames/configs/rescfg/imgres/res");
exports.dzapp = null;
var Main = /** @class */ (function () {
    function Main() {
        //根据IDE设置初始化引擎		
        if (window["Laya3D"])
            Laya3D.init(GameConfig_1.default.width, GameConfig_1.default.height);
        else
            Laya.init(GameConfig_1.default.width, GameConfig_1.default.height, Laya["WebGL"]);
        Laya["Physics"] && Laya["Physics"].enable();
        Laya["DebugPanel"] && Laya["DebugPanel"].enable();
        Laya.stage.scaleMode = GameConfig_1.default.scaleMode;
        Laya.stage.screenMode = GameConfig_1.default.screenMode;
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = GameConfig_1.default.exportSceneToJson;
        //打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
        if (GameConfig_1.default.debug || Laya.Utils.getQueryString("debug") == "true")
            Laya.enableDebugPanel();
        if (GameConfig_1.default.physicsDebug && Laya["PhysicsDebugDraw"])
            Laya["PhysicsDebugDraw"].enable();
        if (GameConfig_1.default.stat)
            Laya.Stat.show();
        Laya.alertGlobalError = true;
        //激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
        Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    }
    Main.prototype.onVersionLoaded = function () {
        //激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
        Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onResouceLoaded));
    };
    /**
     * after config loaded then starting to load resource/ui
     */
    Main.prototype.onConfigLoaded = function () {
        //resource load
        var logoRes = new Array();
        res_1.default.Preload.forEach(function (element) {
            logoRes.push(element);
        });
        ResourceMgr_1.default.loadRes(logoRes, Laya.Handler.create(this, this.onResouceLoaded));
    };
    /**
     * after resource loaded then run presenter.
     */
    Main.prototype.onResouceLoaded = function () {
        exports.dzapp = exports.dzapp || new AppPresenter_1.default();
        exports.dzapp.startGame();
    };
    return Main;
}());
//激活启动类
new Main();
},{"./AppPresenter":1,"./GameConfig":2,"./dzgames/configs/rescfg/imgres/res":9,"./dzgames/core/resmgr/ResourceMgr":14}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameConfig_1 = require("../../../GameConfig");
var Main_1 = require("../../../Main");
var BaseScene_1 = require("./BaseScene");
var BaseView_1 = require("./BaseView");
/**
 * @desc : 所有对话框的基类，主要用于对页面事件的管理，自动移除等
 * @author: Wenzuoli
 * @date: 2018/05/23
 */
var BaseDialog = /** @class */ (function (_super) {
    __extends(BaseDialog, _super);
    function BaseDialog() {
        var _this = _super.call(this) || this;
        /**current z-index for add child. */
        _this.zIndex = 0;
        return _this;
        //this.on(Laya.Event.REMOVED,this,this.offAllListener);
    }
    BaseDialog.prototype.onDestroy = function () {
        this.offAllListener();
    };
    /**
     * remove all listens for current page.
     */
    BaseDialog.prototype.offAllListener = function () {
        Main_1.dzapp.Events.offAllByCaller(this);
    };
    /**
     * close
     */
    BaseDialog.prototype.exit = function () {
        this.offAllListener();
        Laya.Tween.to(this, { x: GameConfig_1.default.width / 2, y: GameConfig_1.default.height / 2, scaleX: 0.6, scaleY: 0.6, alpha: 0 }, 280, Laya.Ease.backIn, Laya.Handler.create(this, this.destroy, [true]), 0);
    };
    /**
     * 关闭并带动画效果
     */
    BaseDialog.prototype.closeAndDestroy = function () {
        Laya.Tween.to(this, { x: GameConfig_1.default.width / 2, y: GameConfig_1.default.height / 2, scaleX: 0.6, scaleY: 0.6, alpha: 0 }, 280, Laya.Ease.backIn, Laya.Handler.create(this, this.exit), 0);
    };
    /**
    * back to last view
    */
    BaseDialog.prototype.goBack = function () {
        this.exit();
    };
    /**
     * goto the target view ,must use the goBack to come back
     * @param v new view
     */
    BaseDialog.prototype.gotoView = function (v) {
        return _super.prototype.addChild.call(this, v);
    };
    BaseDialog.prototype.ShowEffect = function () {
        this.alpha = 0.1;
        this.scale(0.1, 0.1, true);
        Laya.Tween.to(this, { scaleX: 1, scaleY: 1, alpha: 1 }, 300, Laya.Ease["circOut"]);
    };
    /**
     * Add child to view.
     * @param node child
     */
    BaseDialog.prototype.addChild = function (node) {
        if (node instanceof BaseScene_1.default) {
            throw "Cannot add scene into the dailog.";
            return;
        }
        if (this.zIndex == undefined) {
            this.zIndex = 0;
        }
        if (node instanceof BaseView_1.default) {
            node.zOrder = this.zIndex++;
            return this.gotoView(node);
        }
        return _super.prototype.addChildAt.call(this, node, this.zIndex++);
    };
    return BaseDialog;
}(Laya.Dialog));
exports.default = BaseDialog;
},{"../../../GameConfig":2,"../../../Main":3,"./BaseScene":5,"./BaseView":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseView_1 = require("./BaseView");
var RandomMgr_1 = require("../../utils/RandomMgr");
var Main_1 = require("../../../Main");
/**
 * @description:base scene.
 * @author: wenzuoli
 * @Date: 2019/04/08
 */
var BaseScene = /** @class */ (function (_super) {
    __extends(BaseScene, _super);
    function BaseScene() {
        var _this = _super.call(this) || this;
        /**current z-index for add child. */
        _this.zIndex = 0;
        _this.mExitTime = 1000 * 0.5;
        _this.mSceneKey = RandomMgr_1.default.uuid();
        return _this;
        //this.on(Laya.Event.REMOVED,this,this.offAllListener);
    }
    BaseScene.prototype.onDestroy = function () {
        this.offAllListener();
    };
    /**
    * Remove all the listeners of the current page
    */
    BaseScene.prototype.offAllListener = function () {
        Main_1.dzapp.Events.offAllByCaller(this);
    };
    /**
     *
     * @param node display node.
     */
    BaseScene.prototype.addChild = function (node) {
        if (node instanceof BaseScene) {
            throw "Cannot add scene in the scene.";
            return;
        }
        if (this.zIndex == undefined) {
            this.zIndex = 0;
        }
        if (node instanceof BaseView_1.default) {
            node.zOrder = this.zIndex++;
            return this.gotoView(node);
        }
        return _super.prototype.addChildAt.call(this, node, this.zIndex++);
    };
    /**
     * Remove from parent container and destroy self.
     */
    BaseScene.prototype.exitAndDestroy = function () {
        this.exitSystem(this.destroy, [true]);
    };
    /**
     * exit system
     * @param callback callback function
     * @param args function arguments
     */
    BaseScene.prototype.exitSystem = function (callback) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        Laya.Tween.to(this, { alpha: 0.1, x: -2160 }, this.mExitTime, Laya.Ease.cubicOut, Laya.Handler.create(this, callback, args), 0);
    };
    /**
     * goto the target view ,must use the goBack to come back
     * @param v new view
     */
    BaseScene.prototype.gotoView = function (v) {
        return _super.prototype.addChild.call(this, v);
        //remove the switch effect.
        // let _loading:BlackingUI = new BlackingUI();
        // this.addChild(_loading);
        // _loading.show(300,Laya.Handler.create(this,this.addView,[v,_loading]));
    };
    return BaseScene;
}(Laya.Scene));
exports.default = BaseScene;
},{"../../../Main":3,"../../utils/RandomMgr":20,"./BaseView":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../../Main");
var BaseScene_1 = require("./BaseScene");
/**
 * @desc : base view
 * @author: Wenzuoli
 * @Date: 2019/04/08
 */
var BaseView = /** @class */ (function (_super) {
    __extends(BaseView, _super);
    /**
     * Page's base view include all common functions.
     */
    function BaseView() {
        var _this = _super.call(this) || this;
        _this.mExitTime = 1000 * 0.5;
        /**current z-index for add child. */
        _this.zIndex = 0;
        return _this;
        //this.on(Laya.Event.REMOVED,this,this.offAllListener);
    }
    BaseView.prototype.onDestroy = function () {
        this.offAllListener();
    };
    /**
     * Remove all the listeners of the current page
     */
    BaseView.prototype.offAllListener = function () {
        Main_1.dzapp.Events.offAllByCaller(this);
    };
    /**
     * Remove from parent container and destroy self.
     */
    BaseView.prototype.exitAndDestroy = function () {
        this.exitSystem(this.destroy, [true]);
    };
    /**
     * exit system
     * @param callback callback function
     * @param args function arguments
     */
    BaseView.prototype.exitSystem = function (callback) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        Laya.Tween.to(this, { alpha: 0.1, x: -2160 }, this.mExitTime, Laya.Ease.cubicOut, Laya.Handler.create(this, callback, args), 0);
    };
    /**
     * back to last view
     */
    BaseView.prototype.goBack = function () {
        this.exitAndDestroy();
    };
    /**
     * goto the target view ,must use the goBack to come back
     * @param v new view
     */
    BaseView.prototype.gotoView = function (v) {
        return _super.prototype.addChild.call(this, v);
        //remove the switch effect.
        // let _loading:BlackingUI = new BlackingUI();
        // this.addChild(_loading);
        // _loading.show(300,Laya.Handler.create(this,this.addView,[v,_loading]));
    };
    /**
     * Add child to view.
     * @param node child
     */
    BaseView.prototype.addChild = function (node) {
        if (node instanceof BaseScene_1.default) {
            throw "Cannot add scene in the view.";
            return;
        }
        if (this.zIndex == undefined) {
            this.zIndex = 0;
        }
        if (node instanceof BaseView) {
            node.zOrder = this.zIndex++;
            return this.gotoView(node);
        }
        return _super.prototype.addChildAt.call(this, node, this.zIndex++);
    };
    /**
     * Add childs to view.
     * @param args childs
     */
    BaseView.prototype.addChildren = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.addChildren.apply(this, args);
    };
    return BaseView;
}(Laya.View));
exports.default = BaseView;
},{"../../../Main":3,"./BaseScene":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @description Dictionary module.
 * @author wenzuoli
 * @date 2019/4/16
*/
var Dictionary = /** @class */ (function () {
    function Dictionary() {
        this.elements = null;
        this.elements = new Array();
    }
    Object.defineProperty(Dictionary.prototype, "length", {
        /**Length of Dictionary*/
        get: function () {
            return this.elements.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dictionary.prototype, "isEmpty", {
        /**Check whether the Dictionary is empty*/
        get: function () {
            return this.elements.length < 1;
        },
        enumerable: true,
        configurable: true
    });
    ;
    /**remove all elements from the Dictionary*/
    Dictionary.prototype.removeAll = function () {
        this.elements = new Array();
    };
    ;
    /**get specify element of the dictionary*/
    Dictionary.prototype.getItemByIndex = function (index) {
        var rlt = null;
        if (index >= 0 && index < this.elements.length) {
            rlt = this.elements[index];
        }
        return rlt;
    };
    /**check whether the Dictionary contains this key*/
    Dictionary.prototype.Contain = function (key) {
        var rlt = false;
        try {
            for (var i = 0, iLen = this.length; i < iLen; i++) {
                if (this.elements[i].key == key) {
                    rlt = true;
                    break;
                }
            }
        }
        catch (ex) {
        }
        return rlt;
    };
    ;
    /**check whether the Dictionary contains this value*/
    Dictionary.prototype.containsValue = function (value) {
        var rlt = false;
        try {
            for (var i = 0, iLen = this.length; i < iLen; i++) {
                if (this.elements[i].value == value) {
                    rlt = true;
                    break;
                }
            }
        }
        catch (ex) {
        }
        return rlt;
    };
    ;
    /**remove this key from the Dictionary*/
    Dictionary.prototype.removeByKey = function (key) {
        var rlt = false;
        try {
            for (var i = 0, iLen = this.length; i < iLen; i++) {
                if (this.elements[i].key == key) {
                    this.elements.splice(i, 1);
                    rlt = true;
                    break;
                }
            }
        }
        catch (ex) {
        }
        return rlt;
    };
    ;
    /**add this key/value to the Dictionary,if key is exists,replace the value*/
    Dictionary.prototype.add = function (key, value) {
        if (this.Contain(key)) {
            throw "can't add same key into the dictionary.";
            return;
        }
        this.elements.push({
            key: key,
            value: value
        });
    };
    ;
    Dictionary.prototype.setValue = function (key, val) {
        var item = this.getItemByKey(key);
        item = val;
    };
    /**add this key/value to the Dictionary,if key is exists then recover*/
    Dictionary.prototype.set = function (key, value) {
        if (this.Contain(key)) {
            this.setValue(key, value);
        }
        else {
            this.elements.push(key, value);
        }
    };
    /**get value of the key*/
    Dictionary.prototype.getItemByKey = function (key) {
        var rlt = null;
        try {
            for (var i = 0, iLen = this.length; i < iLen; i++) {
                if (this.elements[i].key == key) {
                    rlt = this.elements[i].value;
                    break;
                }
            }
        }
        catch (ex) {
        }
        return rlt;
    };
    ;
    /**get all keys of the dictionary*/
    Dictionary.prototype.keys = function () {
        var arr = [];
        for (var i = 0, iLen = this.length; i < iLen; i++) {
            arr.push(this.elements[i].key);
        }
        return arr;
    };
    /**get all values of the dictionary*/
    Dictionary.prototype.values = function () {
        var arr = [];
        for (var i = 0, iLen = this.length; i < iLen; i++) {
            arr.push(this.elements[i].value);
        }
        return arr;
    };
    return Dictionary;
}());
exports.default = Dictionary;
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* brief:common enums defind
* Author: wenzuoli
* Date: 2019/04/02
*/
var UserConfig = /** @class */ (function () {
    function UserConfig() {
    }
    /**
     * 程序需要运行的模式
     */
    UserConfig.RunningMode = {
        /**网页版 */
        web: 1,
        /**微信小程序 */
        miniProgram: 2,
        /**安卓APP */
        androidApp: 3,
        /**IOS APP */
        iosApp: 4
    };
    /**connection control room ID */
    UserConfig.controlRoomId = 0X11041104;
    /**system base room id:GC server */
    UserConfig.baseRoomId = 1;
    /** program running mode:web/miniprogram/android app/ios app e.g.*/
    UserConfig.runningMode = UserConfig.RunningMode.web;
    /**game server address:dev server:172.17.3.180 */
    UserConfig.serverAddress = "172.17.3.180";
    /**game server port;default port:8300 */
    UserConfig.serverPort = 7777;
    //Custom game config into here
    /**enable log print */
    UserConfig.enableEventLog = false;
    /**event log submit path. */
    UserConfig.eventLogSubmitUrl = "http://stat2.web.yy.com/c.gif";
    /**resource url */
    UserConfig.ResourceUrl = "https://small.dozengame.com/";
    return UserConfig;
}());
exports.default = UserConfig;
var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel[LoggerLevel["ALL"] = 0] = "ALL";
    LoggerLevel[LoggerLevel["TRACE"] = 1] = "TRACE";
    LoggerLevel[LoggerLevel["DEBUG"] = 2] = "DEBUG";
    LoggerLevel[LoggerLevel["INFO"] = 3] = "INFO";
    LoggerLevel[LoggerLevel["WARN"] = 4] = "WARN";
    LoggerLevel[LoggerLevel["ERROR"] = 5] = "ERROR";
    LoggerLevel[LoggerLevel["FATAL"] = 6] = "FATAL";
    LoggerLevel[LoggerLevel["OFF"] = 7] = "OFF";
})(LoggerLevel = exports.LoggerLevel || (exports.LoggerLevel = {}));
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResList = /** @class */ (function () {
    function ResList() {
    }
    /**
     * preload res
     */
    ResList.Preload = [
        { url: "ui.json", type: Laya.Loader.JSON },
        { url: "res/atlas/comp.atlas" },
        { url: "res/atlas/test.atlas" }
    ];
    return ResList;
}());
exports.default = ResList;
},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../../Main");
var Dictionary_1 = require("../../components/extend/Dictionary");
var BaseScene_1 = require("../../components/dzpage/BaseScene");
var BaseView_1 = require("../../components/dzpage/BaseView");
var BaseDailog_1 = require("../../components/dzpage/BaseDailog");
/**
 * @description 事件监听与派发
 * @author wenzuoli
 * @date: 04/18/2019
 */
var EventDispatch = /** @class */ (function () {
    function EventDispatch() {
        this.mDic = null;
        this.mDic = new Dictionary_1.default();
    }
    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知。
     * @param roomId 服务器ID 由你连接的游戏确定
     * @param type 事件类型 如 “CLICK” 之类 参考 Laya.Event.CLICK
     * @param caller 事件侦听函数的执行域
     * @param listener 事件侦听函数
     */
    EventDispatch.prototype.Listen = function (roomId, type, caller, listener) {
        var _allow = caller instanceof BaseScene_1.default || caller instanceof BaseView_1.default || caller instanceof BaseDailog_1.default;
        if (!caller || !_allow) {
            throw "Error:The listen caller just allow use the BaseScene|BaseView|BaseDailog. at:" + caller.constructor.name;
            return;
        }
        var _room = this.mDic.getItemByKey(roomId);
        var _item = new ListenEntity(roomId, caller, type, listener);
        if (_room) {
            var _cl = _room.getItemByKey(caller);
            if (_cl) {
                _cl.add(type, _item);
            }
            else {
                _cl = new Dictionary_1.default();
                _cl.add(type, _item);
                _room.add(caller, _cl);
            }
        }
        else {
            _room = new Dictionary_1.default();
            var _cl = new Dictionary_1.default();
            _cl.add(type, _item);
            _room.add(roomId, _cl);
            this.mDic.add(roomId, _room);
        }
        Main_1.dzapp.Logger.info("Add listen for:" + roomId + ":" + type);
    };
    /**
     * 派发事件
     * @param roomId 服务器ID 由你连接的游戏确定
     * @param type 事件类型 如 “CLICK” 之类 参考 Laya.Event.CLICK
     * @param data （可选）回调数据。<b>注意：</b>如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p ，且 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     */
    EventDispatch.prototype.Event = function (roomId, type, data) {
        var _room = this.mDic.getItemByKey(roomId);
        if (_room) {
            var _cls = _room.keys();
            for (var i = 0; i < _cls.length; i++) {
                var _cl = _room.getItemByKey(_cls[i]);
                var _lst = _cl.getItemByKey(type);
                if (_lst) {
                    _lst.Listener.runWith(data);
                }
                else {
                    Main_1.dzapp.Logger.warn("Network event no handler:" + roomId + ":" + type);
                }
            }
        }
        else {
            Main_1.dzapp.Logger.warn("Network event no handler:" + roomId + ":" + type);
        }
    };
    /**
     * 从 EventDispatcher 对象中删除侦听器。
     * @param roomId 要删除哪个服务器的监听器
     * @param type 要删除的事件类型
     * @param caller 要删除的函数的执行域
     */
    EventDispatch.prototype.off = function (roomId, type, caller) {
        var _room = this.mDic.getItemByKey(roomId);
        if (_room) {
            var _cl = _room.getItemByKey(caller);
            if (_cl) {
                var _lst = _cl.getItemByKey(type);
                _lst && _cl.removeByKey(type);
            }
        }
    };
    /**
     * 根据事件类删除事件监听
     * @param type 要删除的事件类型
     */
    EventDispatch.prototype.offAllByType = function (type) {
        var _rkeys = this.mDic.keys();
        for (var i = 0; i < _rkeys.length; i++) {
            var _cls = this.mDic.getItemByKey(_rkeys[i]);
            var _clskeys = _cls.keys();
            for (var j = 0; j < _clskeys.length; j++) {
                var _cl = _cls.getItemByKey(_clskeys[j]);
                if (_cl.Contain(type)) {
                    _cl.removeByKey(type);
                }
            }
        }
    };
    /**
     * 根据执行域删除所有监听
     * @param caller 执行域
     */
    EventDispatch.prototype.offAllByCaller = function (caller) {
        var _rkeys = this.mDic.keys();
        for (var i = 0; i < _rkeys.length; i++) {
            var _cls = this.mDic.getItemByKey(_rkeys[i]);
            var _cl = _cls.getItemByKey(caller);
            if (_cls.Contain(caller)) {
                _cls.removeByKey(caller);
            }
        }
    };
    /**
     * 删除所有监听
     */
    EventDispatch.prototype.offAll = function () {
        this.mDic = new Dictionary_1.default();
    };
    return EventDispatch;
}());
exports.default = EventDispatch;
var ListenEntity = /** @class */ (function () {
    function ListenEntity(rid, caller, type, listener) {
        this.mRoomId = 0;
        this.mCaller = null;
        this.mType = null;
        this.mListener = null;
        this.mRoomId = rid;
        this.mCaller = caller;
        this.mType = type;
        this.mListener = Laya.Handler.create(caller, listener, null, false);
    }
    Object.defineProperty(ListenEntity.prototype, "Listener", {
        get: function () {
            return this.mListener;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenEntity.prototype, "Caller", {
        get: function () {
            return this.mCaller;
        },
        enumerable: true,
        configurable: true
    });
    return ListenEntity;
}());
exports.ListenEntity = ListenEntity;
},{"../../../Main":3,"../../components/dzpage/BaseDailog":4,"../../components/dzpage/BaseScene":5,"../../components/dzpage/BaseView":6,"../../components/extend/Dictionary":7}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserConfig_1 = require("../../configs/customcfg/UserConfig");
/**
 * @desc : log handler.
 * @author: Wenzuoli
 * @Date: 2019/04/08
 */
var Logger = /** @class */ (function () {
    function Logger() {
        /**print log level:default only print error log */
        this._level = UserConfig_1.LoggerLevel.ERROR;
    }
    Object.defineProperty(Logger.prototype, "Level", {
        /**setup the logger print level. */
        set: function (level) {
            this._level = level;
        },
        enumerable: true,
        configurable: true
    });
    /**print debug log */
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.writeLog(UserConfig_1.LoggerLevel.DEBUG, args);
    };
    /**print info log */
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.writeLog(UserConfig_1.LoggerLevel.INFO, args);
    };
    /**print warn log:will be highlighted */
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.writeLog(UserConfig_1.LoggerLevel.WARN, args);
    };
    /**print warn log:will be highlighted */
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.writeLog(UserConfig_1.LoggerLevel.ERROR, args);
    };
    /**print warn log:will be highlighted */
    Logger.prototype.fatal = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.writeLog(UserConfig_1.LoggerLevel.FATAL, args);
    };
    Logger.prototype.writeLog = function (level, args) {
        if (this._level >= level) {
            switch (level) {
                case UserConfig_1.LoggerLevel.ERROR:
                case UserConfig_1.LoggerLevel.WARN:
                case UserConfig_1.LoggerLevel.FATAL:
                    console.error.apply(console, args);
                    break;
                default:
                    console.log.apply(console, args);
                    break;
            }
        }
        //console[DZGame.UserConfig.LoggerLevel[level].toLowerCase()](...args);
    };
    return Logger;
}());
exports.default = Logger;
},{"../../configs/customcfg/UserConfig":8}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket_1 = require("./WebSocket");
var Main_1 = require("../../../Main");
var UserConfig_1 = require("../../configs/customcfg/UserConfig");
/**
 * brief:Network business instance
 * Author: wenzuoli
 * Date: 2019/04/02
 */
var NetworkMgr = /** @class */ (function () {
    /**
     * network handler module:send message e.g.
     * @param onConnected connect callback
     */
    function NetworkMgr(onConnected, onConnectFailed, onSendMsgFailed) {
        /**socket communication */
        this.mWebsocket = null;
        /**game server disconnect callback */
        this.mIsDisconnect = true;
        /**game server connect callback */
        this.mOnConnecting = null;
        /**game server connect callback */
        this.mOnConnected = null;
        /**game server connect failed callback */
        this.mOnConnectFailed = null;
        /**send message failed callback. */
        this.mOnSendMsgFailed = null;
        /**the temp message buffer  */
        this.mObjSplitMsg = {};
        /**message package module */
        this.mMsgPackage = null;
        //todo:wenzuoli modify to use import to attach.
        this.mMsgPackage = Laya.Browser.window.msgpack5();
        this.mOnConnected = onConnected;
        this.mOnConnectFailed = onConnectFailed;
        var _startConnecting = Laya.Handler.create(this, this.startConnecting);
        var _afterConnect = Laya.Handler.create(this, this.afterConnected);
        var _afterConnectFailed = Laya.Handler.create(this, this.afterConnectFailed);
        var _afterDisconnect = Laya.Handler.create(this, this.afterDisconnected);
        var _afterMsg = Laya.Handler.create(this, this.receivedMsg, null, false);
        onSendMsgFailed && (this.mOnSendMsgFailed = onSendMsgFailed);
        this.mWebsocket = new WebSocket_1.default(_startConnecting, _afterConnect, _afterConnectFailed, _afterDisconnect, _afterMsg);
        this.mWebsocket.AutoReconnect = true;
        this.mWebsocket.connect(UserConfig_1.default.serverAddress, UserConfig_1.default.serverPort);
    }
    /**start connecting to game server */
    NetworkMgr.prototype.startConnecting = function () {
        Main_1.dzapp.showLoading();
    };
    /**after connected to game server */
    NetworkMgr.prototype.afterConnected = function () {
        this.mIsDisconnect = false;
        Main_1.dzapp.hideLoading();
        if (this.mOnConnected) {
            this.mOnConnected.run();
        }
    };
    /**after connected to game server failed callback */
    NetworkMgr.prototype.afterConnectFailed = function () {
        Main_1.dzapp.hideLoading();
        if (this.mOnConnectFailed) {
            this.mOnConnectFailed.run();
        }
    };
    /**after game server disconnect */
    NetworkMgr.prototype.afterDisconnected = function () {
        if (!this.mIsDisconnect) {
            this.mIsDisconnect = true;
            Main_1.dzapp.showToast("网络断开");
        }
    };
    /**
     * after received message callback.
     * @param data received data from websocket module[eventname:string,data:byte]
     */
    NetworkMgr.prototype.receivedMsg = function (data) {
        //prefix mean this message received from witch game server.
        var _prefix = data[0];
        var _msg = data;
        var eventName = "";
        try {
            var byte = new Laya.Byte(_msg);
            var _roomId = byte.getInt32();
            eventName = byte.getUTFString();
            if (_roomId == 0X11041104) { // gc connect & gs connect successfully.
                Main_1.dzapp.Logger.info("connect gc/gs successfully..");
                //todo if need. 
            }
            if (this.isKickOff(eventName)) {
                //TODO:wenzuoli
                return;
            }
            switch (eventName) {
                case "YOUKICK":
                    //TODO:wenzuoli
                    break;
                case "MSGPACL_PROTOCOL":
                    eventName = byte.getUTFString();
                    var mpSize = byte.getInt32();
                    var mpArrByte = byte.getUint8Array(byte.pos, mpSize);
                    this.msgPackageDispatch(_roomId, eventName, mpArrByte);
                    break;
                case "MSGPACL_PROTOCOL_SPLIT_START":
                    var cmd = byte.getUTFString();
                    this.mObjSplitMsg[cmd] = new Laya.Byte();
                    break;
                case "MSGPACL_PROTOCOL_SPLIT":
                    var cmd = byte.getUTFString();
                    var size = byte.getInt32();
                    var splitByte = this.mObjSplitMsg[cmd];
                    splitByte.writeArrayBuffer(byte.buffer, byte.pos, size);
                    break;
                case "MSGPACL_PROTOCOL_SPLIT_END":
                    var cmd = byte.getUTFString();
                    var splitByte = this.mObjSplitMsg[cmd];
                    var mpArrByte = splitByte.getUint8Array(0, splitByte.length);
                    // this.gsOnMsgPackMsg(cmd, mpArrByte);
                    this.msgPackageDispatch(_roomId, cmd, mpArrByte);
                    this.mObjSplitMsg[cmd] = null;
                    break;
                default:
                    //event name need add the local protocol prefix.
                    this.normalMsgDispatch(_roomId, eventName, byte);
                    break;
            }
            byte.clear();
        }
        catch (e) {
            Main_1.dzapp.Logger.error(e.message);
        }
    };
    /**
     * message package dispatch
     * @param eventName event name
     * @param mpByte received buffer
     */
    NetworkMgr.prototype.msgPackageDispatch = function (roomId, eventName, mpByte) {
        var data = this.mMsgPackage.decode(mpByte);
        this.normalMsgDispatch(roomId, eventName, data);
    };
    /**
     * normal message dispatch(byte)
     * @param eventName event name
     * @param data need dispatch data(byte)
     */
    NetworkMgr.prototype.normalMsgDispatch = function (roomId, eventName, data) {
        Main_1.dzapp.Logger.info("received message:" + eventName);
        Main_1.dzapp.Events.Event(roomId, eventName, data);
    };
    /**
     * Send message package.
     * @param command protocol event name
     * @param args other parameters
     */
    NetworkMgr.prototype.sendMsgPackage = function (roomId, command) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var data = this.mMsgPackage.encode(args);
        var byte = new Laya.Byte();
        byte.writeInt32(roomId);
        byte.writeUTFString("MSGPACL_PROTOCOL");
        byte.writeUTFString(command);
        byte.writeInt32(data.length);
        byte.writeArrayBuffer(data, 0);
        // for(let i = 0; i< data.length; i++){
        //     byte.writeByte(data[i]);
        // }
        this.sendMessage(byte);
    };
    /**
     * Send normal message.
     * @param byte send buffer
     */
    NetworkMgr.prototype.sendMessage = function (byte) {
        try {
            if (null != this.mWebsocket) {
                // if(timeout>0){
                //     this.onTurnonDelay(timeout);
                // } 
                this.sendSocketMsg(byte);
            }
        }
        catch (e) {
            Main_1.dzapp.Logger.error(e.message);
        }
    };
    /**
     * check is kickoff by server
     * @param eventName event name
     */
    NetworkMgr.prototype.isKickOff = function (eventName) {
        return eventName.indexOf("YOUKICK") > -1;
    };
    NetworkMgr.prototype.enterRoom = function (eventName, gameType, roomId) {
        //0x11041104, "query", "ddz_free"
        var byte = new Laya.Byte();
        byte.writeInt32(0X11041104);
        byte.writeUTFString(eventName);
        byte.writeUTFString(gameType);
        byte.writeInt32(roomId);
        this.sendSocketMsg(byte);
    };
    /**
     *
     * @param eventName event name
     * @param gameType game type :ddz_free
     */
    NetworkMgr.prototype.enterGame = function (eventName, gameType) {
        //0x11041104, "query", "ddz_free"
        var byte = new Laya.Byte();
        byte.writeInt32(0X11041104);
        byte.writeUTFString(eventName);
        byte.writeUTFString(gameType);
        this.sendSocketMsg(byte);
    };
    /**
     * send message
     * @param roomId roomid
     * @param eventName event name
     * @param data data
     */
    NetworkMgr.prototype.sendMsg = function (roomId, eventName, data) {
        var byte = new Laya.Byte();
        byte.writeInt32(roomId);
        byte.writeUTFString(eventName);
        byte.writeArrayBuffer(data, 0);
        this.sendMessage(byte);
    };
    /**
     * login to gc
     * @param acc account
     * @param pwd pwd
     * @param site default 0
     */
    NetworkMgr.prototype.loginToGC = function (acc, pwd, site) {
        if (site === void 0) { site = 0; }
        if (typeof acc !== "string") {
            acc = "";
        }
        if (typeof pwd !== "string") {
            pwd = "";
        }
        if (typeof site !== "number") {
            site = 0;
        }
        if (0 >= acc.length) {
            acc = "119";
        }
        var byte = new Laya.Byte();
        byte.writeInt32(1);
        byte.writeUTFString("RQLG");
        byte.writeUTFString(acc);
        byte.writeUTFString(pwd);
        byte.writeInt32(site);
        byte.writeUTFString("");
        byte.writeUTFString("");
        byte.writeUTFString("");
        //this.mWebsocket.sendMsg(byte);
        this.sendSocketMsg(byte);
    };
    /**send message to server */
    NetworkMgr.prototype.sendSocketMsg = function (byte) {
        if (this.mWebsocket && this.mWebsocket.connected) {
            this.mWebsocket.sendMsg(byte);
        }
        else {
            this.mOnSendMsgFailed && this.mOnSendMsgFailed.run();
        }
    };
    return NetworkMgr;
}());
exports.default = NetworkMgr;
},{"../../../Main":3,"../../configs/customcfg/UserConfig":8,"./WebSocket":13}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../../Main");
/**
 * brief:Base Socket module
 * Author: wenzuoli
 * Date: 2019/04/02
 */
var WebSocket = /** @class */ (function (_super) {
    __extends(WebSocket, _super);
    /**
     * web socket entry.
     * @param onConnecting start reconnecting callback
     * @param onConnected on connected successfully.
     * @param onDisconnected on game server disconnect.
     * @param onRecMsg on received new message.
     */
    function WebSocket(onConnecting, onConnected, onConnectFailed, onDisconnected, onRecMsg) {
        var _this = _super.call(this) || this;
        //message distribution
        _this._onEvent = null;
        /**on server connecting. */
        _this._onConnecting = null;
        /**on server connect successfully. */
        _this._onConnected = null;
        /**on connect to server failed. */
        _this._onConnectFailed = null;
        //on server disconnect
        _this._onDisConnected = null;
        //if auto reconnect
        _this._autoReconnect = true;
        // connection address            
        _this.mAddress = "127.0.0.1";
        // connect port.            
        _this.mPort = 443;
        //retry each 2 seconds.
        _this.mReconnectTimeout = 1000 * 2;
        //max retry time when connect failed. -1 not limit.
        _this._ReconnectTime = 3;
        /**disconnect ty game server*/
        _this.mServerKicked = false;
        /**current is reconnect：not first time to connect to game server */
        _this.mIsReconnect = false;
        _this.endian = Laya.Byte.LITTLE_ENDIAN;
        _this.on(Laya.Event.OPEN, _this, _this.onOpenHandler);
        _this.on(Laya.Event.CLOSE, _this, _this.onCloseHandler);
        _this.on(Laya.Event.MESSAGE, _this, _this.onRecvHandler);
        _this.on(Laya.Event.ERROR, _this, _this.onErrorHandler);
        _this._onConnecting = onConnecting;
        _this._onConnected = onConnected;
        _this._onConnectFailed = onConnectFailed;
        _this._onDisConnected = onDisconnected;
        _this._onEvent = onRecMsg;
        return _this;
    }
    Object.defineProperty(WebSocket.prototype, "AutoReconnect", {
        /**set auto reconnect status. */
        set: function (autoReconnect) {
            this._autoReconnect = autoReconnect;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * connect to server
     * @param ip connect address: support ip/
     * @param port port
     */
    WebSocket.prototype.connect = function (address, port) {
        this.mAddress = address;
        this.mPort = port;
        if (address.indexOf("wss://") > -1 || address.indexOf("ws://") > -1) {
            var url = address + ":" + port;
            _super.prototype.connectByUrl.call(this, url);
        }
        else {
            _super.prototype.connect.call(this, this.mAddress, this.mPort);
        }
    };
    /**
     * send buffer
     * @param byte byte buffer
     */
    WebSocket.prototype.sendMsg = function (byte) {
        byte.endian = Laya.Byte.LITTLE_ENDIAN;
        this.send(byte.buffer);
        byte.clear();
    };
    /**
     * 接收数据
     * @param message 网络数据
     */
    WebSocket.prototype.onRecvHandler = function (message) {
        try {
            if (!(message instanceof ArrayBuffer)) {
                var err = "Socket error: Message type is not a standard arraybuffer";
                Main_1.dzapp.Logger.error(err);
                return;
            }
            if (this._onEvent) {
                this._onEvent.runWith(message);
            }
        }
        catch (err) {
            Main_1.dzapp.Logger.error("Socket error: read buffer exception.", err);
        }
    };
    /**
     * connect successfully.
     * @param message received message data.
     */
    WebSocket.prototype.onOpenHandler = function (message) {
        //clear the reconnect timer
        Laya.timer.clear(this, this.reconnect);
        //reset the retry time
        this._ReconnectTime = 3;
        //print connected log.
        this.printLog("):Connection server successful");
        //connected callback.
        if (this.mIsReconnect && this._onConnected) {
            this.mIsReconnect = false;
            this._onConnected.run();
        }
    };
    /**
     * connection was interrupted
     */
    WebSocket.prototype.onCloseHandler = function () {
        if (this._autoReconnect) {
            if (this._ReconnectTime > 0 || this._ReconnectTime == -1) {
                this.mIsReconnect = true;
                this.mReconnectTimeout = this.resetReconectTime();
                //delay retry.
                Laya.timer.once(this.mReconnectTimeout, this, this.reconnect);
            }
        }
    };
    /**
     * reconnect timeout reset login here.
     */
    WebSocket.prototype.resetReconectTime = function () {
        return this.mReconnectTimeout * 1;
    };
    /**
     * current is kick time
     * @param date1
     * @param date2
     */
    WebSocket.prototype.isKickTime = function (date1, date2) {
        var n1 = date1.getTime();
        var n2 = date2.getTime();
        return ((n2 - n1) / 1000 / 60) < 5;
    };
    /**
     * connect failed.
     */
    WebSocket.prototype.onErrorHandler = function () {
        if (this._onConnectFailed) {
            this._onConnectFailed.run();
        }
        else {
            //print failed log
            this.printLog("Connection server failed");
        }
    };
    /**
     * reconnect to game server.
     */
    WebSocket.prototype.reconnect = function () {
        if (this.connected) {
            this.printLog("Discovering that the socket is connected when trying to reconnect. system will close it first.");
            try {
                this.close();
            }
            catch (e) {
                this.printLog("An error occurred while closing the connection.");
            }
        }
        if (this._ReconnectTime > 0) {
            this._ReconnectTime--;
        }
        this.printLog("try to reconnect...");
        this.connect(this.mAddress, this.mPort);
    };
    WebSocket.prototype.serverKickOff = function () {
        this.mServerKicked = true;
        this.mKickedTime = new Date();
    };
    /**
     * print log
     * @param msg message
     */
    WebSocket.prototype.printLog = function (msg) {
        //shoud be call eventlog module to handler this event. 
        Main_1.dzapp.Logger.info(msg);
    };
    return WebSocket;
}(Laya.Socket));
exports.default = WebSocket;
},{"../../../Main":3}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @brief : resource manager module.
 * @Author: Wenzuoli
 * @Date: 2019/04/09
 */
var ResourceMgr = /** @class */ (function (_super) {
    __extends(ResourceMgr, _super);
    function ResourceMgr() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 加载资源 允许：ResourceMgr.load(...).load(...)... 连接调用
     * @param url single resource url or url array。e.g.：["a.png","b.png"]；
     * @param complete	加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
     * @param progress	加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
     * @param type		资源类型。比如：Loader.IMAGE。
     * @param priority	(default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
     * @param cache		是否缓存加载结果。
     * @param group		分组，方便对资源进行管理。
     * @param ignoreCache	是否忽略缓存，强制重新加载。
     * @param useWorkerLoader(default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
     */
    ResourceMgr.loadRes = function (url, completed, progress, type, priority, cache, group, ignoreCache, useWorkerLoader) {
        //TODO:wenzuoli for laya library can't clear the res by group, so take a temp solution to management the resource.
        if (this.groupRes == null) {
            this.groupRes = new Laya.WeakObject();
        }
        if (group && group.length > 0) {
            this.groupRes.set(group, url);
        }
        return Laya.loader.load(url, completed, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
    };
    /**
      * 清理指定资源地址缓存。
      * @param	url 资源地址。
     */
    ResourceMgr.clearRes = function (url) {
        Laya.loader.clearRes(url);
    };
    /**
     * clear resource by group name。
     * @param group 分组名
     */
    ResourceMgr.clearResByGroup = function (groupName) {
        Laya.loader.clearResByGroup(groupName);
        //TODO:wenzuoli . because the laya library clear by gorup has some question.e.g. can't clear. will check later.
        var resList = this.groupRes.get(groupName);
        if (resList) {
            for (var i = 0; i < resList.length; i++) {
                if (resList[i] instanceof String) {
                    this.clearRes(resList[i]);
                }
                else {
                    resList[i].url && this.clearRes(resList[i].url);
                }
            }
        }
    };
    /**
    * 销毁Texture使用的图片资源，保留texture壳，如果下次渲染的时候，发现texture使用的图片资源不存在，则会自动恢复
    * 相比clearRes，clearTextureRes只是清理texture里面使用的图片资源，并不销毁texture，再次使用到的时候会自动恢复图片资源
    * 而clearRes会彻底销毁texture，导致不能再使用；clearTextureRes能确保立即销毁图片资源，并且不用担心销毁错误，clearRes则采用引用计数方式销毁
    * 【注意】如果图片本身在自动合集里面（默认图片小于512*512），内存是不能被销毁的，此图片被大图合集管理器管理
    * @param	url	图集地址或者texture地址，比如 Loader.clearTextureRes("res/atlas/comp.atlas"); Loader.clearTextureRes("hall/bg.jpg");
    */
    ResourceMgr.clearTextureRes = function (url) {
        Laya.loader.clearTextureRes(url);
    };
    /**
    * 获取指定资源地址的资源。
    * @param	url 资源地址。
    * @return	返回资源。
    */
    ResourceMgr.getRes = function (url) {
        return Laya.loader.getRes(url);
    };
    ResourceMgr.groupRes = null;
    return ResourceMgr;
}(Laya.LoaderManager));
exports.default = ResourceMgr;
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * History: 1. add mini-program support. 2018/12/11 WenZuoli
*/
var AudioEngine = Laya.SoundManager;
/**
 * 声音管理
 * @History: 1. add mini-program support. 2018/12/11 WenZuoli
 */
var SoundManager = /** @class */ (function () {
    /** cache sound files path */
    //private SoundSet:Laya.Dictionary;
    function SoundManager() {
        /** 音乐状态 */
        this.mMusicState = true;
        /** 音效状态 */
        this.mEffectState = true;
        /**storage key for the background music. */
        this.STOREGEKEY_BACKGROUND_MUSIC = "background_music_onoff";
        /**storage key for the sound effect. */
        this.STOREGEKEY_SOUND_EFFECT = "SoundEffect_onoff";
        /**save key prefix */
        this.KEY_PREFIX = "";
        //this.loadLocalConfigs(); 
        // 跟随设备静音
        AudioEngine.useAudioMusic = false;
        //this.SoundSet = new Laya.Dictionary();
    }
    /**
     * 获取本地配置
     */
    SoundManager.prototype.loadLocalConfigs = function (acc) {
        //init account or key
        this.KEY_PREFIX = acc;
        //背景音乐状态
        var _mstatus = this.getStorageItem(this.STOREGEKEY_BACKGROUND_MUSIC);
        var _musicStatus = _mstatus == null || _mstatus == undefined || _mstatus == "true" || _mstatus == true || _mstatus === "";
        this.mMusicState = _musicStatus;
        // let musicStatus:any = Laya.LocalStorage.getItem(this.STOREGEKEY_BACKGROUND_MUSIC)||"true"; 
        // this.mBackgroundMusicOn = musicStatus=="true";
        //背景音效状态
        var _sstatus = this.getStorageItem(this.STOREGEKEY_SOUND_EFFECT);
        var _soundstatus = _sstatus == null || _sstatus == undefined || _sstatus == "true" || _sstatus == true || _sstatus === "";
        this.mEffectState = _soundstatus;
        // let soundStatus:any = Laya.LocalStorage.getItem(this.STOREGEKEY_SOUND_EFFECT)||"true";  
        // this.mSoundEffectOn = soundStatus=="true";
        //跟随设备静音
        //Laya.SoundManager.useAudioMusic=false
    };
    /**
     * save item to local storage
     * @param itemKey item key
     * @param value
     */
    SoundManager.prototype.saveStorageItem = function (itemKey, value) {
        // if(bestapp.utils.GameVerify.isMinProgramMode()){
        //     try{
        //         console.log("update status:"+itemKey+":"+value+",curr:"+this.mMusicState);
        //         wx.setStorageSync(itemKey,value);
        //     }catch(e){
        //         printError("Save sound setting into starage failed. ")
        //     }
        // }else{
        Laya.LocalStorage.setItem(this.KEY_PREFIX.concat(itemKey), value);
        //}
    };
    /**
     * get item by key from local storage
     * @param key item key
     */
    SoundManager.prototype.getStorageItem = function (itemKey) {
        // if(bestapp.utils.GameVerify.isMinProgramMode()){
        //     return wx.getStorageSync(itemKey);
        // }else{
        return Laya.LocalStorage.getItem(this.KEY_PREFIX.concat(itemKey));
        //}
    };
    /**
     * 获取音乐播放状态
     */
    SoundManager.prototype.getMusicState = function () {
        console.log("current status:" + this.mMusicState);
        return this.mMusicState;
    };
    /**
     * 设置音乐播放状态
     * @param state 播放状态
     */
    SoundManager.prototype.setMusicState = function (state) {
        this.mMusicState = state;
        //this.saveStorageItem(this.STOREGEKEY_BACKGROUND_MUSIC,state); 
    };
    /**
     * 获取音效播放状态
     */
    SoundManager.prototype.getEffectState = function () {
        return this.mEffectState;
    };
    /**
     * 设置音效播放状态
     * @param state 播放状态
     */
    SoundManager.prototype.setEffectState = function (state) {
        this.mEffectState = state;
        //this.saveStorageItem(this.STOREGEKEY_SOUND_EFFECT,state); 
    };
    /**
     * 停止播放所有声音（包括背景音乐和音效）
     */
    SoundManager.prototype.stopAll = function () {
        AudioEngine.stopAll();
    };
    /**
     * 停止声音播放。此方法能够停止任意声音的播放（包括背景音乐和音效），只需传入对应的声音播放地址
     * @param url 声音文件地址
     */
    SoundManager.prototype.stopSound = function (url) {
        AudioEngine.stopSound(url);
    };
    /**
     * 停止播放所有音效（不包括背景音乐）
     */
    SoundManager.prototype.stopAllSound = function () {
        AudioEngine.stopAllSound();
    };
    /**
     * 播放音效。音效可以同时播放多个
     * @param url 声音文件地址
     * @param loops 循环次数,0表示无限循环
     * @param complete 声音播放完成回调  Handler对象
     * @param soundClass 使用哪个声音类进行播放，null表示自动选择
     * @param startTime 声音播放起始时间
     */
    SoundManager.prototype.playSound = function (url, loops, complete, soundClass, startTime) {
        if (this.mEffectState) {
            AudioEngine.playSound(url, loops, complete, soundClass, startTime);
            //还有问题，暂未开放
            // if(bestapp.utils.GameVerify.isMinProgramMode()){
            //     if(this.mEffectState){
            //         let _temUrl = this.SoundSet.get(url); 
            //         if(_temUrl!=null){
            //             AudioEngine.playSound(_temUrl, loops, complete, soundClass, startTime);
            //         }else{
            //             this.downloadWebSound(url);
            //         }
            //     }
            // }else{
            //     AudioEngine.playSound(url, loops, complete, soundClass, startTime);
            // }
        }
    };
    /**
     * 停止播放背景音乐 (不包括音效)
     */
    SoundManager.prototype.stopMusic = function () {
        AudioEngine.stopMusic();
    };
    /**
     * 播放背景音乐
     * @param url 声音文件地址
     * @param loops 循环次数, 0表示无限循环
     * @param complete 声音播放完成回调
     * @param startTime 声音播放起始时间
     */
    SoundManager.prototype.playMusic = function (url, loops, complete, startTime) {
        if (this.mMusicState) {
            AudioEngine.stopMusic();
            AudioEngine.playMusic(url, loops, complete, startTime);
        }
    };
    /**
     * 释放声音资源
     * @param url 声音播放地址
     */
    SoundManager.prototype.destroySound = function (url) {
        AudioEngine.destroySound(url);
    };
    /**
     * 设置声音音量。根据参数不同，可以分别设置指定声音（背景音乐或音效）音量或者所有音效（不包括背景音乐）音量
     * @param volume 音量。初始值为1。音量范围从 0（静音）至 1（最大音量）
     * @param url (default = null)声音播放地址。默认为null。为空表示设置所有音效（不包括背景音乐）的音量，不为空表示设置指定声音（背景音乐或音效）的音量
     */
    SoundManager.prototype.setSoundVolume = function (volume, url) {
        AudioEngine.setSoundVolume(volume, url);
    };
    /**
     * 设置背景音乐音量。音量范围从 0（静音）至 1（最大音量）
     * @param volume 音量。初始值为1。音量范围从 0（静音）至 1（最大音量）
     */
    SoundManager.prototype.setMusicVolume = function (volume) {
        AudioEngine.setMusicVolume(volume);
    };
    /**
     * download sound file and play.
     * @param url reslurce path,like this: audio/aaa.mp3
     * @param loops loops
     * @param complete complete callback
     * @param soundClass
     * @param startTime start time
     */
    SoundManager.prototype.downloadWebSound = function (url, loops, complete, soundClass, startTime) {
        var _temUrl = Laya.URL.formatURL(url);
        var _this = this;
        // wx.downloadFile({
        //     url:_temUrl,
        //     success:function(res){
        //         dzapp.mLogger.debug("download operaton success:"+JSON.stringify(res));
        //         if(res.statusCode==200){
        //             _this.SoundSet.set(url,res.tempFilePath);
        //             AudioEngine.playSound(res.tempFilePath, loops, complete, soundClass, startTime);
        //         }
        //     },fail:{
        //         //dzapp.mLogger.error("download failed:"+JSON.stringify(res));
        //         AudioEngine.playSound(url, loops, complete, soundClass, startTime);
        //     }
        // });
    };
    return SoundManager;
}());
exports.SoundManager = SoundManager;
},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameItem = /** @class */ (function () {
    function GameItem(key, res, scene) {
        this.mGameKey = key;
        this.mGameRes = res;
        this.mGameView = scene;
    }
    return GameItem;
}());
exports.default = GameItem;
},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../../Main");
var LobbyData = /** @class */ (function () {
    function LobbyData() {
        this.eventListen();
        this.start();
    }
    Object.defineProperty(LobbyData, "Instant", {
        get: function () {
            return this._instant;
        },
        enumerable: true,
        configurable: true
    });
    LobbyData.init = function () {
        this._instant = this.Instant || new LobbyData();
    };
    LobbyData.prototype.eventListen = function () {
    };
    LobbyData.prototype.start = function () {
        Main_1.dzapp.enterLobby();
    };
    LobbyData._instant = null;
    return LobbyData;
}());
exports.default = LobbyData;
},{"../../../Main":3}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalPlayer = /** @class */ (function () {
    function LocalPlayer() {
        /**
         * 网络加载步骤：0未进行加载；1加载预加载资源完毕；2：加载游戏资源完毕；3：进入游戏
         */
        this.mClientLoadStep = 0;
        this.mLoginPlat = "";
        this.mAccount = "";
        this.mPassword = "";
        this.mRegSite = "";
        this.mSiteNum = 0;
        /** 玩家Id */
        this.mUserId = 0;
        /** 玩家昵称 */
        this.mNickName = "";
        /**YY帐号 */
        this.mYYAccount = "";
        /** 玩家头像 */
        this.mFace = "";
        /** 玩家金币/金豆 */
        this.mGold = 0;
        this.mDZCash = 0;
        /**
         * 礼券
         */
        this.mLiQuan = 0;
        this.mBean = 0;
        this.mHomePeas = 0;
        /** 玩家性别 */
        this.mSex = 0;
        this.mLastRoomName = "";
        this.mLastRoomId = 0;
        this.mGameKey = "";
        this.mPortKey = "";
        this.mMd5 = "";
        this.mIsNewUser = 0;
        this.mBBSUrl = "";
        /** 所在城市 */
        this.mCity = "";
        this.mChannelId = 0;
        /** 玩家经验 */
        this.mGameExp = 0;
        /** 能否坐下 */
        this.mCanSit = 0;
        this.mTourPoint = 0;
        // theApp.events.on(protocol.land.GC2C_PLAYERINFO,this, this.refreshUserInfoByGC);
        // theApp.events.on(protocol.land.GC2C_PLAYERINFOEX,this, this.refreshUserInfoByGCEx);
        // theApp.events.on(protocol.land.GS2C_USERDATA, this, this.refreshUserInfoByGS);
        // theApp.events.on(protocol.land.GS2C_LIQUAN_NUM,this,this.refreshLiQuanByGS);
        // theApp.events.on(protocol.land.GS2C_REGB,this,this.refreshUserGold);
    }
    /**
     * show user gold as short string.
     */
    LocalPlayer.prototype.getShortGoldString = function () {
        return Number.ToShortString(this.mGold);
    };
    /**
     * show user LiQuan as short string.
     */
    LocalPlayer.prototype.getShortLiQuanString = function () {
        return Number.ToShortString(this.mLiQuan);
    };
    /**
     * 刷新金币
     * @param data 数据流
     */
    LocalPlayer.prototype.refreshUserGold = function (data) {
        this.mGold = data.getInt32();
        this.mDZCash = data.getInt32();
        this.mBean = data.getInt32();
        this.mHomePeas = data.getInt32();
    };
    /**
     * 更新玩家数据by gc
     */
    LocalPlayer.prototype.refreshUserInfoByGC = function (message) {
        this.mUserId = message.getInt32();
        this.mNickName = message.getUTFString();
        this.mFace = message.getUTFString();
        this.mGold = message.getInt32();
        this.mDZCash = message.getInt32();
        this.mBean = message.getInt32();
        this.mHomePeas = message.getInt32();
        this.mSex = message.getInt32();
    };
    /**
     * 更新玩家数据by gc Ex
     */
    LocalPlayer.prototype.refreshUserInfoByGCEx = function (message) {
        this.mUserId = message.getInt32();
        this.mNickName = message.getUTFString();
        this.mFace = message.getUTFString();
        this.mGold = message.getInt32();
        this.mDZCash = message.getInt32();
        this.mBean = message.getInt32();
        this.mHomePeas = message.getInt32();
        this.mSex = message.getInt32();
        this.mYYAccount = message.getUTFString();
    };
    /**
     * 更新玩家数据by gs
     */
    LocalPlayer.prototype.refreshUserInfoByGS = function (message) {
        this.mPortKey = message.getUTFString();
        this.mSex = message.getByte();
        this.mNickName = message.getUTFString();
        this.mFace = message.getUTFString();
        this.mGold = message.getInt32();
        this.mDZCash = message.getInt32();
        this.mBean = message.getInt32();
        this.mHomePeas = message.getInt32();
        this.mCity = message.getUTFString();
        this.mChannelId = message.getInt32();
        this.mUserId = message.getInt32();
        this.mMd5 = message.getUTFString();
        this.mGameExp = message.getInt32();
        this.mCanSit = message.getInt32();
        this.mTourPoint = message.getInt32();
    };
    /**
     * 更新玩家礼券数据by gs
     */
    LocalPlayer.prototype.refreshLiQuanByGS = function (message) {
        this.mLiQuan = message.getInt32();
        //theApp.events.event(protocol.land.GS2C_LIQUAN_NUM_CHANGE);
    };
    /**
     * get the head image of the current player.
     */
    LocalPlayer.prototype.getHeadImage = function () {
        return this.mSex < 1 ? "game/landlords/head/girl.png" : "game/landlords/head/boy.png";
    };
    return LocalPlayer;
}());
exports.default = LocalPlayer;
},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../Main");
var LoginHandler = /** @class */ (function () {
    function LoginHandler() {
        this.mOnLogined = null;
    }
    /**
     * Login to system.
     * @param account account
     * @param pwd password
     */
    LoginHandler.prototype.login = function (account, pwd, site, onLogined) {
        if (site === void 0) { site = 0; }
        this.mOnLogined = onLogined;
        Main_1.dzapp.showLoading();
        Main_1.dzapp.Net.loginToGC(account, pwd, site);
    };
    LoginHandler.prototype.initLoginData = function (byte) {
        Main_1.dzapp.hideLoading();
        //off 
        Main_1.dzapp.Events.off(0, "RELG", this);
        Main_1.dzapp.Logger.info("login callback.");
        var statu = byte.getUint16();
        if (Main_1.dzapp && statu == 1) {
            // 更新玩家数据
            Main_1.dzapp.Player.mClientLoadStep = 3;
            Main_1.dzapp.Player.mLastRoomName = byte.getUTFString();
            Main_1.dzapp.Player.mLastRoomId = byte.getInt32();
            Main_1.dzapp.Player.mUserId = byte.getInt32();
            Main_1.dzapp.Player.mGameKey = byte.getUTFString();
            Main_1.dzapp.Player.mMd5 = byte.getUTFString();
            Main_1.dzapp.Player.mIsNewUser = byte.getByte();
            Main_1.dzapp.Player.mNickName = byte.getUTFString();
            Main_1.dzapp.Player.mBBSUrl = byte.getUTFString();
            this.afterLogin();
        }
        else {
            Main_1.dzapp.showToast("login failed.");
            Main_1.dzapp.showLoginPanel();
        }
    };
    /**
     * after login to system .success
     */
    LoginHandler.prototype.afterLogin = function () {
        if (this.mOnLogined) {
            this.mOnLogined.run();
        }
        else {
            Main_1.dzapp.Logger.info("login success with no handler.");
        }
    };
    return LoginHandler;
}());
exports.default = LoginHandler;
},{"../../Main":3}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RandomMgr = /** @class */ (function () {
    function RandomMgr() {
    }
    RandomMgr.uuid = function () {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    };
    return RandomMgr;
}());
exports.default = RandomMgr;
},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
/**
 * @brief : loading view
 * @Author: Wenzuoli
 * @Date: 2019/04/08
 */
var LoadingView = /** @class */ (function (_super) {
    __extends(LoadingView, _super);
    function LoadingView() {
        var _this = _super.call(this) || this;
        _this.short = true;
        return _this;
    }
    LoadingView.prototype.createChildren = function () {
        _super.prototype.createChildren.call(this);
    };
    LoadingView.prototype.onEnable = function () {
        Laya.timer.loop(500, this, this.changeFont);
    };
    LoadingView.prototype.changeFont = function () {
        this.short = !this.short;
        var msg = "Loading";
        this.lblTips.text = this.short ? "Loading." : ".Loading";
    };
    LoadingView.prototype.onDestroy = function () {
        Laya.timer.clear(this, this.changeFont);
    };
    return LoadingView;
}(layaMaxUI_1.ui.dzgame.common.LoadingUI));
exports.default = LoadingView;
},{"../../../ui/layaMaxUI":33}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
var MaskView = /** @class */ (function (_super) {
    __extends(MaskView, _super);
    function MaskView() {
        return _super.call(this) || this;
    }
    MaskView.prototype.createChildren = function () {
        _super.prototype.createChildren.call(this);
    };
    MaskView.prototype.onEnable = function () {
    };
    return MaskView;
}(layaMaxUI_1.ui.dzgame.common.MaskUI));
exports.default = MaskView;
},{"../../../ui/layaMaxUI":33}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
var Main_1 = require("../../../Main");
var ProgressView = /** @class */ (function (_super) {
    __extends(ProgressView, _super);
    function ProgressView() {
        return _super.call(this) || this;
    }
    ProgressView.prototype.createChildren = function () {
        _super.prototype.createChildren.call(this);
    };
    ProgressView.prototype.onEnable = function () {
    };
    ProgressView.prototype.progressChange = function (val) {
        this.lblTips.text = "progress ".concat((val * 100).toString(), "%");
        Main_1.dzapp.Logger.info(this.lblTips.text);
    };
    return ProgressView;
}(layaMaxUI_1.ui.dzgame.common.ProgressUI));
exports.default = ProgressView;
},{"../../../Main":3,"../../../ui/layaMaxUI":33}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
var ToastView = /** @class */ (function (_super) {
    __extends(ToastView, _super);
    function ToastView(msg) {
        var _this = _super.call(this) || this;
        _this.mMessage = "";
        _this.mCloseHandler = null;
        _this.mDisplayTime = 0.5;
        _this.mMessage = msg;
        return _this;
    }
    ToastView.prototype.createChildren = function () {
        _super.prototype.createChildren.call(this);
    };
    ToastView.prototype.onEnable = function () {
        this.lblTips.text = this.mMessage;
        Laya.Tween.to(this.lblTips, { y: 344, alpha: 1 }, 800, Laya.Ease.strongOut, Laya.Handler.create(this, this.delayClose));
    };
    /**
     * delay close the toast view
     */
    ToastView.prototype.delayClose = function () {
        Laya.timer.once(1000 * this.mDisplayTime, this, this.hideToast);
    };
    /**
     * exit toast view
     */
    ToastView.prototype.hideToast = function () {
        Laya.Tween.to(this.lblTips, { alpha: 0, y: 152 }, 900, Laya.Ease.strongOut, Laya.Handler.create(this, this.destroyMsg));
    };
    ToastView.prototype.destroyMsg = function () {
        this.destroy(true);
    };
    return ToastView;
}(layaMaxUI_1.ui.dzgame.common.ToastUI));
exports.default = ToastView;
},{"../../../ui/layaMaxUI":33}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../../Main");
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
var res_1 = require("../../../games/landlords/confs/res");
var lanlobby_1 = require("../../../games/landlords/views/lanlobby");
var gamesview_1 = require("../../../games/global/gamesview");
var LobbyView = /** @class */ (function (_super) {
    __extends(LobbyView, _super);
    function LobbyView() {
        return _super.call(this) || this;
    }
    LobbyView.prototype.onEnable = function () {
        this.eventBind();
        this.eventListen();
    };
    LobbyView.prototype.showGames = function () {
        var games = new gamesview_1.default();
        games.zOrder = 1;
        this.addChild(games);
    };
    LobbyView.prototype.eventListen = function () {
        Main_1.dzapp.Events.Listen(1, "RELG", this, this.afterLogin);
    };
    LobbyView.prototype.afterLogin = function (data) {
        Main_1.dzapp.Logger.info("login callback.");
        var statu = data.getUint16();
    };
    LobbyView.prototype.eventBind = function () {
        this.btnDDZ && this.btnDDZ.on(Laya.Event.CLICK, this, this.onClick);
        this.btnLogin && this.btnLogin.on(Laya.Event.CLICK, this, this.onLogin);
    };
    LobbyView.prototype.createChildren = function () {
        _super.prototype.createChildren.call(this);
        this.showGames();
        //Laya.loader.load("GameLobby/Lobby.scene");
    };
    LobbyView.prototype.onLogin = function () {
        //dzapp.Net.LoginToGC("111","11",0)
        //dzapp.showToast("on click the login button.");
        Main_1.dzapp.openGame(new lanlobby_1.default(), res_1.lanres.lobby);
        // dzapp.openGame("LanLobby",lanres.lobby);
    };
    LobbyView.prototype.onClick = function () {
        Main_1.dzapp.Net.enterGame("query", "ddz_free");
    };
    return LobbyView;
}(layaMaxUI_1.ui.dzgame.GameLobby.LobbyUI));
exports.default = LobbyView;
},{"../../../Main":3,"../../../games/global/gamesview":27,"../../../games/landlords/confs/res":28,"../../../games/landlords/views/lanlobby":30,"../../../ui/layaMaxUI":33}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../../Main");
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
var LoginHandler_1 = require("../../presenters/LoginHandler");
var PreloadView = /** @class */ (function (_super) {
    __extends(PreloadView, _super);
    function PreloadView() {
        return _super.call(this) || this;
    }
    PreloadView.prototype.enterLobby = function () {
        Main_1.dzapp.enterLobby();
    };
    // createChildren():void{
    //    // super.createChildren();
    // }
    PreloadView.prototype.onEnable = function () {
        this.eventListen();
        this.eventBind();
    };
    PreloadView.prototype.eventBind = function () {
        this.btnLogin && (this.btnLogin.visible = true) && this.btnLogin.on(Laya.Event.CLICK, this, this.onClick);
    };
    PreloadView.prototype.eventListen = function () {
        Main_1.dzapp.Events.Listen(1, "RELG", this, this.onLogin);
    };
    PreloadView.prototype.onLogin = function (byte) {
        this.login.initLoginData(byte);
    };
    // private afterLogin(byte:Laya.Byte):void{
    //     //off 
    //     dzapp.Events.off(0,"RELG", this);
    //     dzapp.Logger.info("login callback.");
    //     let statu:number = byte.getUint16();
    //     if(dzapp){
    //          // 更新玩家数据
    //         dzapp.Player.mClientLoadStep  = 3;
    //         dzapp.Player.mLastRoomName    = byte.getUTFString();
    //         dzapp.Player.mLastRoomId      = byte.getInt32();
    //         dzapp.Player.mUserId          = byte.getInt32();
    //         dzapp.Player.mGameKey         = byte.getUTFString();
    //         dzapp.Player.mMd5             = byte.getUTFString();
    //         dzapp.Player.mIsNewUser       = byte.getByte();
    //         dzapp.Player.mNickName        = byte.getUTFString();
    //         dzapp.Player.mBBSUrl          = byte.getUTFString(); 
    //         dzapp.Logger.error("UserID:"+dzapp.Player.mUserId);
    //         dzapp.enterLobby();
    //     }
    // }
    PreloadView.prototype.onClick = function () {
        //dzapp.Net.LoginToGC("111","11",0)
        this.login = new LoginHandler_1.default();
        this.login.login("11", "11", 0, Laya.Handler.create(this, this.enterLobby));
    };
    return PreloadView;
}(layaMaxUI_1.ui.dzgame.common.PreloadUI));
exports.default = PreloadView;
},{"../../../Main":3,"../../../ui/layaMaxUI":33,"../../presenters/LoginHandler":19}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var layaMaxUI_1 = require("../../ui/layaMaxUI");
var Main_1 = require("../../Main");
var res_1 = require("../landlords/confs/res");
var lanlobby_1 = require("../landlords/views/lanlobby");
var szres_1 = require("../sanzhang/define/szres");
var lanlobbydata_1 = require("../landlords/data/lanlobbydata");
var szlobby_1 = require("../sanzhang/views/szlobby");
var GamesView = /** @class */ (function (_super) {
    __extends(GamesView, _super);
    function GamesView() {
        var _this = _super.call(this) || this;
        _this.mServerList = null;
        _this.mServerList = new Array();
        _this.eventListen();
        return _this;
    }
    GamesView.prototype.eventListen = function () {
        Main_1.dzapp.Events.Listen(1, "REGI", this, this.getRoomList);
    };
    GamesView.prototype.onEnable = function () {
        this.btnLan.on(Laya.Event.CLICK, this, this.openGame, [1]);
        this.btnSZ.on(Laya.Event.CLICK, this, this.openGame, [2]);
    };
    GamesView.prototype.openGame = function (num) {
        if (num == 1) {
            Main_1.dzapp.Net.enterGame("query", "ddz_free");
        }
        else {
            var lan = new szlobby_1.default();
            Main_1.dzapp.openGame(lan, szres_1.szres.lobby);
        }
    };
    GamesView.prototype.getRoomList = function (data) {
        lanlobbydata_1.default.instance.initServers(data);
        this.openDDZ();
    };
    GamesView.prototype.openDDZ = function () {
        var lan = new lanlobby_1.default();
        Main_1.dzapp.openGame(lan, res_1.lanres.lobby);
    };
    return GamesView;
}(layaMaxUI_1.ui.games.globalview.gamesUI));
exports.default = GamesView;
},{"../../Main":3,"../../ui/layaMaxUI":33,"../landlords/confs/res":28,"../landlords/data/lanlobbydata":29,"../landlords/views/lanlobby":30,"../sanzhang/define/szres":31,"../sanzhang/views/szlobby":32}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lanres = /** @class */ (function () {
    function lanres() {
    }
    lanres.lobby = [
        { url: "games/landords/lobby/main.png", type: Laya.Loader.IMAGE },
        { url: "games/landords/lobby/kuangkuang.sk", type: Laya.Loader.BUFFER },
        { url: "games/landords/lobby/kuangkuang.png", type: Laya.Loader.IMAGE },
    ];
    return lanres;
}());
exports.lanres = lanres;
},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lanLobbyData = /** @class */ (function () {
    function lanLobbyData() {
        this.mServerList = null;
        this.mServerList = new Array();
    }
    Object.defineProperty(lanLobbyData, "instance", {
        get: function () {
            if (lanLobbyData.mInstance == null) {
                lanLobbyData.mInstance = new lanLobbyData();
            }
            return lanLobbyData.mInstance;
        },
        enumerable: true,
        configurable: true
    });
    lanLobbyData.prototype.getServers = function () {
        return this.mServerList;
    };
    lanLobbyData.prototype.initServers = function (data) {
        var groupid = "";
        this.mServerList.length = 0;
        var name = data.getUTFString();
        while ((groupid = data.getUTFString()) != "" && data.pos < data.length) {
            var item = {};
            item["groupid"] = groupid;
            item["groupname"] = data.getUTFString();
            item["gamepeilv"] = data.getInt32();
            item["ip"] = data.getUTFString();
            item["port"] = data.getInt32();
            item["curronline"] = data.getInt32();
            item["maxonline"] = data.getInt32();
            item["isguildroom"] = data.getInt32();
            item["istourroom"] = data.getInt32();
            item["at_least_gold"] = data.getInt32();
            item["at_most_gold"] = data.getInt32();
            item["ishighroom"] = data.getInt32();
            item["ishuanle"] = data.getInt32();
            item["nocheat"] = data.getInt32();
            item["choushui"] = data.getInt32();
            item["name"] = name;
            this.mServerList.push(item);
        }
    };
    lanLobbyData.mInstance = null;
    return lanLobbyData;
}());
exports.default = lanLobbyData;
},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
var Main_1 = require("../../../Main");
var lanlobbydata_1 = require("../data/lanlobbydata");
var LanLobbyView = /** @class */ (function (_super) {
    __extends(LanLobbyView, _super);
    function LanLobbyView() {
        var _this = _super.call(this) || this;
        _this.mRoomId = 0;
        return _this;
    }
    LanLobbyView.prototype.onEnable = function () {
        this.eventListen();
        this.showRooms();
        this.eventBinding();
    };
    LanLobbyView.prototype.eventListen = function () {
        Main_1.dzapp.Events.Listen(1, "gs_conneted", this, this.startGame);
    };
    LanLobbyView.prototype.eventBinding = function () {
        this.btnBack.on(Laya.Event.CLICK, this, this.gotoLobby);
        this.btnRoom.on(Laya.Event.CLICK, this, this.enterRoom);
    };
    LanLobbyView.prototype.showRooms = function () {
        var servers = lanlobbydata_1.default.instance.getServers();
        this.lblTips.text = "Welcome " + Main_1.dzapp.Player.mNickName + ",id:" + Main_1.dzapp.Player.mUserId + "\n Room List Count:" + servers.length;
    };
    LanLobbyView.prototype.gotoLobby = function () {
        Main_1.dzapp.enterLobby();
    };
    LanLobbyView.prototype.enterRoom = function () {
        Main_1.dzapp.Net.enterRoom("enter", "ddz_free", parseInt(lanlobbydata_1.default.instance.getServers()[0].groupid));
    };
    LanLobbyView.prototype.startGame = function (byte) {
        this.mRoomId = byte.getInt32();
        var result = byte.getInt32();
        if (1 == result) {
            Main_1.dzapp.showToast("进入房间...roomid:" + this.mRoomId);
            this.btnSend.on(Laya.Event.CLICK, this, this.sendMessage);
        }
    };
    LanLobbyView.prototype.sendMessage = function () {
        Main_1.dzapp.Net.sendMsgPackage(this.mRoomId, "xxxxx", 1, 2, 3);
        Main_1.dzapp.Net.sendMsg(this.mRoomId, "xxxxx", new Laya.Byte());
    };
    return LanLobbyView;
}(layaMaxUI_1.ui.games.landrods.LanLobbyUI));
exports.default = LanLobbyView;
},{"../../../Main":3,"../../../ui/layaMaxUI":33,"../data/lanlobbydata":29}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var szres = /** @class */ (function () {
    function szres() {
    }
    szres.lobby = [
        { url: "games/sanzhang/main1.png", type: Laya.Loader.IMAGE }
    ];
    return szres;
}());
exports.szres = szres;
},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
var Main_1 = require("../../../Main");
//export module dzgames{ 
var szlobbyview = /** @class */ (function (_super) {
    __extends(szlobbyview, _super);
    function szlobbyview() {
        return _super.call(this) || this;
    }
    //public btnBack:Laya.Button;
    szlobbyview.prototype.onEnable = function () {
        // this.btnBack.on(Laya.Event.CLICK,this,this.gotoLobby); 
    };
    szlobbyview.prototype.gotoLobby = function () {
        Main_1.dzapp.enterLobby();
    };
    return szlobbyview;
}(layaMaxUI_1.ui.games.sanzhang_example.szlobbyUI));
exports.default = szlobbyview;
//}
},{"../../../Main":3,"../../../ui/layaMaxUI":33}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
var BaseView_1 = require("../dzgames/components/dzpage/BaseView");
var BaseScene_1 = require("../dzgames/components/dzpage/BaseScene");
var ui;
(function (ui) {
    var dzgame;
    (function (dzgame) {
        var common;
        (function (common) {
            var LoadingUI = /** @class */ (function (_super) {
                __extends(LoadingUI, _super);
                function LoadingUI() {
                    return _super.call(this) || this;
                }
                LoadingUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(LoadingUI.uiView);
                };
                LoadingUI.uiView = { "type": "BaseView", "props": { "width": 1728, "height": 864 }, "compId": 2, "child": [{ "type": "Label", "props": { "y": 375, "x": 668, "var": "lblTips", "text": "loading...", "fontSize": 35, "color": "#FFFFFF", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "loadList": [], "loadList3D": [] };
                return LoadingUI;
            }(BaseView_1.default));
            common.LoadingUI = LoadingUI;
            var MaskUI = /** @class */ (function (_super) {
                __extends(MaskUI, _super);
                function MaskUI() {
                    return _super.call(this) || this;
                }
                MaskUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(MaskUI.uiView);
                };
                MaskUI.uiView = { "type": "BaseView", "props": { "width": 1728, "renderType": "mask", "height": 864, "autoDestroyAtClosed": true }, "compId": 2, "loadList": [], "loadList3D": [] };
                return MaskUI;
            }(BaseView_1.default));
            common.MaskUI = MaskUI;
            var PreloadUI = /** @class */ (function (_super) {
                __extends(PreloadUI, _super);
                function PreloadUI() {
                    return _super.call(this) || this;
                }
                PreloadUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(PreloadUI.uiView);
                };
                PreloadUI.uiView = { "type": "BaseScene", "props": { "width": 1728, "name": "gameBox", "height": 864 }, "compId": 1, "child": [{ "type": "Sprite", "props": { "y": 0, "x": 0, "width": 1336, "name": "UI", "height": 750 }, "compId": 14, "child": [{ "type": "Label", "props": { "y": 375, "x": 668, "var": "lblTips", "valign": "middle", "text": "Game is starting,Pls wait...", "fontSize": 40, "color": "#c6302e", "anchorY": 0.5, "anchorX": 0.5, "align": "center" }, "compId": 16 }, { "type": "Sprite", "props": { "y": 329, "x": 326, "texture": "test/c1.png" }, "compId": 22 }, { "type": "Button", "props": { "y": 367.5, "x": 931, "visible": false, "var": "btnLogin", "skin": "comp/button.png", "label": "login" }, "compId": 25 }] }], "loadList": ["test/c1.png", "comp/button.png"], "loadList3D": [] };
                return PreloadUI;
            }(BaseScene_1.default));
            common.PreloadUI = PreloadUI;
            var ProgressUI = /** @class */ (function (_super) {
                __extends(ProgressUI, _super);
                function ProgressUI() {
                    return _super.call(this) || this;
                }
                ProgressUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(ProgressUI.uiView);
                };
                ProgressUI.uiView = { "type": "BaseView", "props": { "width": 1728, "height": 750 }, "compId": 2, "child": [{ "type": "Label", "props": { "y": 375, "x": 668, "var": "lblTips", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "loadList": [], "loadList3D": [] };
                return ProgressUI;
            }(BaseView_1.default));
            common.ProgressUI = ProgressUI;
            var ToastUI = /** @class */ (function (_super) {
                __extends(ToastUI, _super);
                function ToastUI() {
                    return _super.call(this) || this;
                }
                ToastUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(ToastUI.uiView);
                };
                ToastUI.uiView = { "type": "BaseView", "props": { "width": 1728, "height": 864 }, "compId": 2, "child": [{ "type": "Label", "props": { "y": 375, "x": 668, "var": "lblTips", "text": "-", "fontSize": 45, "color": "#FFFFFF", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "loadList": [], "loadList3D": [] };
                return ToastUI;
            }(BaseView_1.default));
            common.ToastUI = ToastUI;
        })(common = dzgame.common || (dzgame.common = {}));
    })(dzgame = ui.dzgame || (ui.dzgame = {}));
})(ui = exports.ui || (exports.ui = {}));
(function (ui) {
    var dzgame;
    (function (dzgame) {
        var GameLobby;
        (function (GameLobby) {
            var LobbyUI = /** @class */ (function (_super) {
                __extends(LobbyUI, _super);
                function LobbyUI() {
                    return _super.call(this) || this;
                }
                LobbyUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(LobbyUI.uiView);
                };
                LobbyUI.uiView = { "type": "BaseScene", "props": { "width": 1728, "name": "Lobby", "height": 864 }, "compId": 2, "child": [{ "type": "Button", "props": { "y": 363.5, "x": 614, "var": "btnDDZ", "skin": "comp/button.png", "label": "斗地主" }, "compId": 3 }, { "type": "Button", "props": { "y": 363.5, "x": 801, "visible": false, "var": "btnRoom", "skin": "comp/button.png", "label": "进入房间" }, "compId": 5 }, { "type": "Button", "props": { "y": 352, "x": 411, "var": "btnLogin", "skin": "comp/button.png", "label": "login GC" }, "compId": 6 }], "loadList": ["comp/button.png"], "loadList3D": [] };
                return LobbyUI;
            }(BaseScene_1.default));
            GameLobby.LobbyUI = LobbyUI;
        })(GameLobby = dzgame.GameLobby || (dzgame.GameLobby = {}));
    })(dzgame = ui.dzgame || (ui.dzgame = {}));
})(ui = exports.ui || (exports.ui = {}));
(function (ui) {
    var games;
    (function (games) {
        var globalview;
        (function (globalview) {
            var gamesUI = /** @class */ (function (_super) {
                __extends(gamesUI, _super);
                function gamesUI() {
                    return _super.call(this) || this;
                }
                gamesUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(gamesUI.uiView);
                };
                gamesUI.uiView = { "type": "BaseView", "props": { "width": 500, "height": 300 }, "compId": 2, "child": [{ "type": "Button", "props": { "y": 50, "x": 50, "width": 78, "var": "btnLan", "skin": "comp/button.png", "label": "斗地主", "height": 49 }, "compId": 3 }, { "type": "Button", "props": { "y": 63, "x": 165, "var": "btnSZ", "skin": "comp/button.png", "label": "三张" }, "compId": 4 }], "loadList": ["comp/button.png"], "loadList3D": [] };
                return gamesUI;
            }(BaseView_1.default));
            globalview.gamesUI = gamesUI;
        })(globalview = games.globalview || (games.globalview = {}));
    })(games = ui.games || (ui.games = {}));
})(ui = exports.ui || (exports.ui = {}));
(function (ui) {
    var games;
    (function (games) {
        var landrods;
        (function (landrods) {
            var LanLobbyUI = /** @class */ (function (_super) {
                __extends(LanLobbyUI, _super);
                function LanLobbyUI() {
                    return _super.call(this) || this;
                }
                LanLobbyUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(LanLobbyUI.uiView);
                };
                LanLobbyUI.uiView = { "type": "BaseScene", "props": { "width": 1336, "height": 750 }, "compId": 2, "child": [{ "type": "Sprite", "props": { "y": 0, "x": 0, "width": 1336, "texture": "games/landords/lobby/main.png", "height": 750 }, "compId": 3 }, { "type": "Button", "props": { "y": 64, "x": 62, "width": 183, "var": "btnBack", "skin": "comp/button.png", "labelSize": 40, "label": "返回大厅", "height": 105 }, "compId": 4 }, { "type": "Label", "props": { "y": 602, "x": 377, "var": "lblTips", "text": "label" }, "compId": 5 }, { "type": "Button", "props": { "y": 208, "x": 703, "width": 181, "var": "btnRoom", "skin": "comp/button.png", "label": "进入第一个房间", "height": 113 }, "compId": 6 }, { "type": "Button", "props": { "y": 602, "x": 1076, "var": "btnSend", "skin": "comp/button.png", "label": "发送消息" }, "compId": 7 }], "loadList": ["games/landords/lobby/main.png", "comp/button.png"], "loadList3D": [] };
                return LanLobbyUI;
            }(BaseScene_1.default));
            landrods.LanLobbyUI = LanLobbyUI;
        })(landrods = games.landrods || (games.landrods = {}));
    })(games = ui.games || (ui.games = {}));
})(ui = exports.ui || (exports.ui = {}));
(function (ui) {
    var games;
    (function (games) {
        var lobby;
        (function (lobby) {
            var GameLobbyUI = /** @class */ (function (_super) {
                __extends(GameLobbyUI, _super);
                function GameLobbyUI() {
                    return _super.call(this) || this;
                }
                GameLobbyUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(GameLobbyUI.uiView);
                };
                GameLobbyUI.uiView = { "type": "BaseView", "props": { "width": 1728, "height": 864 }, "compId": 2, "child": [{ "type": "Button", "props": { "y": 327, "x": 520, "skin": "comp/button.png", "label": "label" }, "compId": 3 }], "loadList": ["comp/button.png"], "loadList3D": [] };
                return GameLobbyUI;
            }(BaseView_1.default));
            lobby.GameLobbyUI = GameLobbyUI;
        })(lobby = games.lobby || (games.lobby = {}));
    })(games = ui.games || (ui.games = {}));
})(ui = exports.ui || (exports.ui = {}));
(function (ui) {
    var games;
    (function (games) {
        var sanzhang_example;
        (function (sanzhang_example) {
            var szlobbyUI = /** @class */ (function (_super) {
                __extends(szlobbyUI, _super);
                function szlobbyUI() {
                    return _super.call(this) || this;
                }
                szlobbyUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(szlobbyUI.uiView);
                };
                szlobbyUI.uiView = { "type": "BaseScene", "props": { "width": 500, "height": 300 }, "compId": 2, "child": [{ "type": "Sprite", "props": { "y": 0, "x": 0, "width": 1336, "texture": "games/sanzhang/main1.png", "height": 750 }, "compId": 4 }], "loadList": ["games/sanzhang/main1.png"], "loadList3D": [] };
                return szlobbyUI;
            }(BaseScene_1.default));
            sanzhang_example.szlobbyUI = szlobbyUI;
        })(sanzhang_example = games.sanzhang_example || (games.sanzhang_example = {}));
    })(games = ui.games || (ui.games = {}));
})(ui = exports.ui || (exports.ui = {}));
},{"../dzgames/components/dzpage/BaseScene":5,"../dzgames/components/dzpage/BaseView":6}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkU6L3N5c3Byb2dyYW1zL2RldnRvb2xzL0xheWFBaXJJREUyLjAvcmVzb3VyY2VzL2FwcC9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL0FwcFByZXNlbnRlci50cyIsInNyYy9HYW1lQ29uZmlnLnRzIiwic3JjL01haW4udHMiLCJzcmMvZHpnYW1lcy9jb21wb25lbnRzL2R6cGFnZS9CYXNlRGFpbG9nLnRzIiwic3JjL2R6Z2FtZXMvY29tcG9uZW50cy9kenBhZ2UvQmFzZVNjZW5lLnRzIiwic3JjL2R6Z2FtZXMvY29tcG9uZW50cy9kenBhZ2UvQmFzZVZpZXcudHMiLCJzcmMvZHpnYW1lcy9jb21wb25lbnRzL2V4dGVuZC9EaWN0aW9uYXJ5LnRzIiwic3JjL2R6Z2FtZXMvY29uZmlncy9jdXN0b21jZmcvVXNlckNvbmZpZy50cyIsInNyYy9kemdhbWVzL2NvbmZpZ3MvcmVzY2ZnL2ltZ3Jlcy9yZXMudHMiLCJzcmMvZHpnYW1lcy9jb3JlL2V2ZW50bWdyL0V2ZW50RGlzcGF0Y2gudHMiLCJzcmMvZHpnYW1lcy9jb3JlL2xvZ21nci9Mb2dnZXIudHMiLCJzcmMvZHpnYW1lcy9jb3JlL25ldG1nci9OZXR3b3JrTWdyLnRzIiwic3JjL2R6Z2FtZXMvY29yZS9uZXRtZ3IvV2ViU29ja2V0LnRzIiwic3JjL2R6Z2FtZXMvY29yZS9yZXNtZ3IvUmVzb3VyY2VNZ3IudHMiLCJzcmMvZHpnYW1lcy9jb3JlL3NvdW5kbWdyL1NvdW5kTWFuYWdlci50cyIsInNyYy9kemdhbWVzL21vZGVzL2xvYmJ5L0dhbWVJdGVtLnRzIiwic3JjL2R6Z2FtZXMvbW9kZXMvbG9iYnkvTG9iYnlEYXRhLnRzIiwic3JjL2R6Z2FtZXMvbW9kZXMvbG9iYnkvTG9jYWxQbGF5ZXIudHMiLCJzcmMvZHpnYW1lcy9wcmVzZW50ZXJzL0xvZ2luSGFuZGxlci50cyIsInNyYy9kemdhbWVzL3V0aWxzL1JhbmRvbU1nci50cyIsInNyYy9kemdhbWVzL3ZpZXdzL2NvbW1vbi9Mb2FkaW5nVmlldy50cyIsInNyYy9kemdhbWVzL3ZpZXdzL2NvbW1vbi9NYXNrVmlldy50cyIsInNyYy9kemdhbWVzL3ZpZXdzL2NvbW1vbi9Qcm9ncmVzc1ZpZXcudHMiLCJzcmMvZHpnYW1lcy92aWV3cy9jb21tb24vVG9hc3RWaWV3LnRzIiwic3JjL2R6Z2FtZXMvdmlld3MvbG9iYnkvTG9iYnlWaWV3LnRzIiwic3JjL2R6Z2FtZXMvdmlld3MvcHJlbG9hZC9QcmVsb2FkVmlldy50cyIsInNyYy9nYW1lcy9nbG9iYWwvZ2FtZXN2aWV3LnRzIiwic3JjL2dhbWVzL2xhbmRsb3Jkcy9jb25mcy9yZXMudHMiLCJzcmMvZ2FtZXMvbGFuZGxvcmRzL2RhdGEvbGFubG9iYnlkYXRhLnRzIiwic3JjL2dhbWVzL2xhbmRsb3Jkcy92aWV3cy9sYW5sb2JieS50cyIsInNyYy9nYW1lcy9zYW56aGFuZy9kZWZpbmUvc3pyZXMudHMiLCJzcmMvZ2FtZXMvc2Fuemhhbmcvdmlld3Mvc3psb2JieS50cyIsInNyYy91aS9sYXlhTWF4VUkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDVEEsaUVBQTREO0FBRTVELDhEQUF5RDtBQUN6RCw2REFBd0Q7QUFDeEQsNERBQXVEO0FBRXZELHVEQUFrRDtBQUNsRCwrREFBMEQ7QUFDMUQscUVBQW9FO0FBSXBFLG1FQUE4RDtBQUM5RCxrRUFBNkQ7QUFDN0QsNkRBQXdEO0FBQ3hELGlFQUE0RDtBQUM1RCwyREFBc0Q7QUFDdEQsb0VBQStEO0FBQy9ELCtCQUErQjtBQUMvQix1RUFBa0U7QUFLbEU7Ozs7R0FJRztBQUNIO0lBd0JLO1FBdkJELHdCQUF3QjtRQUNoQixtQkFBYyxHQUFVLEVBQUUsQ0FBQztRQUMzQixvQkFBZSxHQUFVLEVBQUUsQ0FBQztRQUM1QixpQkFBWSxHQUFVLENBQUMsQ0FBQztRQUN4QixnQkFBVyxHQUFVLENBQUMsQ0FBQztRQUN2Qixt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QUFFLEtBQUYsVUFBRSxRQVNmIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxyXG5pbXBvcnQgTG9jYWxQbGF5ZXIgZnJvbSBcIi4vZHpnYW1lcy9tb2Rlcy9sb2JieS9Mb2NhbFBsYXllclwiO1xyXG5pbXBvcnQgR2FtZUNvbmZpZyBmcm9tIFwiLi9HYW1lQ29uZmlnXCI7XHJcbmltcG9ydCBUb2FzdFZpZXcgZnJvbSBcIi4vZHpnYW1lcy92aWV3cy9jb21tb24vVG9hc3RWaWV3XCI7XHJcbmltcG9ydCBMb2JieVZpZXcgZnJvbSBcIi4vZHpnYW1lcy92aWV3cy9sb2JieS9Mb2JieVZpZXdcIjtcclxuaW1wb3J0IE1hc2tWaWV3IGZyb20gXCIuL2R6Z2FtZXMvdmlld3MvY29tbW9uL01hc2tWaWV3XCI7XHJcbmltcG9ydCB7IHVpIH0gZnJvbSBcIi4vdWkvbGF5YU1heFVJXCI7XHJcbmltcG9ydCBMb2dnZXIgZnJvbSBcIi4vZHpnYW1lcy9jb3JlL2xvZ21nci9Mb2dnZXJcIjtcclxuaW1wb3J0IE5ldHdvcmtNZ3IgZnJvbSBcIi4vZHpnYW1lcy9jb3JlL25ldG1nci9OZXR3b3JrTWdyXCI7XHJcbmltcG9ydCB7IFNvdW5kTWFuYWdlciB9IGZyb20gXCIuL2R6Z2FtZXMvY29yZS9zb3VuZG1nci9Tb3VuZE1hbmFnZXJcIjtcclxuaW1wb3J0IE1haW5WaWV3IGZyb20gXCIuL2R6Z2FtZXMvdmlld3MvY29tbW9uL01haW5WaWV3XCI7XHJcbmltcG9ydCBCYXNlU2NlbmUgZnJvbSBcIi4vZHpnYW1lcy9jb21wb25lbnRzL2R6cGFnZS9CYXNlU2NlbmVcIjtcclxuaW1wb3J0IEJhc2VWaWV3IGZyb20gXCIuL2R6Z2FtZXMvY29tcG9uZW50cy9kenBhZ2UvQmFzZVZpZXdcIjtcclxuaW1wb3J0IFByZWxvYWRWaWV3IGZyb20gXCIuL2R6Z2FtZXMvdmlld3MvcHJlbG9hZC9QcmVsb2FkVmlld1wiO1xyXG5pbXBvcnQgTG9hZGluZ1ZpZXcgZnJvbSBcIi4vZHpnYW1lcy92aWV3cy9jb21tb24vTG9hZGluZ1ZpZXdcIjtcclxuaW1wb3J0IExvYmJ5RGF0YSBmcm9tIFwiLi9kemdhbWVzL21vZGVzL2xvYmJ5L0xvYmJ5RGF0YVwiO1xyXG5pbXBvcnQgUmVzb3VyY2VNZ3IgZnJvbSBcIi4vZHpnYW1lcy9jb3JlL3Jlc21nci9SZXNvdXJjZU1nclwiO1xyXG5pbXBvcnQgR2FtZUl0ZW0gZnJvbSBcIi4vZHpnYW1lcy9tb2Rlcy9sb2JieS9HYW1lSXRlbVwiO1xyXG5pbXBvcnQgUHJvZ3Jlc3NWaWV3IGZyb20gXCIuL2R6Z2FtZXMvdmlld3MvY29tbW9uL1Byb2dyZXNzVmlld1wiO1xyXG5pbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuL01haW5cIjtcclxuaW1wb3J0IEV2ZW50RGlzcGF0Y2ggZnJvbSBcIi4vZHpnYW1lcy9jb3JlL2V2ZW50bWdyL0V2ZW50RGlzcGF0Y2hcIjtcclxuXHJcblxyXG5cclxuXHJcbi8qKlxyXG4gKiBicmllZjpnYW1lIGNlbnRlciBwcmVzZW50ZXIuXHJcbiAqIEF1dGhvcjogd2VuenVvbGlcclxuICogRGF0ZTogMjAxOS8wNC8wOFxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwUHJlc2VudGVye1xyXG4gICAgLyoqbGF5ZXIgY29udHJvbCBzdGFydCovXHJcbiAgICBwcml2YXRlIFpPUkRFUl9MT0FESU5HOm51bWJlciA9IDExO1xyXG4gICAgcHJpdmF0ZSBaT1JERVJfUFJPR1JFU1M6bnVtYmVyID0gMTA7XHJcbiAgICBwcml2YXRlIFpPUkRFUl9UT0FTVDpudW1iZXIgPSA5O1xyXG4gICAgcHJpdmF0ZSBaT1JERVJfTUFTSzpudW1iZXIgPSA4O1xyXG4gICAgcHJpdmF0ZSBaT1JERVJfTUVTU0FHRTpudW1iZXIgPSA3O1xyXG4gICAgcHJpdmF0ZSBaT1JERVJfTE9CQlk6bnVtYmVyID0gMDtcclxuXHJcbiAgICAvKipsYXllciBjb250cm9sIGVuZCAqL1xyXG4gICAgcHJpdmF0ZSBfZW5hYmxlTG9hZGluZzpib29sZWFuID0gdHJ1ZTtcclxuICAgIHByaXZhdGUgX2xvZzpMb2dnZXIgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfZXZlbnQ6RXZlbnREaXNwYXRjaD1udWxsO1xyXG4gICAgcHJpdmF0ZSBfbmV0Ok5ldHdvcmtNZ3IgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfc291bmQ6U291bmRNYW5hZ2VyID1udWxsOyBcclxuICAgIHByaXZhdGUgX3BsYXllcjpMb2NhbFBsYXllcj1udWxsOyBcclxuXHJcbiAgICBwcml2YXRlIF9tYWluVmlldzpMYXlhLlNwcml0ZSA9IG51bGw7XHJcbiAgICBwcml2YXRlIF9sb2JieTpMb2JieVZpZXcgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfcHJvZ3Jlc3NWaWV3OlByb2dyZXNzVmlldyA9IG51bGw7XHJcbiAgICBwcml2YXRlIF9sb2FkaW5nVmlldzpMb2FkaW5nVmlldyA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2FtZXM6QXJyYXk8R2FtZUl0ZW0+PW51bGw7XHJcblxyXG4gICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgIHRoaXMucmVnQ2xhc3MoKTtcclxuICAgICAgICB0aGlzLm1vZHVsZUluaXRpYWwoKTtcclxuICAgICAgICAvL3RoaXMuZ2FtZVN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWdDbGFzcygpOnZvaWR7XHJcbiAgICAgICAvLyBMYXlhLkNsYXNzVXRpbHMucmVnQ2xhc3MoXCJMYW5Mb2JieVwiLGR6Z2FtZXMuTGFuTG9iYnlWaWV3KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHN0YXJ0aW5nIGdhbWUgbG9iYnkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGFydEdhbWUoKTp2b2lke1xyXG4gICAgICAgLy8gR2FtZUNvbmZpZy5zdGFydFNjZW5lICYmIExheWEuU2NlbmUub3BlbihHYW1lQ29uZmlnLnN0YXJ0U2NlbmUpO1xyXG4gICAgICAgbGV0IHByZWxvYWQ6UHJlbG9hZFZpZXcgPSBuZXcgUHJlbG9hZFZpZXcoKTtcclxuICAgICAgIHByZWxvYWQubmFtZSA9IFwicHJlbG9hZFwiO1xyXG4gICAgICAgdGhpcy5fbWFpblZpZXcuYWRkQ2hpbGQocHJlbG9hZCk7Ly9lbnRlciBsb2JieSBuZWVkIHRvIHJlbW92ZSB0aGUgcHJlbG9hZCB2aWV3LlxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xvc2UgYWxsIG9wZW4gZ2FtZXMgYW5kIGJhY2sgdG8gbG9iYnkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBlbnRlckxvYmJ5KCk6dm9pZHtcclxuICAgICAgICB0aGlzLmRlc3Ryb3lHYW1lcygpO1xyXG4gICAgICAgIGxldCBwcmVsb2FkID0gdGhpcy5fbWFpblZpZXcuZ2V0Q2hpbGRCeU5hbWUoXCJwcmVsb2FkXCIpO1xyXG4gICAgICAgIGlmKHByZWxvYWQpe1xyXG4gICAgICAgICAgICB0aGlzLl9tYWluVmlldy5yZW1vdmVDaGlsZChwcmVsb2FkKTtcclxuICAgICAgICB9IFxyXG4gICAgICAgIGlmKHRoaXMuX2xvYmJ5PT1udWxsKXtcclxuICAgICAgICAgICAgdGhpcy5fbG9iYnkgPSBuZXcgTG9iYnlWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21haW5WaWV3LmFkZENoaWxkKHRoaXMuX2xvYmJ5KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHNjZW5lIHRoZSBtYWluIHNjZW5lIG9mIHRoZSBnYW1lIHlvdSBuZWVkIHRvIG9wZW4uXHJcbiAgICAgKiBAcGFyYW0gcmVzIHRoZSBuZXcgZ2FtZSByZXNvdXJjZSBsaXN0OnN5c3RlbSB3aWxsIGhlbHAgeW91IGxvYWQgdGhlIHJlc291cmNlIGxpc3QgYW5kIG1hbmFnZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIC8vIHB1YmxpYyBvcGVuR2FtZTIodXJsOnN0cmluZyxyZXM6QXJyYXk8c3RyaW5nPik6dm9pZHtcclxuICAgIC8vICAgICBsZXQgY2xhczphbnkgPSBMYXlhLkNsYXNzVXRpbHMuZ2V0Q2xhc3ModXJsKTtcclxuICAgIC8vICAgICBsZXQgc2NlbmU6YW55ID0gbnVsbDtcclxuICAgIC8vICAgICBpZihjbGFzKXtcclxuICAgIC8vICAgICAgICAgc2NlbmUgPSBuZXcgY2xhcygpO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICBpZihzY2VuZT09bnVsbCl7XHJcbiAgICAvLyAgICAgICAgIHRoaXMubUxvZ2dlci5lcnJvcihcImNhbid0IGZpbmQgc2NlbmUuXCIpO1xyXG4gICAgLy8gICAgICAgICByZXR1cm47XHJcbiAgICAvLyAgICAgfVxyXG5cclxuICAgIC8vICAgICBpZihyZXM9PW51bGx8fHJlcy5sZW5ndGg8MSl7XHJcbiAgICAvLyAgICAgICAgIHRoaXMubUxvZ2dlci53YXJuKFwic3lzdGVtIHdpbGwgb3BlbiB0aGUgbmV3IHNjZW5lIGJ1dCBubyBsb2FkIGFueSByZXNvdXJjZS4gcGxzIGNvbmZpcm0uXCIpO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICB0aGlzLnNob3dMb2FkaW5nKCk7XHJcbiAgICAvLyAgICAgdGhpcy5kZXN0cm95R2FtZXMoKTtcclxuICAgIC8vICAgICB0aGlzLl9nYW1lcy5wdXNoKG5ldyBHYW1lSXRlbShzY2VuZS5tU2NlbmVLZXkscmVzLHNjZW5lKSk7XHJcbiAgICAvLyAgICAgbGV0IF9jb21wbGV0ZWQ6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMub3Blbk5ld1NjZW5lLFtzY2VuZS5tU2NlbmVLZXldKTtcclxuICAgIC8vICAgICBsZXQgX3Byb2dyZXNzOkxheWEuSGFuZGxlciA9IExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLnNob3dQcm9ncmVzcyxudWxsLGZhbHNlKTtcclxuICAgIC8vICAgICBSZXNvdXJjZU1nci5sb2FkUmVzKHJlcyxfY29tcGxldGVkLF9wcm9ncmVzcyxudWxsLDAsdHJ1ZSxzY2VuZS5tU2NlbmVLZXkpO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gc2NlbmUgdGhlIG1haW4gc2NlbmUgb2YgdGhlIGdhbWUgeW91IG5lZWQgdG8gb3Blbi5cclxuICAgICAqIEBwYXJhbSByZXMgdGhlIG5ldyBnYW1lIHJlc291cmNlIGxpc3Q6c3lzdGVtIHdpbGwgaGVscCB5b3UgbG9hZCB0aGUgcmVzb3VyY2UgbGlzdCBhbmQgbWFuYWdlbWVudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIG9wZW5HYW1lKHNjZW5lOkJhc2VTY2VuZSxyZXM6QXJyYXk8c3RyaW5nPik6dm9pZHtcclxuICAgICAgICBpZihzY2VuZT09bnVsbCl7XHJcbiAgICAgICAgICAgIHRoaXMuTG9nZ2VyLmVycm9yKFwiZXJyb3IgY2FsbGluZy4gdGhlIHNjZW5lIGlzIG51bGwuXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHJlcz09bnVsbHx8cmVzLmxlbmd0aDwxKXtcclxuICAgICAgICAgICAgdGhpcy5Mb2dnZXIud2FybihcInN5c3RlbSB3aWxsIG9wZW4gdGhlIG5ldyBzY2VuZSBidXQgbm8gbG9hZCBhbnkgcmVzb3VyY2UuIHBscyBjb25maXJtLlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG93TG9hZGluZygpO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveUdhbWVzKCk7XHJcbiAgICAgICAgdGhpcy5fZ2FtZXMucHVzaChuZXcgR2FtZUl0ZW0oc2NlbmUubVNjZW5lS2V5LHJlcyxzY2VuZSkpO1xyXG4gICAgICAgIGxldCBfY29tcGxldGVkOkxheWEuSGFuZGxlciA9IExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLm9wZW5OZXdTY2VuZSxbc2NlbmUubVNjZW5lS2V5XSk7XHJcbiAgICAgICAgbGV0IF9wcm9ncmVzczpMYXlhLkhhbmRsZXIgPSBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsdGhpcy5zaG93UHJvZ3Jlc3MsbnVsbCxmYWxzZSk7XHJcbiAgICAgICAgUmVzb3VyY2VNZ3IubG9hZFJlcyhyZXMsX2NvbXBsZXRlZCxfcHJvZ3Jlc3MsbnVsbCwwLHRydWUsc2NlbmUubVNjZW5lS2V5KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlc3Ryb3kgY3VycmVudCBnYW1lcy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkZXN0cm95R2FtZXMoKTp2b2lke1xyXG4gICAgICAgIGxldCBsZW46bnVtYmVyID0gdGhpcy5fZ2FtZXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGxlbj4wKXtcclxuICAgICAgICAgICAgbGV0IF90ZW06R2FtZUl0ZW0gPSB0aGlzLl9nYW1lcy5wb3AoKTtcclxuICAgICAgICAgICAgdGhpcy5fbWFpblZpZXcucmVtb3ZlQ2hpbGQoX3RlbS5tR2FtZVZpZXcpO1xyXG4gICAgICAgICAgICBfdGVtLm1HYW1lVmlldy5leGl0QW5kRGVzdHJveSgpO1xyXG4gICAgICAgICAgICBSZXNvdXJjZU1nci5jbGVhclJlc0J5R3JvdXAoX3RlbS5tR2FtZUtleSk7XHJcbiAgICAgICAgICAgIF90ZW0gPSBudWxsO1xyXG4gICAgICAgICAgICBsZW4gPSB0aGlzLl9nYW1lcy5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogb3BlbiBzY2VuZSBmb3IgbmV3IGdhbWUuXHJcbiAgICAgKiBAcGFyYW0gYXJncyBnYW1lIGtleVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIG9wZW5OZXdTY2VuZShrZXk6c3RyaW5nKTp2b2lke1xyXG4gICAgICAgIGxldCB2aWV3OkJhc2VTY2VuZSA9IG51bGw7XHJcbiAgICAgICAgZm9yKGxldCBpPTA7aTx0aGlzLl9nYW1lcy5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgaWYodGhpcy5fZ2FtZXNbaV0ubUdhbWVLZXk9PWtleSl7XHJcbiAgICAgICAgICAgICAgICB2aWV3ID0gdGhpcy5fZ2FtZXNbaV0ubUdhbWVWaWV3O2JyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHZpZXcpe1xyXG4gICAgICAgICAgICB0aGlzLl9tYWluVmlldy5hZGRDaGlsZCh2aWV3KTtcclxuICAgICAgICAgICAgbGV0IG5vZGU6bGF5YS5kaXNwbGF5Lk5vZGUgPSB0aGlzLl9tYWluVmlldy5yZW1vdmVDaGlsZCh0aGlzLl9sb2JieSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYmJ5ID0gbnVsbDtcclxuICAgICAgICAgICAgbm9kZS5kZXN0cm95KHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVMb2FkaW5nKCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KFwiQ2FuJ3QgZmluZCBzY2VuZS5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gXHJcbiBcclxuICAgIC8qKlxyXG4gICAgICogaW5pdGlhbCByZWxhdGl2ZSBtb2R1bGVzLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIG1vZHVsZUluaXRpYWwoKTp2b2lke1xyXG4gICAgICAgIHRoaXMuX21haW5WaWV3ID0gTGF5YS5TY2VuZS5yb290O1xyXG4gICAgICAgIHRoaXMuX2dhbWVzID0gbmV3IEFycmF5PEdhbWVJdGVtPigpO1xyXG4gICAgICAgIHRoaXMuX3BsYXllciA9IG5ldyBMb2NhbFBsYXllcigpO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50ID0gbmV3IEV2ZW50RGlzcGF0Y2goKTtcclxuICAgICAgICB0aGlzLl9sb2cgPSBuZXcgTG9nZ2VyKCk7XHJcbiAgICAgICAgbGV0IF9vbmNvbm5lY3RlZDpMYXlhLkhhbmRsZXIgPSBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsdGhpcy5vbkNvbm5lY3RlZCk7IFxyXG4gICAgICAgIGxldCBfb25Db25uZWN0RmFpbGVkOkxheWEuSGFuZGxlciA9IExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLm9uQ29ubmVjdEZhaWxlZCk7XHJcbiAgICAgICAgbGV0IF9vblNlbmRNc2dGYWlsZWQ6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMub25TZW5kTXNnRmFpbGVkLG51bGwsZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuX25ldCA9IG5ldyBOZXR3b3JrTWdyKF9vbmNvbm5lY3RlZCxfb25Db25uZWN0RmFpbGVkLF9vblNlbmRNc2dGYWlsZWQpO1xyXG4gICAgICAgIHRoaXMuX3NvdW5kID0gbmV3IFNvdW5kTWFuYWdlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgTmV0KCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25ldDtcclxuICAgIH1cclxuIFxyXG4gICAgLyoqU291bmQgbWFuYWdlciAqL1xyXG4gICAgcHVibGljIGdldCBTb3VuZCgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGV2ZW50IGRpc3BhdGNoIG1vZHVsZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBFdmVudHMoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIExvZ2dlciBtb2R1bGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBMb2dnZXIoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbG9nO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBnYW1lIHBsYXllciBkYXRhXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgUGxheWVyKCl7XHJcbiAgICAgICAgaWYodGhpcy5fcGxheWVyPT1udWxsKXtcclxuICAgICAgICAgICAgdGhpcy5fcGxheWVyID0gbmV3IExvY2FsUGxheWVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9wbGF5ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzd2l0Y2ggdGhlIGxvYWRpbmcgc3RhdHVzLlxyXG4gICAgICogdHJ1ZTogZW5hYmxlIHNob3cgbG9hZGluZyB2aWV3LiBzaG93IGxvYWRpbmcgdmlldyB3aGVuIHN5c3RlbSBpbiBsb2FkaW5nIHJlcy5cclxuICAgICAqIGZhbHNlOiBoaWRlIHRoZSBsb2FkaW5nIHZpZXcgd2hlbiBzeXN0ZW0gaW4gbG9hZGluZy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBlbmFibGVMb2FkaW5nKGVuYWJsZTpib29sZWFuKXtcclxuICAgICAgICB0aGlzLl9lbmFibGVMb2FkaW5nID0gZW5hYmxlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIHNob3cgdG9hc3QgbWVzc2FnZS5cclxuICAgICAqIEBwYXJhbSBtc2cgbWVzc2FnZSBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dUb2FzdChtc2c6c3RyaW5nKTp2b2lke1xyXG4gICAgICAgIGxldCB0b2FzdDpUb2FzdFZpZXcgPSBuZXcgVG9hc3RWaWV3KG1zZyk7XHJcbiAgICAgICAgdG9hc3Quek9yZGVyPXRoaXMuWk9SREVSX1RPQVNUO1xyXG4gICAgICAgIExheWEuU2NlbmUucm9vdC5hZGRDaGlsZCh0b2FzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IG1lc3NhZ2Ugd2luZG93XHJcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBkaXNwbGF5IG1lc3NhZ2VcclxuICAgICAqIEBwYXJhbSBva0NhbGxiYWNrIG9rIGNhbGxiYWNrICAgIFxyXG4gICAgICogQHBhcmFtIGNhbmNlbENhbGxiYWNrIGNhbmNlbCBjYWxsYmFjayAgICBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dNc2cobWVzc2FnZTpzdHJpbmcsb2tDYWxsYmFjaz86TGF5YS5IYW5kbGVyLGNhbmNlbENhbGxiYWNrPzpMYXlhLkhhbmRsZXIpOnZvaWR7XHJcbiAgICAgICAgLy9UT0RPOndlbnp1b2xpXHJcbiAgICAgICAgaWYoY29uZmlybShtZXNzYWdlKSl7XHJcbiAgICAgICAgICAgIG9rQ2FsbGJhY2smJm9rQ2FsbGJhY2sucnVuKCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNhbmNlbENhbGxiYWNrJiZjYW5jZWxDYWxsYmFjay5ydW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IG1hc2sgZm9yIGRpc2FibGUgYW55IHRvdWNoL2NsaWNrIGV2ZW50LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2hvd01hc2soKTp2b2lke1xyXG4gICAgICAgIGxldCBtYXNrOk1hc2tWaWV3ID0gbmV3IE1hc2tWaWV3KCk7XHJcbiAgICAgICAgbWFzay56T3JkZXI9dGhpcy5aT1JERVJfTUFTSztcclxuICAgICAgICBMYXlhLlNjZW5lLnJvb3QuYWRkQ2hpbGQobWFzayk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGlkZSB0aGUgbG9hZGluZyB2aWV3LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaGlkZUxvYWRpbmcoKTp2b2lke1xyXG4gICAgICAgIGlmKHRoaXMuX2VuYWJsZUxvYWRpbmcmJnRoaXMuX2xvYWRpbmdWaWV3KXtcclxuICAgICAgICAgICAgbGV0IG5vZGU6YW55ID0gdGhpcy5fbWFpblZpZXcucmVtb3ZlQ2hpbGQodGhpcy5fbG9hZGluZ1ZpZXcpO1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nVmlldyA9IG51bGw7XHJcbiAgICAgICAgICAgIG5vZGUuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzaG93IGxvYWRpbmcgdmlldy4gdXNlIGZvciB0cmFuc2l0aW9uIG9yIHN3aXRjaGluZyB0aGUgc2NlbmVzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzaG93TG9hZGluZygpOnZvaWR7XHJcbiAgICAgICAgaWYodGhpcy5fZW5hYmxlTG9hZGluZyl7XHJcbiAgICAgICAgICAgIGlmKCF0aGlzLl9sb2FkaW5nVmlldyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkaW5nVmlldyA9IG5ldyBMb2FkaW5nVmlldygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZGluZ1ZpZXcuek9yZGVyID0gdGhpcy5aT1JERVJfTE9BRElORztcclxuICAgICAgICAgICAgICAgIHRoaXMuX21haW5WaWV3LmFkZENoaWxkKHRoaXMuX2xvYWRpbmdWaWV3KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNob3cgbG9hZGluZyBwcm9ncmVzcy5cclxuICAgICAqIEBwYXJhbSB2YWwgcHJvZ3Jlc3MgZm9yIGxvYWRpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dQcm9ncmVzcyh2YWw6bnVtYmVyKTp2b2lke1xyXG4gICAgICAgIGlmKCF0aGlzLl9wcm9ncmVzc1ZpZXcpe1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9ncmVzc1ZpZXcgPSBuZXcgUHJvZ3Jlc3NWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzVmlldy56T3JkZXIgPSB0aGlzLlpPUkRFUl9QUk9HUkVTUztcclxuICAgICAgICAgICAgdGhpcy5fbWFpblZpZXcuYWRkQ2hpbGQodGhpcy5fcHJvZ3Jlc3NWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIXRoaXMuX3Byb2dyZXNzVmlldy52aXNpYmxlKXtcclxuICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3NWaWV3LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih2YWw9PTEpe1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9ncmVzc1ZpZXcudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9ncmVzc1ZpZXcucHJvZ3Jlc3NDaGFuZ2UodmFsKTsgXHJcbiAgICAgICAgfSAgIFxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzaG93TG9naW5QYW5lbCgpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuTG9nZ2VyLndhcm4oXCJmdW5jdGlvbiAnc2hvd0xvZ2luUGFuZWwnIG5vdCBpbXBsZW1lbnRlZC5cIilcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvbm5lY3QgdG8gZm9yd2FyZCByZXN1bHQuXHJcbiAgICAgKiBAcGFyYW0gZGF0YSByZWNlaXZlZCBkYXRhXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvbkNvbm5lY3RlZChkYXRhKTp2b2lke1xyXG4gICAgICAgIC8vY29ubmVjdCB0byBmb3J3YXJkIHN1Y2Nlc3MuXHJcbiAgICAgICAgTG9iYnlEYXRhLmluaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvbm5lY3QgdG8gZm9yd2FyZCByZXN1bHQuXHJcbiAgICAgKiBAcGFyYW0gZGF0YSByZWNlaXZlZCBkYXRhXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvbkNvbm5lY3RGYWlsZWQoZGF0YSk6dm9pZHtcclxuICAgICAgICAvL2Nvbm5lY3QgdG8gZm9yd2FyZCBzdWNjZXNzLlxyXG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KFwiQ29ubmVjdCB0byBzZXJ2ZXIgZmFpbGVkLlwiKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uU2VuZE1zZ0ZhaWxlZCgpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoXCJNZXNzYWdlIHNlbmQgZmFpbGVkLlwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYXkgc291bmRcclxuICAgICAqIEBwYXJhbSB1cmwgcGF0aFxyXG4gICAgICogQHBhcmFtIGxvb3BzIGxvb3BzLG9wdGlvbmFsXHJcbiAgICAgKiBAcGFyYW0gY29tcGxldGUgY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIHBsYXllclNvdW5kRWZmZWN0KHVybDogc3RyaW5nLCBsb29wcz86IG51bWJlciwgY29tcGxldGU/OkxheWEuSGFuZGxlcik6dm9pZHtcclxuICAgICAgICB0aGlzLl9zb3VuZC5wbGF5U291bmQodXJsLGxvb3BzLGNvbXBsZXRlKTsgIFxyXG4gICAgfVxyXG59IiwiLyoqVGhpcyBjbGFzcyBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBieSBMYXlhQWlySURFLCBwbGVhc2UgZG8gbm90IG1ha2UgYW55IG1vZGlmaWNhdGlvbnMuICovXHJcblxyXG4vKlxyXG4qIOa4uOaIj+WIneWni+WMlumFjee9rjtcclxuKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZUNvbmZpZ3tcclxuICAgIHN0YXRpYyB3aWR0aDpudW1iZXI9MTcyODtcclxuICAgIHN0YXRpYyBoZWlnaHQ6bnVtYmVyPTg2NDtcclxuICAgIHN0YXRpYyBzY2FsZU1vZGU6c3RyaW5nPVwiZml4ZWR3aWR0aFwiO1xyXG4gICAgc3RhdGljIHNjcmVlbk1vZGU6c3RyaW5nPVwibm9uZVwiO1xyXG4gICAgc3RhdGljIGFsaWduVjpzdHJpbmc9XCJ0b3BcIjtcclxuICAgIHN0YXRpYyBhbGlnbkg6c3RyaW5nPVwibGVmdFwiO1xyXG4gICAgc3RhdGljIHN0YXJ0U2NlbmU6YW55PVwiZHpnYW1lL2NvbW1vbi9QcmVsb2FkLnNjZW5lXCI7XHJcbiAgICBzdGF0aWMgc2NlbmVSb290OnN0cmluZz1cIlwiO1xyXG4gICAgc3RhdGljIGRlYnVnOmJvb2xlYW49ZmFsc2U7XHJcbiAgICBzdGF0aWMgc3RhdDpib29sZWFuPWZhbHNlO1xyXG4gICAgc3RhdGljIHBoeXNpY3NEZWJ1Zzpib29sZWFuPWZhbHNlO1xyXG4gICAgc3RhdGljIGV4cG9ydFNjZW5lVG9Kc29uOmJvb2xlYW49dHJ1ZTtcclxuICAgIGNvbnN0cnVjdG9yKCl7fVxyXG4gICAgc3RhdGljIGluaXQoKXtcclxuICAgICAgICB2YXIgcmVnOiBGdW5jdGlvbiA9IExheWEuQ2xhc3NVdGlscy5yZWdDbGFzcztcclxuXHJcbiAgICB9XHJcbn1cclxuR2FtZUNvbmZpZy5pbml0KCk7IiwiaW1wb3J0IEdhbWVDb25maWcgZnJvbSBcIi4vR2FtZUNvbmZpZ1wiO1xyXG5pbXBvcnQgQXBwUHJlc2VudGVyIGZyb20gXCIuL0FwcFByZXNlbnRlclwiO1xyXG5pbXBvcnQgTG9hZGluZ1ZpZXcgZnJvbSBcIi4vZHpnYW1lcy92aWV3cy9jb21tb24vTG9hZGluZ1ZpZXdcIjtcclxuaW1wb3J0IFJlc291cmNlTWdyIGZyb20gXCIuL2R6Z2FtZXMvY29yZS9yZXNtZ3IvUmVzb3VyY2VNZ3JcIjtcclxuaW1wb3J0IFJlc0xpc3QgZnJvbSBcIi4vZHpnYW1lcy9jb25maWdzL3Jlc2NmZy9pbWdyZXMvcmVzXCI7XHJcblxyXG5leHBvcnQgbGV0IGR6YXBwOkFwcFByZXNlbnRlciA9IG51bGw7XHJcbmNsYXNzIE1haW4ge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0Ly/moLnmja5JREXorr7nva7liJ3lp4vljJblvJXmk45cdFx0XHJcblx0XHRpZiAod2luZG93W1wiTGF5YTNEXCJdKSBMYXlhM0QuaW5pdChHYW1lQ29uZmlnLndpZHRoLCBHYW1lQ29uZmlnLmhlaWdodCk7XHJcblx0XHRlbHNlIExheWEuaW5pdChHYW1lQ29uZmlnLndpZHRoLCBHYW1lQ29uZmlnLmhlaWdodCwgTGF5YVtcIldlYkdMXCJdKTtcclxuXHRcdExheWFbXCJQaHlzaWNzXCJdICYmIExheWFbXCJQaHlzaWNzXCJdLmVuYWJsZSgpO1xyXG5cdFx0TGF5YVtcIkRlYnVnUGFuZWxcIl0gJiYgTGF5YVtcIkRlYnVnUGFuZWxcIl0uZW5hYmxlKCk7XHJcblx0XHRMYXlhLnN0YWdlLnNjYWxlTW9kZSA9IEdhbWVDb25maWcuc2NhbGVNb2RlO1xyXG5cdFx0TGF5YS5zdGFnZS5zY3JlZW5Nb2RlID0gR2FtZUNvbmZpZy5zY3JlZW5Nb2RlO1xyXG5cdFx0Ly/lhbzlrrnlvq7kv6HkuI3mlK/mjIHliqDovb1zY2VuZeWQjue8gOWcuuaZr1xyXG5cdFx0TGF5YS5VUkwuZXhwb3J0U2NlbmVUb0pzb24gPSBHYW1lQ29uZmlnLmV4cG9ydFNjZW5lVG9Kc29uO1xyXG5cclxuXHRcdC8v5omT5byA6LCD6K+V6Z2i5p2/77yI6YCa6L+HSURF6K6+572u6LCD6K+V5qih5byP77yM5oiW6ICFdXJs5Zyw5Z2A5aKe5YqgZGVidWc9dHJ1ZeWPguaVsO+8jOWdh+WPr+aJk+W8gOiwg+ivlemdouadv++8iVxyXG5cdFx0aWYgKEdhbWVDb25maWcuZGVidWcgfHwgTGF5YS5VdGlscy5nZXRRdWVyeVN0cmluZyhcImRlYnVnXCIpID09IFwidHJ1ZVwiKSBMYXlhLmVuYWJsZURlYnVnUGFuZWwoKTtcclxuXHRcdGlmIChHYW1lQ29uZmlnLnBoeXNpY3NEZWJ1ZyAmJiBMYXlhW1wiUGh5c2ljc0RlYnVnRHJhd1wiXSkgTGF5YVtcIlBoeXNpY3NEZWJ1Z0RyYXdcIl0uZW5hYmxlKCk7XHJcblx0XHRpZiAoR2FtZUNvbmZpZy5zdGF0KSBMYXlhLlN0YXQuc2hvdygpO1xyXG5cdFx0TGF5YS5hbGVydEdsb2JhbEVycm9yID0gdHJ1ZTtcclxuXHJcblx0XHQvL+a/gOa0u+i1hOa6kOeJiOacrOaOp+WItu+8jHZlcnNpb24uanNvbueUsUlEReWPkeW4g+WKn+iDveiHquWKqOeUn+aIkO+8jOWmguaenOayoeacieS5n+S4jeW9seWTjeWQjue7rea1geeoi1xyXG5cdFx0TGF5YS5SZXNvdXJjZVZlcnNpb24uZW5hYmxlKFwidmVyc2lvbi5qc29uXCIsIExheWEuSGFuZGxlci5jcmVhdGUodGhpcywgdGhpcy5vblZlcnNpb25Mb2FkZWQpLCBMYXlhLlJlc291cmNlVmVyc2lvbi5GSUxFTkFNRV9WRVJTSU9OKTtcclxuXHR9XHJcblxyXG5cdG9uVmVyc2lvbkxvYWRlZCgpOiB2b2lkIHtcclxuXHRcdC8v5r+A5rS75aSn5bCP5Zu+5pig5bCE77yM5Yqg6L295bCP5Zu+55qE5pe25YCZ77yM5aaC5p6c5Y+R546w5bCP5Zu+5Zyo5aSn5Zu+5ZCI6ZuG6YeM6Z2i77yM5YiZ5LyY5YWI5Yqg6L295aSn5Zu+5ZCI6ZuG77yM6ICM5LiN5piv5bCP5Zu+XHJcblx0XHRMYXlhLkF0bGFzSW5mb01hbmFnZXIuZW5hYmxlKFwiZmlsZWNvbmZpZy5qc29uXCIsIExheWEuSGFuZGxlci5jcmVhdGUodGhpcywgdGhpcy5vblJlc291Y2VMb2FkZWQpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIGFmdGVyIGNvbmZpZyBsb2FkZWQgdGhlbiBzdGFydGluZyB0byBsb2FkIHJlc291cmNlL3VpXHJcblx0ICovXHJcblx0b25Db25maWdMb2FkZWQoKTogdm9pZCB7XHJcblx0XHQvL3Jlc291cmNlIGxvYWRcclxuXHRcdGxldCBsb2dvUmVzOmFueVtdID0gbmV3IEFycmF5KCk7XHJcblx0XHRSZXNMaXN0LlByZWxvYWQuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuXHRcdFx0bG9nb1Jlcy5wdXNoKGVsZW1lbnQpO1xyXG5cdFx0fSk7XHJcblx0IFxyXG5cdFx0UmVzb3VyY2VNZ3IubG9hZFJlcyhsb2dvUmVzLCBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsIHRoaXMub25SZXNvdWNlTG9hZGVkKSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIGFmdGVyIHJlc291cmNlIGxvYWRlZCB0aGVuIHJ1biBwcmVzZW50ZXIuXHJcblx0ICovXHJcblx0b25SZXNvdWNlTG9hZGVkKCk6dm9pZHtcclxuXHRcdGR6YXBwID0gZHphcHB8fCBuZXcgQXBwUHJlc2VudGVyKCk7IFxyXG5cdFx0ZHphcHAuc3RhcnRHYW1lKCk7XHJcblx0fVxyXG59XHJcbi8v5r+A5rS75ZCv5Yqo57G7XHJcbm5ldyBNYWluKCk7XHJcbiIsImltcG9ydCBHYW1lQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9HYW1lQ29uZmlnXCI7XHJcbmltcG9ydCB7IGR6YXBwIH0gZnJvbSBcIi4uLy4uLy4uL01haW5cIjtcclxuaW1wb3J0IEJhc2VTY2VuZSBmcm9tIFwiLi9CYXNlU2NlbmVcIjtcclxuaW1wb3J0IEJhc2VWaWV3IGZyb20gXCIuL0Jhc2VWaWV3XCI7XHJcblxyXG4vKipcclxuICogQGRlc2MgOiDmiYDmnInlr7nor53moYbnmoTln7rnsbvvvIzkuLvopoHnlKjkuo7lr7npobXpnaLkuovku7bnmoTnrqHnkIbvvIzoh6rliqjnp7vpmaTnrYlcclxuICogQGF1dGhvcjogV2VuenVvbGlcclxuICogQGRhdGU6IDIwMTgvMDUvMjNcclxuICovIFxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlRGlhbG9nIGV4dGVuZHMgTGF5YS5EaWFsb2d7XHJcbiAgICAgICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgLy90aGlzLm9uKExheWEuRXZlbnQuUkVNT1ZFRCx0aGlzLHRoaXMub2ZmQWxsTGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqY3VycmVudCB6LWluZGV4IGZvciBhZGQgY2hpbGQuICovXHJcbiAgICAgICAgcHJpdmF0ZSB6SW5kZXg6bnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgb25EZXN0cm95KCk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy5vZmZBbGxMaXN0ZW5lcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogcmVtb3ZlIGFsbCBsaXN0ZW5zIGZvciBjdXJyZW50IHBhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBvZmZBbGxMaXN0ZW5lcigpOnZvaWR7XHJcbiAgICAgICAgICAgIGR6YXBwLkV2ZW50cy5vZmZBbGxCeUNhbGxlcih0aGlzKTtcclxuICAgICAgICB9XHJcbiBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBjbG9zZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBleGl0KCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMub2ZmQWxsTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgTGF5YS5Ud2Vlbi50byh0aGlzLCB7eDpHYW1lQ29uZmlnLndpZHRoLzIsIHk6R2FtZUNvbmZpZy5oZWlnaHQvMiwgc2NhbGVYOjAuNiwgc2NhbGVZOjAuNiwgYWxwaGE6MH0sXHJcbiAgICAgICAgICAgICAgICAyODAsIExheWEuRWFzZS5iYWNrSW4sIExheWEuSGFuZGxlci5jcmVhdGUodGhpcywgdGhpcy5kZXN0cm95LFt0cnVlXSksIDBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWFs+mXreW5tuW4puWKqOeUu+aViOaenFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBjbG9zZUFuZERlc3Ryb3koKTp2b2lke1xyXG4gICAgICAgICAgICBMYXlhLlR3ZWVuLnRvKHRoaXMsIHt4OkdhbWVDb25maWcud2lkdGgvMiwgeTpHYW1lQ29uZmlnLmhlaWdodC8yLCBzY2FsZVg6MC42LCBzY2FsZVk6MC42LCBhbHBoYTowfSxcclxuICAgICAgICAgICAgICAgIDI4MCwgTGF5YS5FYXNlLmJhY2tJbiwgTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLCB0aGlzLmV4aXQpLCAwXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLyoqXHJcbiAgICAgICAgICogYmFjayB0byBsYXN0IHZpZXdcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ29CYWNrKCk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy5leGl0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBnb3RvIHRoZSB0YXJnZXQgdmlldyAsbXVzdCB1c2UgdGhlIGdvQmFjayB0byBjb21lIGJhY2tcclxuICAgICAgICAgKiBAcGFyYW0gdiBuZXcgdmlld1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnb3RvVmlldyh2OmxheWEuZGlzcGxheS5Ob2RlKTpsYXlhLmRpc3BsYXkuTm9kZXtcclxuICAgICAgICAgICByZXR1cm4gc3VwZXIuYWRkQ2hpbGQodik7XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgcHVibGljIFNob3dFZmZlY3QoKTp2b2lke1xyXG4gICAgICAgICAgICB0aGlzLmFscGhhID0gMC4xO1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlKDAuMSwwLjEsdHJ1ZSk7XHJcbiAgICAgICAgICAgIExheWEuVHdlZW4udG8odGhpcyx7c2NhbGVYOjEsc2NhbGVZOjEsYWxwaGE6MX0sMzAwLExheWEuRWFzZVtcImNpcmNPdXRcIl0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkIGNoaWxkIHRvIHZpZXcuXHJcbiAgICAgICAgICogQHBhcmFtIG5vZGUgY2hpbGRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWRkQ2hpbGQobm9kZTpsYXlhLmRpc3BsYXkuTm9kZSk6bGF5YS5kaXNwbGF5Lk5vZGV7XHJcbiAgICAgICAgICAgIGlmKG5vZGUgaW5zdGFuY2VvZiBCYXNlU2NlbmUpe1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHNjZW5lIGludG8gdGhlIGRhaWxvZy5cIjtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih0aGlzLnpJbmRleD09dW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuekluZGV4ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihub2RlIGluc3RhbmNlb2YgQmFzZVZpZXcpe1xyXG4gICAgICAgICAgICAgICAgbm9kZS56T3JkZXIgPSB0aGlzLnpJbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ290b1ZpZXcobm9kZSk7XHJcbiAgICAgICAgICAgIH0gICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuYWRkQ2hpbGRBdChub2RlLHRoaXMuekluZGV4KyspO1xyXG4gICAgICAgIH1cclxuICAgIH0gIiwiaW1wb3J0IEJhc2VWaWV3IGZyb20gXCIuL0Jhc2VWaWV3XCI7XHJcbmltcG9ydCBSYW5kb21NZ3IgZnJvbSBcIi4uLy4uL3V0aWxzL1JhbmRvbU1nclwiO1xyXG5pbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7XHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uOmJhc2Ugc2NlbmUuXHJcbiAqIEBhdXRob3I6IHdlbnp1b2xpXHJcbiAqIEBEYXRlOiAyMDE5LzA0LzA4XHJcbiAqL1xyXG4gICAgZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZVNjZW5lIGV4dGVuZHMgTGF5YS5TY2VuZXtcclxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgICAgICBzdXBlcigpOyAgXHJcbiAgICAgICAgICAgIHRoaXMubVNjZW5lS2V5ID0gUmFuZG9tTWdyLnV1aWQoKTtcclxuICAgICAgICAgICAgLy90aGlzLm9uKExheWEuRXZlbnQuUkVNT1ZFRCx0aGlzLHRoaXMub2ZmQWxsTGlzdGVuZXIpO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgcHVibGljIG1TY2VuZUtleTpzdHJpbmc7XHJcbiAgICAgICAgLyoqY3VycmVudCB6LWluZGV4IGZvciBhZGQgY2hpbGQuICovXHJcbiAgICAgICAgcHJpdmF0ZSB6SW5kZXg6bnVtYmVyID0gMDtcclxuICAgICAgICBwcml2YXRlIG1FeGl0VGltZTpudW1iZXIgPSAxMDAwKjAuNTtcclxuXHJcbiAgICAgICAgb25EZXN0cm95KCk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy5vZmZBbGxMaXN0ZW5lcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZSBhbGwgdGhlIGxpc3RlbmVycyBvZiB0aGUgY3VycmVudCBwYWdlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBvZmZBbGxMaXN0ZW5lcigpOnZvaWR7XHJcbiAgICAgICAgICAgIGR6YXBwLkV2ZW50cy5vZmZBbGxCeUNhbGxlcih0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFxyXG4gICAgICAgICAqIEBwYXJhbSBub2RlIGRpc3BsYXkgbm9kZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWRkQ2hpbGQobm9kZTpsYXlhLmRpc3BsYXkuTm9kZSk6bGF5YS5kaXNwbGF5Lk5vZGV7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKG5vZGUgaW5zdGFuY2VvZiBCYXNlU2NlbmUpe1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHNjZW5lIGluIHRoZSBzY2VuZS5cIjtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih0aGlzLnpJbmRleD09dW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuekluZGV4ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihub2RlIGluc3RhbmNlb2YgQmFzZVZpZXcpe1xyXG4gICAgICAgICAgICAgICAgbm9kZS56T3JkZXIgPSB0aGlzLnpJbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ290b1ZpZXcobm9kZSk7XHJcbiAgICAgICAgICAgIH0gICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuYWRkQ2hpbGRBdChub2RlLHRoaXMuekluZGV4KyspO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlIGZyb20gcGFyZW50IGNvbnRhaW5lciBhbmQgZGVzdHJveSBzZWxmLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBleGl0QW5kRGVzdHJveSgpOnZvaWR7IFxyXG4gICAgICAgICAgICB0aGlzLmV4aXRTeXN0ZW0odGhpcy5kZXN0cm95LFt0cnVlXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBleGl0IHN5c3RlbVxyXG4gICAgICAgICAqIEBwYXJhbSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxyXG4gICAgICAgICAqIEBwYXJhbSBhcmdzIGZ1bmN0aW9uIGFyZ3VtZW50c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgZXhpdFN5c3RlbShjYWxsYmFjazpGdW5jdGlvbiwuLi5hcmdzOmFueVtdKTp2b2lke1xyXG4gICAgICAgICAgICBMYXlhLlR3ZWVuLnRvKHRoaXMsIHthbHBoYTowLjEseDotMjE2MH0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1FeGl0VGltZSwgTGF5YS5FYXNlLmN1YmljT3V0LCBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsY2FsbGJhY2ssYXJncyksIDBcclxuICAgICAgICAgICAgKTsgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ290byB0aGUgdGFyZ2V0IHZpZXcgLG11c3QgdXNlIHRoZSBnb0JhY2sgdG8gY29tZSBiYWNrXHJcbiAgICAgICAgICogQHBhcmFtIHYgbmV3IHZpZXdcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ290b1ZpZXcodjpsYXlhLmRpc3BsYXkuTm9kZSk6bGF5YS5kaXNwbGF5Lk5vZGV7XHJcbiAgICAgICAgICAgcmV0dXJuIHN1cGVyLmFkZENoaWxkKHYpO1xyXG4gICAgICAgICAgICAvL3JlbW92ZSB0aGUgc3dpdGNoIGVmZmVjdC5cclxuICAgICAgICAgICAgLy8gbGV0IF9sb2FkaW5nOkJsYWNraW5nVUkgPSBuZXcgQmxhY2tpbmdVSSgpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmFkZENoaWxkKF9sb2FkaW5nKTtcclxuICAgICAgICAgICAgLy8gX2xvYWRpbmcuc2hvdygzMDAsTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMuYWRkVmlldyxbdixfbG9hZGluZ10pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSIsImltcG9ydCB7IGR6YXBwIH0gZnJvbSBcIi4uLy4uLy4uL01haW5cIjtcclxuaW1wb3J0IEJhc2VTY2VuZSBmcm9tIFwiLi9CYXNlU2NlbmVcIjtcclxuXHJcbi8qKlxyXG4gKiBAZGVzYyA6IGJhc2Ugdmlld1xyXG4gKiBAYXV0aG9yOiBXZW56dW9saVxyXG4gKiBARGF0ZTogMjAxOS8wNC8wOFxyXG4gKi8gXHJcbiBleHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlVmlldyBleHRlbmRzIExheWEuVmlld3tcclxuICAgICBwcml2YXRlIG1FeGl0VGltZTpudW1iZXIgPSAxMDAwKjAuNTsgXHJcbiAgICAgLyoqY3VycmVudCB6LWluZGV4IGZvciBhZGQgY2hpbGQuICovXHJcbiAgICAgcHJpdmF0ZSB6SW5kZXg6bnVtYmVyID0gMDtcclxuICAgIC8qKiBcclxuICAgICAqIFBhZ2UncyBiYXNlIHZpZXcgaW5jbHVkZSBhbGwgY29tbW9uIGZ1bmN0aW9ucy5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIC8vdGhpcy5vbihMYXlhLkV2ZW50LlJFTU9WRUQsdGhpcyx0aGlzLm9mZkFsbExpc3RlbmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkRlc3Ryb3koKTp2b2lke1xyXG4gICAgICAgIHRoaXMub2ZmQWxsTGlzdGVuZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBhbGwgdGhlIGxpc3RlbmVycyBvZiB0aGUgY3VycmVudCBwYWdlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgb2ZmQWxsTGlzdGVuZXIoKTp2b2lke1xyXG4gICAgICAgIGR6YXBwLkV2ZW50cy5vZmZBbGxCeUNhbGxlcih0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBmcm9tIHBhcmVudCBjb250YWluZXIgYW5kIGRlc3Ryb3kgc2VsZi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGV4aXRBbmREZXN0cm95KCk6dm9pZHsgXHJcbiAgICAgICAgdGhpcy5leGl0U3lzdGVtKHRoaXMuZGVzdHJveSxbdHJ1ZV0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZXhpdCBzeXN0ZW1cclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvblxyXG4gICAgICogQHBhcmFtIGFyZ3MgZnVuY3Rpb24gYXJndW1lbnRzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZXhpdFN5c3RlbShjYWxsYmFjazpGdW5jdGlvbiwuLi5hcmdzOmFueVtdKTp2b2lke1xyXG4gICAgICAgIExheWEuVHdlZW4udG8odGhpcywge2FscGhhOjAuMSx4Oi0yMTYwfSxcclxuICAgICAgICAgICAgdGhpcy5tRXhpdFRpbWUsIExheWEuRWFzZS5jdWJpY091dCwgTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLGNhbGxiYWNrLGFyZ3MpLCAwXHJcbiAgICAgICAgKTsgIFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYmFjayB0byBsYXN0IHZpZXdcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdvQmFjaygpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5leGl0QW5kRGVzdHJveSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ290byB0aGUgdGFyZ2V0IHZpZXcgLG11c3QgdXNlIHRoZSBnb0JhY2sgdG8gY29tZSBiYWNrXHJcbiAgICAgKiBAcGFyYW0gdiBuZXcgdmlld1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ290b1ZpZXcodjpsYXlhLmRpc3BsYXkuTm9kZSk6bGF5YS5kaXNwbGF5Lk5vZGV7XHJcbiAgICAgICAgIHJldHVybiBzdXBlci5hZGRDaGlsZCh2KTtcclxuICAgICAgICAgLy9yZW1vdmUgdGhlIHN3aXRjaCBlZmZlY3QuXHJcbiAgICAgICAgLy8gbGV0IF9sb2FkaW5nOkJsYWNraW5nVUkgPSBuZXcgQmxhY2tpbmdVSSgpO1xyXG4gICAgICAgIC8vIHRoaXMuYWRkQ2hpbGQoX2xvYWRpbmcpO1xyXG4gICAgICAgIC8vIF9sb2FkaW5nLnNob3coMzAwLExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLmFkZFZpZXcsW3YsX2xvYWRpbmddKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgY2hpbGQgdG8gdmlldy5cclxuICAgICAqIEBwYXJhbSBub2RlIGNoaWxkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRDaGlsZChub2RlOmxheWEuZGlzcGxheS5Ob2RlKTpsYXlhLmRpc3BsYXkuTm9kZXtcclxuICAgICAgICBpZihub2RlIGluc3RhbmNlb2YgQmFzZVNjZW5lKXtcclxuICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHNjZW5lIGluIHRoZSB2aWV3LlwiO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuekluZGV4PT11bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLnpJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKG5vZGUgaW5zdGFuY2VvZiBCYXNlVmlldyl7XHJcbiAgICAgICAgICAgIG5vZGUuek9yZGVyID0gdGhpcy56SW5kZXgrKztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ290b1ZpZXcobm9kZSk7XHJcbiAgICAgICAgfSAgICAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLmFkZENoaWxkQXQobm9kZSx0aGlzLnpJbmRleCsrKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBjaGlsZHMgdG8gdmlldy5cclxuICAgICAqIEBwYXJhbSBhcmdzIGNoaWxkc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkQ2hpbGRyZW4oLi4uYXJnczphbnlbXSk6dm9pZHtcclxuICAgICAgICBzdXBlci5hZGRDaGlsZHJlbiguLi5hcmdzKTtcclxuICAgIH1cclxufSAiLCIvKipcclxuICogQGRlc2NyaXB0aW9uIERpY3Rpb25hcnkgbW9kdWxlLlxyXG4gKiBAYXV0aG9yIHdlbnp1b2xpXHJcbiAqIEBkYXRlIDIwMTkvNC8xNlxyXG4qL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWN0aW9uYXJ5PEssVD57XHJcbiAgICBjb25zdHJ1Y3RvcigpeyBcclxuICAgICAgICB0aGlzLmVsZW1lbnRzID0gbmV3IEFycmF5KCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGVsZW1lbnRzOkFycmF5PGFueT49bnVsbDtcclxuICAgIFxyXG4gICAgLyoqTGVuZ3RoIG9mIERpY3Rpb25hcnkqL1xyXG4gICAgcHVibGljIGdldCBsZW5ndGgoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50cy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqQ2hlY2sgd2hldGhlciB0aGUgRGljdGlvbmFyeSBpcyBlbXB0eSovXHJcbiAgICBwdWJsaWMgZ2V0IGlzRW1wdHkgKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzLmxlbmd0aDwxO1xyXG4gICAgfTtcclxuICAgIC8qKnJlbW92ZSBhbGwgZWxlbWVudHMgZnJvbSB0aGUgRGljdGlvbmFyeSovXHJcbiAgICBwdWJsaWMgcmVtb3ZlQWxsKCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBuZXcgQXJyYXkoKTtcclxuICAgIH07XHJcbiAgICAvKipnZXQgc3BlY2lmeSBlbGVtZW50IG9mIHRoZSBkaWN0aW9uYXJ5Ki9cclxuICAgIHB1YmxpYyBnZXRJdGVtQnlJbmRleChpbmRleDpudW1iZXIpOlQge1xyXG4gICAgICAgIGxldCBybHQ6VCA9IG51bGw7XHJcbiAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLmVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBybHQgPSB0aGlzLmVsZW1lbnRzW2luZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgIH1cclxuICAgIC8qKmNoZWNrIHdoZXRoZXIgdGhlIERpY3Rpb25hcnkgY29udGFpbnMgdGhpcyBrZXkqL1xyXG4gICAgcHVibGljIENvbnRhaW4oa2V5OkspIHtcclxuICAgICAgICBsZXQgcmx0ID0gZmFsc2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGlMZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZWxlbWVudHNbaV0ua2V5ID09IGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBybHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqY2hlY2sgd2hldGhlciB0aGUgRGljdGlvbmFyeSBjb250YWlucyB0aGlzIHZhbHVlKi9cclxuICAgIHB1YmxpYyBjb250YWluc1ZhbHVlKHZhbHVlOlQpOmJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBybHQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpTGVuID0gdGhpcy5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRzW2ldLnZhbHVlID09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgIH07XHJcbiAgICAvKipyZW1vdmUgdGhpcyBrZXkgZnJvbSB0aGUgRGljdGlvbmFyeSovXHJcbiAgICBwdWJsaWMgcmVtb3ZlQnlLZXkoa2V5OkspOmJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBybHQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpTGVuID0gdGhpcy5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRzW2ldLmtleSA9PSBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBybHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfTtcclxuICAgIC8qKmFkZCB0aGlzIGtleS92YWx1ZSB0byB0aGUgRGljdGlvbmFyeSxpZiBrZXkgaXMgZXhpc3RzLHJlcGxhY2UgdGhlIHZhbHVlKi9cclxuICAgIHB1YmxpYyBhZGQoa2V5OkssIHZhbHVlOlQpIHtcclxuICAgICAgICBpZih0aGlzLkNvbnRhaW4oa2V5KSl7XHJcbiAgICAgICAgICAgIHRocm93IFwiY2FuJ3QgYWRkIHNhbWUga2V5IGludG8gdGhlIGRpY3Rpb25hcnkuXCI7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IFxyXG4gICAgICAgIHRoaXMuZWxlbWVudHMucHVzaCh7XHJcbiAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRWYWx1ZShrZXk6Syx2YWw6VCk6dm9pZHtcclxuICAgICAgICBsZXQgaXRlbTpUID0gdGhpcy5nZXRJdGVtQnlLZXkoa2V5KTtcclxuICAgICAgICBpdGVtID0gdmFsO1xyXG4gICAgfVxyXG4gICAgLyoqYWRkIHRoaXMga2V5L3ZhbHVlIHRvIHRoZSBEaWN0aW9uYXJ5LGlmIGtleSBpcyBleGlzdHMgdGhlbiByZWNvdmVyKi9cclxuICAgIHB1YmxpYyBzZXQoa2V5OkssIHZhbHVlOlQpIHtcclxuICAgICAgICBpZih0aGlzLkNvbnRhaW4oa2V5KSl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUoa2V5LHZhbHVlKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5wdXNoKGtleSx2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqZ2V0IHZhbHVlIG9mIHRoZSBrZXkqL1xyXG4gICAgcHVibGljIGdldEl0ZW1CeUtleShrZXk6Syk6VCB7XHJcbiAgICAgICAgbGV0IHJsdDpUID0gbnVsbDtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaUxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50c1tpXS5rZXkgPT0ga2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmx0ID0gdGhpcy5lbGVtZW50c1tpXS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgIH07XHJcbiAgICAvKipnZXQgYWxsIGtleXMgb2YgdGhlIGRpY3Rpb25hcnkqL1xyXG4gICAgcHVibGljIGtleXMoKTpBcnJheTxLPiB7XHJcbiAgICAgICAgdmFyIGFycjpBcnJheTxLPiA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpTGVuID0gdGhpcy5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgYXJyLnB1c2godGhpcy5lbGVtZW50c1tpXS5rZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG4gICAgLyoqZ2V0IGFsbCB2YWx1ZXMgb2YgdGhlIGRpY3Rpb25hcnkqL1xyXG4gICAgcHVibGljIHZhbHVlcygpOkFycmF5PFQ+IHtcclxuICAgICAgICB2YXIgYXJyOkFycmF5PFQ+ID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlMZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xyXG4gICAgICAgICAgICBhcnIucHVzaCh0aGlzLmVsZW1lbnRzW2ldLnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxufSIsIiAvKipcclxuICogYnJpZWY6Y29tbW9uIGVudW1zIGRlZmluZFxyXG4gKiBBdXRob3I6IHdlbnp1b2xpXHJcbiAqIERhdGU6IDIwMTkvMDQvMDJcclxuICovXHJcbiAgICBleHBvcnQgIGRlZmF1bHQgY2xhc3MgVXNlckNvbmZpZ3tcclxuICAgIC8qKlxyXG4gICAgICog56iL5bqP6ZyA6KaB6L+Q6KGM55qE5qih5byPXHJcbiAgICAgKi9cclxuICAgICBwdWJsaWMgc3RhdGljIFJ1bm5pbmdNb2RlPXtcclxuICAgICAgICAvKirnvZHpobXniYggKi9cclxuICAgICAgICB3ZWI6MSxcclxuICAgICAgICAvKirlvq7kv6HlsI/nqIvluo8gKi9cclxuICAgICAgICBtaW5pUHJvZ3JhbToyLCBcclxuICAgICAgICAvKirlronljZNBUFAgKi9cclxuICAgICAgICBhbmRyb2lkQXBwOjMsXHJcbiAgICAgICAgLyoqSU9TIEFQUCAqL1xyXG4gICAgICAgIGlvc0FwcDo0XHJcbiAgICB9XHJcbiAgICAvKipjb25uZWN0aW9uIGNvbnRyb2wgcm9vbSBJRCAqL1xyXG4gICAgc3RhdGljIGNvbnRyb2xSb29tSWQ6bnVtYmVyID0gMFgxMTA0MTEwNDtcclxuICAgIC8qKnN5c3RlbSBiYXNlIHJvb20gaWQ6R0Mgc2VydmVyICovXHJcbiAgICBzdGF0aWMgYmFzZVJvb21JZDpudW1iZXIgPSAxO1xyXG4gICAgLyoqIHByb2dyYW0gcnVubmluZyBtb2RlOndlYi9taW5pcHJvZ3JhbS9hbmRyb2lkIGFwcC9pb3MgYXBwIGUuZy4qL1xyXG4gICAgc3RhdGljIHJ1bm5pbmdNb2RlOm51bWJlciA9IFVzZXJDb25maWcuUnVubmluZ01vZGUud2ViO1xyXG4gICAgLyoqZ2FtZSBzZXJ2ZXIgYWRkcmVzczpkZXYgc2VydmVyOjE3Mi4xNy4zLjE4MCAqL1xyXG4gICAgc3RhdGljIHNlcnZlckFkZHJlc3M6c3RyaW5nID0gXCIxNzIuMTcuMy4xODBcIjtcclxuICAgIC8qKmdhbWUgc2VydmVyIHBvcnQ7ZGVmYXVsdCBwb3J0OjgzMDAgKi9cclxuICAgIHN0YXRpYyBzZXJ2ZXJQb3J0Om51bWJlciA9IDc3Nzc7XHJcbiAgICAvL0N1c3RvbSBnYW1lIGNvbmZpZyBpbnRvIGhlcmVcclxuICAgIC8qKmVuYWJsZSBsb2cgcHJpbnQgKi9cclxuICAgIHN0YXRpYyBlbmFibGVFdmVudExvZzpib29sZWFuID0gZmFsc2U7XHJcbiAgICAvKipldmVudCBsb2cgc3VibWl0IHBhdGguICovXHJcbiAgICBzdGF0aWMgZXZlbnRMb2dTdWJtaXRVcmw6c3RyaW5nID0gXCJodHRwOi8vc3RhdDIud2ViLnl5LmNvbS9jLmdpZlwiO1xyXG4gICAgLyoqcmVzb3VyY2UgdXJsICovXHJcbiAgICBzdGF0aWMgUmVzb3VyY2VVcmw6c3RyaW5nID1cImh0dHBzOi8vc21hbGwuZG96ZW5nYW1lLmNvbS9cIjtcclxuICAgIC8vZS5nLlxyXG4gICAgLy9zdGF0aWMgcmVzb3VyY2VVcmw6c3RyaW5nID0gXCJodHRwOi8vZ2FtZS5kb3plbmdhbWUuY29tL1wiO1xyXG4gICAgLy9DdXN0b20gZ2FtZSBjb25maWcgZW5kLlxyXG4gICAgIFxyXG59XHJcbmV4cG9ydCBlbnVtIExvZ2dlckxldmVse1xyXG4gICAgQUxMPTAsXHJcbiAgICBUUkFDRSxcclxuICAgIERFQlVHLFxyXG4gICAgSU5GTyxcclxuICAgIFdBUk4sXHJcbiAgICBFUlJPUixcclxuICAgIEZBVEFMLFxyXG4gICAgT0ZGXHJcbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNMaXN0IHsgXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwcmVsb2FkIHJlc1xyXG4gICAgICovXHJcbiAgIHB1YmxpYyBzdGF0aWMgUHJlbG9hZDphbnlbXSA9IFtcclxuICAgICAgICB7dXJsOlwidWkuanNvblwiLCB0eXBlOkxheWEuTG9hZGVyLkpTT059LFxyXG4gICAgICAgIHt1cmw6XCJyZXMvYXRsYXMvY29tcC5hdGxhc1wifSxcclxuICAgICAgICB7dXJsOlwicmVzL2F0bGFzL3Rlc3QuYXRsYXNcIn1cclxuICAgIF07XHJcblxyXG59IiwiXHJcbmltcG9ydCB7IGR6YXBwIH0gZnJvbSBcIi4uLy4uLy4uL01haW5cIjsgXHJcbmltcG9ydCBEaWN0aW9uYXJ5IGZyb20gXCIuLi8uLi9jb21wb25lbnRzL2V4dGVuZC9EaWN0aW9uYXJ5XCI7XHJcbmltcG9ydCBCYXNlU2NlbmUgZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvZHpwYWdlL0Jhc2VTY2VuZVwiO1xyXG5pbXBvcnQgQmFzZVZpZXcgZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvZHpwYWdlL0Jhc2VWaWV3XCI7XHJcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL2R6cGFnZS9CYXNlRGFpbG9nXCI7XHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24g5LqL5Lu255uR5ZCs5LiO5rS+5Y+RXHJcbiAqIEBhdXRob3Igd2VuenVvbGlcclxuICogQGRhdGU6IDA0LzE4LzIwMTlcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50RGlzcGF0Y2h7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMubURpYyA9IG5ldyBEaWN0aW9uYXJ5PG51bWJlcixEaWN0aW9uYXJ5PGFueSxEaWN0aW9uYXJ5PHN0cmluZyxMaXN0ZW5FbnRpdHk+Pj4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1EaWM6RGljdGlvbmFyeTxudW1iZXIsRGljdGlvbmFyeTxhbnksRGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5Pj4+ID0gbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOS9v+eUqCBFdmVudERpc3BhdGNoZXIg5a+56LGh5rOo5YaM5oyH5a6a57G75Z6L55qE5LqL5Lu25L6m5ZCs5Zmo5a+56LGh77yM5Lul5L2/5L6m5ZCs5Zmo6IO95aSf5o6l5pS25LqL5Lu26YCa55+l44CCXHJcbiAgICAgKiBAcGFyYW0gcm9vbUlkIOacjeWKoeWZqElEIOeUseS9oOi/nuaOpeeahOa4uOaIj+ehruWumlxyXG4gICAgICogQHBhcmFtIHR5cGUg5LqL5Lu257G75Z6LIOWmgiDigJxDTElDS+KAnSDkuYvnsbsg5Y+C6ICDIExheWEuRXZlbnQuQ0xJQ0tcclxuICAgICAqIEBwYXJhbSBjYWxsZXIg5LqL5Lu25L6m5ZCs5Ye95pWw55qE5omn6KGM5Z+fXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIg5LqL5Lu25L6m5ZCs5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBMaXN0ZW4ocm9vbUlkOm51bWJlcix0eXBlOnN0cmluZyxjYWxsZXI6YW55LGxpc3RlbmVyOkZ1bmN0aW9uKTp2b2lke1xyXG4gICAgICAgIGxldCBfYWxsb3c6Ym9vbGVhbiA9IGNhbGxlciBpbnN0YW5jZW9mIEJhc2VTY2VuZXx8Y2FsbGVyIGluc3RhbmNlb2YgQmFzZVZpZXd8fGNhbGxlciBpbnN0YW5jZW9mIEJhc2VEaWFsb2c7XHJcbiAgICAgICAgaWYoIWNhbGxlcnx8IV9hbGxvdyl7XHJcbiAgICAgICAgICAgIHRocm93IFwiRXJyb3I6VGhlIGxpc3RlbiBjYWxsZXIganVzdCBhbGxvdyB1c2UgdGhlIEJhc2VTY2VuZXxCYXNlVmlld3xCYXNlRGFpbG9nLiBhdDpcIitjYWxsZXIuY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgX3Jvb206RGljdGlvbmFyeTxhbnksRGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5Pj4gPSB0aGlzLm1EaWMuZ2V0SXRlbUJ5S2V5KHJvb21JZCk7XHJcbiAgICAgICAgbGV0IF9pdGVtOkxpc3RlbkVudGl0eSA9IG5ldyBMaXN0ZW5FbnRpdHkocm9vbUlkLGNhbGxlcix0eXBlLGxpc3RlbmVyKTtcclxuXHJcbiAgICAgICAgaWYoX3Jvb20pe1xyXG4gICAgICAgICAgICBsZXQgX2NsOkRpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4gPSBfcm9vbS5nZXRJdGVtQnlLZXkoY2FsbGVyKTtcclxuICAgICAgICAgICAgaWYoX2NsKXtcclxuICAgICAgICAgICAgICAgIF9jbC5hZGQodHlwZSxfaXRlbSk7XHJcbiAgICAgICAgICAgIH1lbHNleyBcclxuICAgICAgICAgICAgICAgIF9jbCA9IG5ldyBEaWN0aW9uYXJ5PHN0cmluZyxMaXN0ZW5FbnRpdHk+KCk7XHJcbiAgICAgICAgICAgICAgICBfY2wuYWRkKHR5cGUsX2l0ZW0pO1xyXG4gICAgICAgICAgICAgICAgX3Jvb20uYWRkKGNhbGxlcixfY2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIF9yb29tID0gbmV3IERpY3Rpb25hcnk8YW55LERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4+KCk7XHJcbiAgICAgICAgICAgIGxldCBfY2w6RGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5PiA9bmV3IERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4oKTtcclxuICAgICAgICAgICAgX2NsLmFkZCh0eXBlLF9pdGVtKTtcclxuICAgICAgICAgICAgX3Jvb20uYWRkKHJvb21JZCxfY2wpO1xyXG4gICAgICAgICAgICB0aGlzLm1EaWMuYWRkKHJvb21JZCxfcm9vbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGR6YXBwLkxvZ2dlci5pbmZvKFwiQWRkIGxpc3RlbiBmb3I6XCIrcm9vbUlkK1wiOlwiK3R5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5rS+5Y+R5LqL5Lu2XHJcbiAgICAgKiBAcGFyYW0gcm9vbUlkIOacjeWKoeWZqElEIOeUseS9oOi/nuaOpeeahOa4uOaIj+ehruWumlxyXG4gICAgICogQHBhcmFtIHR5cGUg5LqL5Lu257G75Z6LIOWmgiDigJxDTElDS+KAnSDkuYvnsbsg5Y+C6ICDIExheWEuRXZlbnQuQ0xJQ0tcclxuICAgICAqIEBwYXJhbSBkYXRhIO+8iOWPr+mAie+8ieWbnuiwg+aVsOaNruOAgjxiPuazqOaEj++8mjwvYj7lpoLmnpzmmK/pnIDopoHkvKDpgJLlpJrkuKrlj4LmlbAgcDEscDIscDMsLi4u5Y+v5Lul5L2/55So5pWw57uE57uT5p6E5aaC77yaW3AxLHAyLHAzLC4uLl0g77yb5aaC5p6c6ZyA6KaB5Zue6LCD5Y2V5Liq5Y+C5pWwIHAg77yM5LiUIHAg5piv5LiA5Liq5pWw57uE77yM5YiZ6ZyA6KaB5L2/55So57uT5p6E5aaC77yaW3Bd77yM5YW25LuW55qE5Y2V5Liq5Y+C5pWwIHAg77yM5Y+v5Lul55u05o6l5Lyg5YWl5Y+C5pWwIHDjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIEV2ZW50KHJvb21JZDpudW1iZXIsdHlwZTpzdHJpbmcsZGF0YT86YW55KTp2b2lke1xyXG4gICAgICAgIGxldCBfcm9vbTpEaWN0aW9uYXJ5PGFueSxEaWN0aW9uYXJ5PHN0cmluZyxMaXN0ZW5FbnRpdHk+PiA9IHRoaXMubURpYy5nZXRJdGVtQnlLZXkocm9vbUlkKTtcclxuICAgICAgICBpZihfcm9vbSl7XHJcbiAgICAgICAgICAgIGxldCBfY2xzOkFycmF5PGFueT4gPSBfcm9vbS5rZXlzKCk7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8X2Nscy5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgICAgIGxldCBfY2w6RGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5PiA9IF9yb29tLmdldEl0ZW1CeUtleShfY2xzW2ldKTtcclxuICAgICAgICAgICAgICAgIGxldCBfbHN0Okxpc3RlbkVudGl0eSA9IF9jbC5nZXRJdGVtQnlLZXkodHlwZSk7XHJcbiAgICAgICAgICAgICAgICBpZihfbHN0KXtcclxuICAgICAgICAgICAgICAgICAgICBfbHN0Lkxpc3RlbmVyLnJ1bldpdGgoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBkemFwcC5Mb2dnZXIud2FybihcIk5ldHdvcmsgZXZlbnQgbm8gaGFuZGxlcjpcIityb29tSWQrXCI6XCIrdHlwZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZHphcHAuTG9nZ2VyLndhcm4oXCJOZXR3b3JrIGV2ZW50IG5vIGhhbmRsZXI6XCIrcm9vbUlkK1wiOlwiK3R5cGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS7jiBFdmVudERpc3BhdGNoZXIg5a+56LGh5Lit5Yig6Zmk5L6m5ZCs5Zmo44CCXHJcbiAgICAgKiBAcGFyYW0gcm9vbUlkIOimgeWIoOmZpOWTquS4quacjeWKoeWZqOeahOebkeWQrOWZqFxyXG4gICAgICogQHBhcmFtIHR5cGUg6KaB5Yig6Zmk55qE5LqL5Lu257G75Z6LXHJcbiAgICAgKiBAcGFyYW0gY2FsbGVyIOimgeWIoOmZpOeahOWHveaVsOeahOaJp+ihjOWfn1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2ZmKHJvb21JZDpudW1iZXIsdHlwZTpzdHJpbmcsY2FsbGVyOmFueSk6dm9pZHtcclxuICAgICAgICBsZXQgX3Jvb206RGljdGlvbmFyeTxhbnksRGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5Pj4gPSB0aGlzLm1EaWMuZ2V0SXRlbUJ5S2V5KHJvb21JZCk7XHJcbiAgICAgICAgaWYoX3Jvb20pe1xyXG4gICAgICAgICAgICBsZXQgX2NsOkRpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4gPSBfcm9vbS5nZXRJdGVtQnlLZXkoY2FsbGVyKTtcclxuICAgICAgICAgICAgaWYoX2NsKXtcclxuICAgICAgICAgICAgICAgIGxldCBfbHN0ID0gX2NsLmdldEl0ZW1CeUtleSh0eXBlKTtcclxuICAgICAgICAgICAgICAgIF9sc3QgJiYgX2NsLnJlbW92ZUJ5S2V5KHR5cGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5LqL5Lu257G75Yig6Zmk5LqL5Lu255uR5ZCsXHJcbiAgICAgKiBAcGFyYW0gdHlwZSDopoHliKDpmaTnmoTkuovku7bnsbvlnotcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9mZkFsbEJ5VHlwZSh0eXBlOnN0cmluZyk6dm9pZHtcclxuICAgICAgICBsZXQgX3JrZXlzOkFycmF5PG51bWJlcj4gPSB0aGlzLm1EaWMua2V5cygpO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7aTxfcmtleXMubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIGxldCBfY2xzOkRpY3Rpb25hcnk8YW55LERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4+ICA9IHRoaXMubURpYy5nZXRJdGVtQnlLZXkoX3JrZXlzW2ldKTtcclxuICAgICAgICAgICAgbGV0IF9jbHNrZXlzOkFycmF5PGFueT4gPSBfY2xzLmtleXMoKTtcclxuICAgICAgICAgICAgZm9yKGxldCBqPTA7ajxfY2xza2V5cy5sZW5ndGg7aisrKXtcclxuICAgICAgICAgICAgICAgIGxldCBfY2w6RGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5PiA9IF9jbHMuZ2V0SXRlbUJ5S2V5KF9jbHNrZXlzW2pdKTtcclxuICAgICAgICAgICAgICAgIGlmKF9jbC5Db250YWluKHR5cGUpKXtcclxuICAgICAgICAgICAgICAgICAgICBfY2wucmVtb3ZlQnlLZXkodHlwZSk7XHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5omn6KGM5Z+f5Yig6Zmk5omA5pyJ55uR5ZCsXHJcbiAgICAgKiBAcGFyYW0gY2FsbGVyIOaJp+ihjOWfn1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2ZmQWxsQnlDYWxsZXIoY2FsbGVyOmFueSk6dm9pZHtcclxuICAgICAgICBsZXQgX3JrZXlzOkFycmF5PG51bWJlcj4gPSB0aGlzLm1EaWMua2V5cygpO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7aTxfcmtleXMubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIGxldCBfY2xzOkRpY3Rpb25hcnk8YW55LERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4+ICA9IHRoaXMubURpYy5nZXRJdGVtQnlLZXkoX3JrZXlzW2ldKTtcclxuICAgICAgICAgICAgbGV0IF9jbDpEaWN0aW9uYXJ5PHN0cmluZyxMaXN0ZW5FbnRpdHk+ID0gX2Nscy5nZXRJdGVtQnlLZXkoY2FsbGVyKTtcclxuICAgICAgICAgICAgaWYoX2Nscy5Db250YWluKGNhbGxlcikpe1xyXG4gICAgICAgICAgICAgICAgX2Nscy5yZW1vdmVCeUtleShjYWxsZXIpO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIoOmZpOaJgOacieebkeWQrFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2ZmQWxsKCk6dm9pZHtcclxuICAgICAgICAgdGhpcy5tRGljID0gbmV3IERpY3Rpb25hcnk8bnVtYmVyLERpY3Rpb25hcnk8YW55LERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4+PigpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBMaXN0ZW5FbnRpdHl7XHJcbiAgICBjb25zdHJ1Y3RvcihyaWQ6bnVtYmVyLGNhbGxlcjphbnksdHlwZTpzdHJpbmcsbGlzdGVuZXI6RnVuY3Rpb24pe1xyXG4gICAgICAgIHRoaXMubVJvb21JZCA9IHJpZDtcclxuICAgICAgICB0aGlzLm1DYWxsZXIgPSBjYWxsZXI7XHJcbiAgICAgICAgdGhpcy5tVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5tTGlzdGVuZXIgPSBMYXlhLkhhbmRsZXIuY3JlYXRlKGNhbGxlcixsaXN0ZW5lcixudWxsLGZhbHNlKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgbVJvb21JZDpudW1iZXIgPTA7XHJcbiAgICBwcml2YXRlIG1DYWxsZXI6YW55ID0gbnVsbDtcclxuICAgIHByaXZhdGUgbVR5cGU6c3RyaW5nID0gbnVsbDtcclxuICAgIHByaXZhdGUgbUxpc3RlbmVyOkxheWEuSGFuZGxlciA9IG51bGw7IFxyXG5cclxuICAgIHB1YmxpYyBnZXQgTGlzdGVuZXIoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5tTGlzdGVuZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBDYWxsZXIoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5tQ2FsbGVyO1xyXG4gICAgfVxyXG4gICAgICAgIFxyXG59XHJcbiIsImltcG9ydCB7IExvZ2dlckxldmVsIH0gZnJvbSBcIi4uLy4uL2NvbmZpZ3MvY3VzdG9tY2ZnL1VzZXJDb25maWdcIjtcclxuXHJcbi8qKlxyXG4gKiBAZGVzYyA6IGxvZyBoYW5kbGVyLlxyXG4gKiBAYXV0aG9yOiBXZW56dW9saVxyXG4gKiBARGF0ZTogMjAxOS8wNC8wOFxyXG4gKi8gXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvZ2dlcntcclxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipwcmludCBsb2cgbGV2ZWw6ZGVmYXVsdCBvbmx5IHByaW50IGVycm9yIGxvZyAqL1xyXG4gICAgICAgIHByaXZhdGUgX2xldmVsOkxvZ2dlckxldmVsID0gTG9nZ2VyTGV2ZWwuRVJST1I7XHJcbiAgICAgICAgLyoqc2V0dXAgdGhlIGxvZ2dlciBwcmludCBsZXZlbC4gKi9cclxuICAgICAgICBwdWJsaWMgc2V0IExldmVsKGxldmVsOkxvZ2dlckxldmVsKXtcclxuICAgICAgICAgICAgdGhpcy5fbGV2ZWwgPSBsZXZlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqcHJpbnQgZGVidWcgbG9nICovXHJcbiAgICAgICAgcHVibGljIGRlYnVnKC4uLmFyZ3M6YW55W10pOnZvaWR7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2coTG9nZ2VyTGV2ZWwuREVCVUcsYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKnByaW50IGluZm8gbG9nICovXHJcbiAgICAgICAgcHVibGljIGluZm8oLi4uYXJnczphbnlbXSk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy53cml0ZUxvZyhMb2dnZXJMZXZlbC5JTkZPLGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipwcmludCB3YXJuIGxvZzp3aWxsIGJlIGhpZ2hsaWdodGVkICovXHJcbiAgICAgICAgcHVibGljIHdhcm4oLi4uYXJnczphbnlbXSk6dm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2coTG9nZ2VyTGV2ZWwuV0FSTixhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqcHJpbnQgd2FybiBsb2c6d2lsbCBiZSBoaWdobGlnaHRlZCAqL1xyXG4gICAgICAgIHB1YmxpYyBlcnJvciguLi5hcmdzOmFueVtdKTp2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy53cml0ZUxvZyhMb2dnZXJMZXZlbC5FUlJPUixhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgIC8qKnByaW50IHdhcm4gbG9nOndpbGwgYmUgaGlnaGxpZ2h0ZWQgKi9cclxuICAgICAgICBwdWJsaWMgZmF0YWwoLi4uYXJnczphbnlbXSk6dm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2coTG9nZ2VyTGV2ZWwuRkFUQUwsYXJncyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHdyaXRlTG9nKGxldmVsOm51bWJlcixhcmdzOmFueVtdKTp2b2lke1xyXG4gICAgICAgICAgICBpZih0aGlzLl9sZXZlbD49bGV2ZWwpe1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoKGxldmVsKXtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIExvZ2dlckxldmVsLkVSUk9SOlxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTG9nZ2VyTGV2ZWwuV0FSTjpcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIExvZ2dlckxldmVsLkZBVEFMOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9jb25zb2xlW0RaR2FtZS5Vc2VyQ29uZmlnLkxvZ2dlckxldmVsW2xldmVsXS50b0xvd2VyQ2FzZSgpXSguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICB9IFxyXG4iLCJpbXBvcnQgV2ViU29ja2V0IGZyb20gXCIuL1dlYlNvY2tldFwiO1xyXG5pbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7XHJcbmltcG9ydCBVc2VyQ29uZmlnIGZyb20gXCIuLi8uLi9jb25maWdzL2N1c3RvbWNmZy9Vc2VyQ29uZmlnXCI7XHJcbi8qKlxyXG4gKiBicmllZjpOZXR3b3JrIGJ1c2luZXNzIGluc3RhbmNlXHJcbiAqIEF1dGhvcjogd2VuenVvbGlcclxuICogRGF0ZTogMjAxOS8wNC8wMlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTmV0d29ya01ncntcclxuICAgIC8qKnNvY2tldCBjb21tdW5pY2F0aW9uICovXHJcbiAgICBwcml2YXRlIG1XZWJzb2NrZXQ6V2ViU29ja2V0PW51bGw7XHJcbiAgICAvKipnYW1lIHNlcnZlciBkaXNjb25uZWN0IGNhbGxiYWNrICovXHJcbiAgICBwcml2YXRlIG1Jc0Rpc2Nvbm5lY3Q6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAvKipnYW1lIHNlcnZlciBjb25uZWN0IGNhbGxiYWNrICovXHJcbiAgICBwcml2YXRlIG1PbkNvbm5lY3Rpbmc6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICAvKipnYW1lIHNlcnZlciBjb25uZWN0IGNhbGxiYWNrICovXHJcbiAgICBwcml2YXRlIG1PbkNvbm5lY3RlZDpMYXlhLkhhbmRsZXI9bnVsbDtcclxuICAgIC8qKmdhbWUgc2VydmVyIGNvbm5lY3QgZmFpbGVkIGNhbGxiYWNrICovXHJcbiAgICBwcml2YXRlIG1PbkNvbm5lY3RGYWlsZWQ6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICAvKipzZW5kIG1lc3NhZ2UgZmFpbGVkIGNhbGxiYWNrLiAqL1xyXG4gICAgcHJpdmF0ZSBtT25TZW5kTXNnRmFpbGVkOkxheWEuSGFuZGxlciA9IG51bGw7XHJcbiAgICAvKip0aGUgdGVtcCBtZXNzYWdlIGJ1ZmZlciAgKi9cclxuICAgIHByaXZhdGUgbU9ialNwbGl0TXNnOm9iamVjdCA9IHt9O1xyXG4gICAgLyoqbWVzc2FnZSBwYWNrYWdlIG1vZHVsZSAqL1xyXG4gICAgcHJpdmF0ZSBtTXNnUGFja2FnZTphbnkgPSBudWxsO1xyXG4gXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBuZXR3b3JrIGhhbmRsZXIgbW9kdWxlOnNlbmQgbWVzc2FnZSBlLmcuXHJcbiAgICAgKiBAcGFyYW0gb25Db25uZWN0ZWQgY29ubmVjdCBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvbkNvbm5lY3RlZDpMYXlhLkhhbmRsZXIsb25Db25uZWN0RmFpbGVkOkxheWEuSGFuZGxlcixvblNlbmRNc2dGYWlsZWQ/OkxheWEuSGFuZGxlcil7XHJcbiAgICAgICAgLy90b2RvOndlbnp1b2xpIG1vZGlmeSB0byB1c2UgaW1wb3J0IHRvIGF0dGFjaC5cclxuICAgICAgICB0aGlzLm1Nc2dQYWNrYWdlID0gTGF5YS5Ccm93c2VyLndpbmRvdy5tc2dwYWNrNSgpO1xyXG4gICAgICAgIHRoaXMubU9uQ29ubmVjdGVkID0gb25Db25uZWN0ZWQ7XHJcbiAgICAgICAgdGhpcy5tT25Db25uZWN0RmFpbGVkID0gb25Db25uZWN0RmFpbGVkO1xyXG4gICAgICAgIGxldCBfc3RhcnRDb25uZWN0aW5nOkxheWEuSGFuZGxlciA9IExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLnN0YXJ0Q29ubmVjdGluZyk7XHJcbiAgICAgICAgbGV0IF9hZnRlckNvbm5lY3Q6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMuYWZ0ZXJDb25uZWN0ZWQpO1xyXG4gICAgICAgIGxldCBfYWZ0ZXJDb25uZWN0RmFpbGVkOkxheWEuSGFuZGxlciA9IExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLmFmdGVyQ29ubmVjdEZhaWxlZCk7XHJcbiAgICAgICAgbGV0IF9hZnRlckRpc2Nvbm5lY3Q6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMuYWZ0ZXJEaXNjb25uZWN0ZWQpO1xyXG4gICAgICAgIGxldCBfYWZ0ZXJNc2c6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMucmVjZWl2ZWRNc2csbnVsbCxmYWxzZSk7XHJcbiAgICAgICAgb25TZW5kTXNnRmFpbGVkICYmICh0aGlzLm1PblNlbmRNc2dGYWlsZWQgPSBvblNlbmRNc2dGYWlsZWQpO1xyXG4gICAgICAgIHRoaXMubVdlYnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoX3N0YXJ0Q29ubmVjdGluZyxfYWZ0ZXJDb25uZWN0LF9hZnRlckNvbm5lY3RGYWlsZWQsX2FmdGVyRGlzY29ubmVjdCxfYWZ0ZXJNc2cpO1xyXG4gICAgICAgIHRoaXMubVdlYnNvY2tldC5BdXRvUmVjb25uZWN0PXRydWU7XHJcbiAgICAgICAgdGhpcy5tV2Vic29ja2V0LmNvbm5lY3QoVXNlckNvbmZpZy5zZXJ2ZXJBZGRyZXNzLFVzZXJDb25maWcuc2VydmVyUG9ydCk7XHJcbiAgICB9XHJcbiAgICAgLyoqc3RhcnQgY29ubmVjdGluZyB0byBnYW1lIHNlcnZlciAqL1xyXG4gICAgIHByaXZhdGUgc3RhcnRDb25uZWN0aW5nKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5zaG93TG9hZGluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKmFmdGVyIGNvbm5lY3RlZCB0byBnYW1lIHNlcnZlciAqL1xyXG4gICAgcHJpdmF0ZSBhZnRlckNvbm5lY3RlZCgpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5tSXNEaXNjb25uZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgZHphcHAuaGlkZUxvYWRpbmcoKTtcclxuICAgICAgICBpZih0aGlzLm1PbkNvbm5lY3RlZCl7XHJcbiAgICAgICAgICAgIHRoaXMubU9uQ29ubmVjdGVkLnJ1bigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKmFmdGVyIGNvbm5lY3RlZCB0byBnYW1lIHNlcnZlciBmYWlsZWQgY2FsbGJhY2sgKi9cclxuICAgIHByaXZhdGUgYWZ0ZXJDb25uZWN0RmFpbGVkKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5oaWRlTG9hZGluZygpO1xyXG4gICAgICAgIGlmKHRoaXMubU9uQ29ubmVjdEZhaWxlZCl7XHJcbiAgICAgICAgICAgIHRoaXMubU9uQ29ubmVjdEZhaWxlZC5ydW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiphZnRlciBnYW1lIHNlcnZlciBkaXNjb25uZWN0ICovXHJcbiAgICBwcml2YXRlIGFmdGVyRGlzY29ubmVjdGVkKCk6dm9pZHtcclxuICAgICAgICBpZighdGhpcy5tSXNEaXNjb25uZWN0KXtcclxuICAgICAgICAgICAgdGhpcy5tSXNEaXNjb25uZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZHphcHAuc2hvd1RvYXN0KFwi572R57uc5pat5byAXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogYWZ0ZXIgcmVjZWl2ZWQgbWVzc2FnZSBjYWxsYmFjay4gXHJcbiAgICAgKiBAcGFyYW0gZGF0YSByZWNlaXZlZCBkYXRhIGZyb20gd2Vic29ja2V0IG1vZHVsZVtldmVudG5hbWU6c3RyaW5nLGRhdGE6Ynl0ZV1cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZWNlaXZlZE1zZyhkYXRhKTp2b2lke1xyXG4gICAgICAgIC8vcHJlZml4IG1lYW4gdGhpcyBtZXNzYWdlIHJlY2VpdmVkIGZyb20gd2l0Y2ggZ2FtZSBzZXJ2ZXIuXHJcbiAgICAgICAgbGV0IF9wcmVmaXg6c3RyaW5nID0gZGF0YVswXTtcclxuICAgICAgICBsZXQgX21zZzphbnkgPWRhdGE7XHJcblxyXG4gICAgICAgIGxldCBldmVudE5hbWU6c3RyaW5nID0gXCJcIjtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGxldCBieXRlID0gbmV3IExheWEuQnl0ZShfbXNnKTtcclxuICAgICAgICAgICAgbGV0IF9yb29tSWQ6bnVtYmVyID0gYnl0ZS5nZXRJbnQzMigpO1xyXG4gICAgICAgICAgICBldmVudE5hbWUgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICBpZihfcm9vbUlkPT0wWDExMDQxMTA0KXsvLyBnYyBjb25uZWN0ICYgZ3MgY29ubmVjdCBzdWNjZXNzZnVsbHkuXHJcbiAgICAgICAgICAgICAgICBkemFwcC5Mb2dnZXIuaW5mbyhcImNvbm5lY3QgZ2MvZ3Mgc3VjY2Vzc2Z1bGx5Li5cIik7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG8gaWYgbmVlZC4gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYodGhpcy5pc0tpY2tPZmYoZXZlbnROYW1lKSl7XHJcbiAgICAgICAgICAgICAgICAvL1RPRE86d2VuenVvbGlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaChldmVudE5hbWUpe1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIllPVUtJQ0tcIjpcclxuICAgICAgICAgICAgICAgICAgICAvL1RPRE86d2VuenVvbGlcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIk1TR1BBQ0xfUFJPVE9DT0xcIjpcclxuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWUgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtcFNpemUgPSBieXRlLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1wQXJyQnl0ZTogVWludDhBcnJheSA9IGJ5dGUuZ2V0VWludDhBcnJheShieXRlLnBvcywgbXBTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1zZ1BhY2thZ2VEaXNwYXRjaChfcm9vbUlkLGV2ZW50TmFtZSxtcEFyckJ5dGUpOyBcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIk1TR1BBQ0xfUFJPVE9DT0xfU1BMSVRfU1RBUlRcIjpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY21kID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1PYmpTcGxpdE1zZ1tjbWRdID0gbmV3IExheWEuQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiTVNHUEFDTF9QUk9UT0NPTF9TUExJVFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjbWQgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzaXplID0gYnl0ZS5nZXRJbnQzMigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzcGxpdEJ5dGUgPSB0aGlzLm1PYmpTcGxpdE1zZ1tjbWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwbGl0Qnl0ZS53cml0ZUFycmF5QnVmZmVyKGJ5dGUuYnVmZmVyLCBieXRlLnBvcywgc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJNU0dQQUNMX1BST1RPQ09MX1NQTElUX0VORFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjbWQgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzcGxpdEJ5dGUgPSB0aGlzLm1PYmpTcGxpdE1zZ1tjbWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtcEFyckJ5dGU6IFVpbnQ4QXJyYXkgPSBzcGxpdEJ5dGUuZ2V0VWludDhBcnJheSgwLCBzcGxpdEJ5dGUubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmdzT25Nc2dQYWNrTXNnKGNtZCwgbXBBcnJCeXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1zZ1BhY2thZ2VEaXNwYXRjaChfcm9vbUlkLGNtZCxtcEFyckJ5dGUpOyBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1PYmpTcGxpdE1zZ1tjbWRdID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvL2V2ZW50IG5hbWUgbmVlZCBhZGQgdGhlIGxvY2FsIHByb3RvY29sIHByZWZpeC5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vcm1hbE1zZ0Rpc3BhdGNoKF9yb29tSWQsZXZlbnROYW1lLGJ5dGUpOyBcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICBcclxuICAgICAgICAgICAgYnl0ZS5jbGVhcigpO1xyXG4gICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgZHphcHAuTG9nZ2VyLmVycm9yKGUubWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWVzc2FnZSBwYWNrYWdlIGRpc3BhdGNoXHJcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIGV2ZW50IG5hbWVcclxuICAgICAqIEBwYXJhbSBtcEJ5dGUgcmVjZWl2ZWQgYnVmZmVyXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgbXNnUGFja2FnZURpc3BhdGNoKHJvb21JZDpudW1iZXIsZXZlbnROYW1lOnN0cmluZyxtcEJ5dGU6VWludDhBcnJheSk6dm9pZHtcclxuICAgICAgICBsZXQgZGF0YSA9IHRoaXMubU1zZ1BhY2thZ2UuZGVjb2RlKG1wQnl0ZSk7ICBcclxuICAgICAgICB0aGlzLm5vcm1hbE1zZ0Rpc3BhdGNoKHJvb21JZCxldmVudE5hbWUsZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBub3JtYWwgbWVzc2FnZSBkaXNwYXRjaChieXRlKVxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBldmVudCBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBuZWVkIGRpc3BhdGNoIGRhdGEoYnl0ZSlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBub3JtYWxNc2dEaXNwYXRjaChyb29tSWQ6bnVtYmVyLGV2ZW50TmFtZTpzdHJpbmcsZGF0YTphbnkpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuTG9nZ2VyLmluZm8oXCJyZWNlaXZlZCBtZXNzYWdlOlwiK2V2ZW50TmFtZSk7XHJcbiAgICAgICAgZHphcHAuRXZlbnRzLkV2ZW50KHJvb21JZCxldmVudE5hbWUsZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kIG1lc3NhZ2UgcGFja2FnZS5cclxuICAgICAqIEBwYXJhbSBjb21tYW5kIHByb3RvY29sIGV2ZW50IG5hbWVcclxuICAgICAqIEBwYXJhbSBhcmdzIG90aGVyIHBhcmFtZXRlcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNlbmRNc2dQYWNrYWdlKHJvb21JZDpudW1iZXIsY29tbWFuZDpzdHJpbmcsLi4uYXJnczphbnlbXSl7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLm1Nc2dQYWNrYWdlLmVuY29kZShhcmdzKTtcclxuICAgICAgICAgICAgdmFyIGJ5dGU6TGF5YS5CeXRlID0gbmV3IExheWEuQnl0ZSgpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlSW50MzIocm9vbUlkKTtcclxuICAgICAgICAgICAgYnl0ZS53cml0ZVVURlN0cmluZyhcIk1TR1BBQ0xfUFJPVE9DT0xcIik7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcoY29tbWFuZCk7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVJbnQzMihkYXRhLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVBcnJheUJ1ZmZlcihkYXRhLDApOyBcclxuICAgICAgICAgICAgLy8gZm9yKGxldCBpID0gMDsgaTwgZGF0YS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIC8vICAgICBieXRlLndyaXRlQnl0ZShkYXRhW2ldKTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKGJ5dGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VuZCBub3JtYWwgbWVzc2FnZS5cclxuICAgICAqIEBwYXJhbSBieXRlIHNlbmQgYnVmZmVyXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2VuZE1lc3NhZ2UoYnl0ZTpMYXlhLkJ5dGUpOnZvaWR7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBpZihudWxsICE9IHRoaXMubVdlYnNvY2tldCl7XHJcbiAgICAgICAgICAgICAgICAvLyBpZih0aW1lb3V0PjApe1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIHRoaXMub25UdXJub25EZWxheSh0aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIC8vIH0gXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRTb2NrZXRNc2coYnl0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIGR6YXBwLkxvZ2dlci5lcnJvcihlLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoZWNrIGlzIGtpY2tvZmYgYnkgc2VydmVyXHJcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIGV2ZW50IG5hbWVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBpc0tpY2tPZmYoZXZlbnROYW1lOnN0cmluZyk6Ym9vbGVhbntcclxuICAgICAgICByZXR1cm4gZXZlbnROYW1lLmluZGV4T2YoXCJZT1VLSUNLXCIpPi0xO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlbnRlclJvb20oZXZlbnROYW1lOnN0cmluZyxnYW1lVHlwZTpzdHJpbmcscm9vbUlkOm51bWJlcil7XHJcbiAgICAgICAgLy8weDExMDQxMTA0LCBcInF1ZXJ5XCIsIFwiZGR6X2ZyZWVcIlxyXG4gICAgICAgIHZhciBieXRlOkxheWEuQnl0ZSA9IG5ldyBMYXlhLkJ5dGUoKTtcclxuICAgICAgICBieXRlLndyaXRlSW50MzIoMFgxMTA0MTEwNCk7XHJcbiAgICAgICAgYnl0ZS53cml0ZVVURlN0cmluZyhldmVudE5hbWUpO1xyXG4gICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcoZ2FtZVR5cGUpO1xyXG4gICAgICAgIGJ5dGUud3JpdGVJbnQzMihyb29tSWQpO1xyXG4gICAgICAgIHRoaXMuc2VuZFNvY2tldE1zZyhieXRlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBldmVudCBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZ2FtZVR5cGUgZ2FtZSB0eXBlIDpkZHpfZnJlZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZW50ZXJHYW1lKGV2ZW50TmFtZTpzdHJpbmcsZ2FtZVR5cGU6c3RyaW5nKXtcclxuICAgICAgICAvLzB4MTEwNDExMDQsIFwicXVlcnlcIiwgXCJkZHpfZnJlZVwiXHJcbiAgICAgICAgdmFyIGJ5dGU6TGF5YS5CeXRlID0gbmV3IExheWEuQnl0ZSgpO1xyXG4gICAgICAgIGJ5dGUud3JpdGVJbnQzMigwWDExMDQxMTA0KTtcclxuICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKGV2ZW50TmFtZSk7XHJcbiAgICAgICAgYnl0ZS53cml0ZVVURlN0cmluZyhnYW1lVHlwZSk7XHJcbiAgICAgICAgdGhpcy5zZW5kU29ja2V0TXNnKGJ5dGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VuZCBtZXNzYWdlXHJcbiAgICAgKiBAcGFyYW0gcm9vbUlkIHJvb21pZFxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBldmVudCBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBkYXRhXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZW5kTXNnKHJvb21JZDpudW1iZXIsZXZlbnROYW1lOnN0cmluZyxkYXRhOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICB2YXIgYnl0ZTpMYXlhLkJ5dGUgPSBuZXcgTGF5YS5CeXRlKCk7XHJcbiAgICAgICAgYnl0ZS53cml0ZUludDMyKHJvb21JZCk7IFxyXG4gICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcoZXZlbnROYW1lKTtcclxuICAgICAgICBieXRlLndyaXRlQXJyYXlCdWZmZXIoZGF0YSwwKTtcclxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKGJ5dGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbG9naW4gdG8gZ2NcclxuICAgICAqIEBwYXJhbSBhY2MgYWNjb3VudFxyXG4gICAgICogQHBhcmFtIHB3ZCBwd2RcclxuICAgICAqIEBwYXJhbSBzaXRlIGRlZmF1bHQgMFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9naW5Ub0dDKGFjYzpzdHJpbmcscHdkOnN0cmluZyxzaXRlOm51bWJlcj0wKTp2b2lke1xyXG4gICAgICAgIGlmICh0eXBlb2YgYWNjICE9PSBcInN0cmluZ1wiKSB7IGFjYyA9IFwiXCI7IH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwd2QgIT09IFwic3RyaW5nXCIpIHsgcHdkID0gXCJcIjsgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNpdGUgIT09IFwibnVtYmVyXCIpIHsgc2l0ZSA9IDA7IH1cclxuXHJcbiAgICAgICAgICAgIGlmICgwID49IGFjYy5sZW5ndGgpIHsgYWNjID0gXCIxMTlcIjsgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGJ5dGU6TGF5YS5CeXRlID0gbmV3IExheWEuQnl0ZSgpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlSW50MzIoMSk7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcoXCJSUUxHXCIpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKGFjYyk7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcocHdkKTtcclxuICAgICAgICAgICAgYnl0ZS53cml0ZUludDMyKHNpdGUpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKFwiXCIpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKFwiXCIpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKFwiXCIpO1xyXG4gICAgICAgICAgICAvL3RoaXMubVdlYnNvY2tldC5zZW5kTXNnKGJ5dGUpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmRTb2NrZXRNc2coYnl0ZSk7XHJcbiAgICB9IFxyXG5cclxuICAgIC8qKnNlbmQgbWVzc2FnZSB0byBzZXJ2ZXIgKi9cclxuICAgIHByaXZhdGUgc2VuZFNvY2tldE1zZyhieXRlOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICBpZih0aGlzLm1XZWJzb2NrZXQgJiYgdGhpcy5tV2Vic29ja2V0LmNvbm5lY3RlZCl7XHJcbiAgICAgICAgICAgIHRoaXMubVdlYnNvY2tldC5zZW5kTXNnKGJ5dGUpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLm1PblNlbmRNc2dGYWlsZWQmJnRoaXMubU9uU2VuZE1zZ0ZhaWxlZC5ydW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7XHJcblxyXG5cclxuLyoqXHJcbiAqIGJyaWVmOkJhc2UgU29ja2V0IG1vZHVsZVxyXG4gKiBBdXRob3I6IHdlbnp1b2xpXHJcbiAqIERhdGU6IDIwMTkvMDQvMDJcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlYlNvY2tldCBleHRlbmRzIExheWEuU29ja2V0IHtcclxuICAgIC8vbWVzc2FnZSBkaXN0cmlidXRpb25cclxuICAgIHByaXZhdGUgX29uRXZlbnQ6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICAvKipvbiBzZXJ2ZXIgY29ubmVjdGluZy4gKi9cclxuICAgIHByaXZhdGUgX29uQ29ubmVjdGluZzpMYXlhLkhhbmRsZXI9bnVsbDtcclxuICAgIC8qKm9uIHNlcnZlciBjb25uZWN0IHN1Y2Nlc3NmdWxseS4gKi9cclxuICAgIHByaXZhdGUgX29uQ29ubmVjdGVkOkxheWEuSGFuZGxlcj1udWxsO1xyXG4gICAgLyoqb24gY29ubmVjdCB0byBzZXJ2ZXIgZmFpbGVkLiAqL1xyXG4gICAgcHJpdmF0ZSBfb25Db25uZWN0RmFpbGVkOkxheWEuSGFuZGxlcj1udWxsO1xyXG4gICAgLy9vbiBzZXJ2ZXIgZGlzY29ubmVjdFxyXG4gICAgcHJpdmF0ZSBfb25EaXNDb25uZWN0ZWQ6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICAvL2lmIGF1dG8gcmVjb25uZWN0XHJcbiAgICBwcml2YXRlIF9hdXRvUmVjb25uZWN0OmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgLy8gY29ubmVjdGlvbiBhZGRyZXNzICAgICAgICAgICAgXHJcbiAgICBwdWJsaWMgbUFkZHJlc3M6c3RyaW5nID0gXCIxMjcuMC4wLjFcIjsgICAgXHJcbiAgICAvLyBjb25uZWN0IHBvcnQuICAgICAgICAgICAgXHJcbiAgICBwdWJsaWMgbVBvcnQ6bnVtYmVyID0gNDQzOyAgICAgXHJcbiAgICAvL3JldHJ5IGVhY2ggMiBzZWNvbmRzLlxyXG4gICAgcHJpdmF0ZSBtUmVjb25uZWN0VGltZW91dDpudW1iZXI9MTAwMCoyOyBcclxuICAgIC8vbWF4IHJldHJ5IHRpbWUgd2hlbiBjb25uZWN0IGZhaWxlZC4gLTEgbm90IGxpbWl0LlxyXG4gICAgcHJpdmF0ZSBfUmVjb25uZWN0VGltZTpudW1iZXI9MzsgICAgICAgXHJcbiAgICAvKipkaXNjb25uZWN0IHR5IGdhbWUgc2VydmVyKi9cclxuICAgIHByaXZhdGUgbVNlcnZlcktpY2tlZDpib29sZWFuID0gZmFsc2U7IFxyXG4gICAgLyoqZGlzY29ubmVjdCB0aW1lICovXHJcbiAgICBwcml2YXRlIG1LaWNrZWRUaW1lOkRhdGU7XHJcbiAgICAvKipjdXJyZW50IGlzIHJlY29ubmVjdO+8mm5vdCBmaXJzdCB0aW1lIHRvIGNvbm5lY3QgdG8gZ2FtZSBzZXJ2ZXIgKi9cclxuICAgIHByaXZhdGUgbUlzUmVjb25uZWN0OmJvb2xlYW49ZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3ZWIgc29ja2V0IGVudHJ5LlxyXG4gICAgICogQHBhcmFtIG9uQ29ubmVjdGluZyBzdGFydCByZWNvbm5lY3RpbmcgY2FsbGJhY2tcclxuICAgICAqIEBwYXJhbSBvbkNvbm5lY3RlZCBvbiBjb25uZWN0ZWQgc3VjY2Vzc2Z1bGx5LlxyXG4gICAgICogQHBhcmFtIG9uRGlzY29ubmVjdGVkIG9uIGdhbWUgc2VydmVyIGRpc2Nvbm5lY3QuXHJcbiAgICAgKiBAcGFyYW0gb25SZWNNc2cgb24gcmVjZWl2ZWQgbmV3IG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9uQ29ubmVjdGluZzpMYXlhLkhhbmRsZXIsb25Db25uZWN0ZWQ6TGF5YS5IYW5kbGVyLG9uQ29ubmVjdEZhaWxlZDpMYXlhLkhhbmRsZXIsb25EaXNjb25uZWN0ZWQ6TGF5YS5IYW5kbGVyLG9uUmVjTXNnOkxheWEuSGFuZGxlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5lbmRpYW4gPSBMYXlhLkJ5dGUuTElUVExFX0VORElBTjsgXHJcblxyXG4gICAgICAgIHRoaXMub24oTGF5YS5FdmVudC5PUEVOLCB0aGlzLCB0aGlzLm9uT3BlbkhhbmRsZXIpO1xyXG4gICAgICAgIHRoaXMub24oTGF5YS5FdmVudC5DTE9TRSwgdGhpcywgdGhpcy5vbkNsb3NlSGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5vbihMYXlhLkV2ZW50Lk1FU1NBR0UsIHRoaXMsIHRoaXMub25SZWN2SGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5vbihMYXlhLkV2ZW50LkVSUk9SLCB0aGlzLCB0aGlzLm9uRXJyb3JIYW5kbGVyKTsgXHJcblxyXG4gICAgICAgIHRoaXMuX29uQ29ubmVjdGluZyA9IG9uQ29ubmVjdGluZztcclxuICAgICAgICB0aGlzLl9vbkNvbm5lY3RlZCA9IG9uQ29ubmVjdGVkO1xyXG4gICAgICAgIHRoaXMuX29uQ29ubmVjdEZhaWxlZCA9IG9uQ29ubmVjdEZhaWxlZDtcclxuICAgICAgICB0aGlzLl9vbkRpc0Nvbm5lY3RlZCA9IG9uRGlzY29ubmVjdGVkO1xyXG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBvblJlY01zZztcclxuICAgIH1cclxuIFxyXG4gICAgLyoqc2V0IGF1dG8gcmVjb25uZWN0IHN0YXR1cy4gKi9cclxuICAgIHB1YmxpYyBzZXQgQXV0b1JlY29ubmVjdChhdXRvUmVjb25uZWN0OmJvb2xlYW4pe1xyXG4gICAgICAgIHRoaXMuX2F1dG9SZWNvbm5lY3QgPSBhdXRvUmVjb25uZWN0O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvbm5lY3QgdG8gc2VydmVyXHJcbiAgICAgKiBAcGFyYW0gaXAgY29ubmVjdCBhZGRyZXNzOiBzdXBwb3J0IGlwL1xyXG4gICAgICogQHBhcmFtIHBvcnQgcG9ydFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY29ubmVjdChhZGRyZXNzOnN0cmluZywgcG9ydDpudW1iZXIpOnZvaWQge1xyXG4gICAgICAgIHRoaXMubUFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgICAgIHRoaXMubVBvcnQgPSBwb3J0O1xyXG4gICAgICAgIGlmKGFkZHJlc3MuaW5kZXhPZihcIndzczovL1wiKT4tMXx8YWRkcmVzcy5pbmRleE9mKFwid3M6Ly9cIik+LTEpe1xyXG4gICAgICAgICAgICBsZXQgdXJsOnN0cmluZyA9IGFkZHJlc3MgKyBcIjpcIiArIHBvcnQ7XHJcbiAgICAgICAgICAgIHN1cGVyLmNvbm5lY3RCeVVybCh1cmwpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBzdXBlci5jb25uZWN0KHRoaXMubUFkZHJlc3MsdGhpcy5tUG9ydCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VuZCBidWZmZXJcclxuICAgICAqIEBwYXJhbSBieXRlIGJ5dGUgYnVmZmVyXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZW5kTXNnKGJ5dGU6TGF5YS5CeXRlKTp2b2lkIHtcclxuICAgICAgICBieXRlLmVuZGlhbiA9IExheWEuQnl0ZS5MSVRUTEVfRU5ESUFOO1xyXG4gICAgICAgIHRoaXMuc2VuZChieXRlLmJ1ZmZlcik7XHJcbiAgICAgICAgYnl0ZS5jbGVhcigpO1xyXG4gICAgfSBcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmjqXmlLbmlbDmja5cclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIOe9kee7nOaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIG9uUmVjdkhhbmRsZXIobWVzc2FnZTphbnkpOnZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2UgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcclxuICAgICAgICAgICAgICAgIGxldCBlcnI6c3RyaW5nID1cIlNvY2tldCBlcnJvcjogTWVzc2FnZSB0eXBlIGlzIG5vdCBhIHN0YW5kYXJkIGFycmF5YnVmZmVyXCI7XHJcbiAgICAgICAgICAgICAgICBkemFwcC5Mb2dnZXIuZXJyb3IoZXJyKTsgXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodGhpcy5fb25FdmVudCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50LnJ1bldpdGgobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBkemFwcC5Mb2dnZXIuZXJyb3IoXCJTb2NrZXQgZXJyb3I6IHJlYWQgYnVmZmVyIGV4Y2VwdGlvbi5cIiwgZXJyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb25uZWN0IHN1Y2Nlc3NmdWxseS5cclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHJlY2VpdmVkIG1lc3NhZ2UgZGF0YS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBvbk9wZW5IYW5kbGVyKG1lc3NhZ2U6YW55KTp2b2lkIHtcclxuICAgICAgICAvL2NsZWFyIHRoZSByZWNvbm5lY3QgdGltZXJcclxuICAgICAgICBMYXlhLnRpbWVyLmNsZWFyKHRoaXMsdGhpcy5yZWNvbm5lY3QpO1xyXG4gICAgICAgIC8vcmVzZXQgdGhlIHJldHJ5IHRpbWVcclxuICAgICAgICB0aGlzLl9SZWNvbm5lY3RUaW1lID0gMzsgXHJcbiAgICAgICAgLy9wcmludCBjb25uZWN0ZWQgbG9nLlxyXG4gICAgICAgIHRoaXMucHJpbnRMb2coXCIpOkNvbm5lY3Rpb24gc2VydmVyIHN1Y2Nlc3NmdWxcIik7IFxyXG5cclxuICAgICAgICAvL2Nvbm5lY3RlZCBjYWxsYmFjay5cclxuICAgICAgICBpZih0aGlzLm1Jc1JlY29ubmVjdCYmdGhpcy5fb25Db25uZWN0ZWQpe1xyXG4gICAgICAgICAgICB0aGlzLm1Jc1JlY29ubmVjdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9vbkNvbm5lY3RlZC5ydW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb25uZWN0aW9uIHdhcyBpbnRlcnJ1cHRlZCBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBvbkNsb3NlSGFuZGxlcigpOnZvaWQge1xyXG4gICAgICAgIGlmKHRoaXMuX2F1dG9SZWNvbm5lY3Qpe1xyXG4gICAgICAgICAgICBpZih0aGlzLl9SZWNvbm5lY3RUaW1lPjB8fHRoaXMuX1JlY29ubmVjdFRpbWU9PS0xKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubUlzUmVjb25uZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubVJlY29ubmVjdFRpbWVvdXQ9dGhpcy5yZXNldFJlY29uZWN0VGltZSgpO1xyXG4gICAgICAgICAgICAgICAgLy9kZWxheSByZXRyeS5cclxuICAgICAgICAgICAgICAgIExheWEudGltZXIub25jZSh0aGlzLm1SZWNvbm5lY3RUaW1lb3V0LHRoaXMsdGhpcy5yZWNvbm5lY3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVjb25uZWN0IHRpbWVvdXQgcmVzZXQgbG9naW4gaGVyZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZXNldFJlY29uZWN0VGltZSgpOm51bWJlcntcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubVJlY29ubmVjdFRpbWVvdXQqMTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGN1cnJlbnQgaXMga2ljayB0aW1lXHJcbiAgICAgKiBAcGFyYW0gZGF0ZTEgXHJcbiAgICAgKiBAcGFyYW0gZGF0ZTIgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaXNLaWNrVGltZShkYXRlMTpEYXRlLGRhdGUyOkRhdGUpOmJvb2xlYW57XHJcbiAgICAgICAgbGV0IG4xOm51bWJlciA9IGRhdGUxLmdldFRpbWUoKTtcclxuICAgICAgICBsZXQgbjI6bnVtYmVyID0gZGF0ZTIuZ2V0VGltZSgpO1xyXG4gICAgICAgIHJldHVybiAoKG4yLW4xKS8xMDAwLzYwKTw1O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY29ubmVjdCBmYWlsZWQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgb25FcnJvckhhbmRsZXIoKTp2b2lkIHtcclxuICAgICAgICBpZih0aGlzLl9vbkNvbm5lY3RGYWlsZWQpe1xyXG4gICAgICAgICAgICB0aGlzLl9vbkNvbm5lY3RGYWlsZWQucnVuKCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIC8vcHJpbnQgZmFpbGVkIGxvZ1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TG9nKFwiQ29ubmVjdGlvbiBzZXJ2ZXIgZmFpbGVkXCIpOyBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWNvbm5lY3QgdG8gZ2FtZSBzZXJ2ZXIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZWNvbm5lY3QoKTp2b2lkeyBcclxuICAgICAgICBpZih0aGlzLmNvbm5lY3RlZCl7XHJcbiAgICAgICAgICAgIHRoaXMucHJpbnRMb2coXCJEaXNjb3ZlcmluZyB0aGF0IHRoZSBzb2NrZXQgaXMgY29ubmVjdGVkIHdoZW4gdHJ5aW5nIHRvIHJlY29ubmVjdC4gc3lzdGVtIHdpbGwgY2xvc2UgaXQgZmlyc3QuXCIpO1xyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJpbnRMb2coXCJBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBjbG9zaW5nIHRoZSBjb25uZWN0aW9uLlwiKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuX1JlY29ubmVjdFRpbWU+MCl7XHJcbiAgICAgICAgICAgIHRoaXMuX1JlY29ubmVjdFRpbWUtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcmludExvZyhcInRyeSB0byByZWNvbm5lY3QuLi5cIik7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMubUFkZHJlc3MsdGhpcy5tUG9ydCk7IFxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgcHVibGljIHNlcnZlcktpY2tPZmYoKTp2b2lke1xyXG4gICAgICAgIHRoaXMubVNlcnZlcktpY2tlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tS2lja2VkVGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwcmludCBsb2dcclxuICAgICAqIEBwYXJhbSBtc2cgbWVzc2FnZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHByaW50TG9nKG1zZzpzdHJpbmcpOnZvaWR7XHJcbiAgICAgICAgICAgIC8vc2hvdWQgYmUgY2FsbCBldmVudGxvZyBtb2R1bGUgdG8gaGFuZGxlciB0aGlzIGV2ZW50LiBcclxuICAgICAgICBkemFwcC5Mb2dnZXIuaW5mbyhtc2cpO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIEBicmllZiA6IHJlc291cmNlIG1hbmFnZXIgbW9kdWxlLlxyXG4gKiBAQXV0aG9yOiBXZW56dW9saVxyXG4gKiBARGF0ZTogMjAxOS8wNC8wOVxyXG4gKi8gXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc291cmNlTWdyIGV4dGVuZHMgTGF5YS5Mb2FkZXJNYW5hZ2Vye1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ3JvdXBSZXM6TGF5YS5XZWFrT2JqZWN0PW51bGw7XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296LWE5rqQIOWFgeiuuO+8mlJlc291cmNlTWdyLmxvYWQoLi4uKS5sb2FkKC4uLikuLi4g6L+e5o6l6LCD55SoXHJcbiAgICAgKiBAcGFyYW0gdXJsIHNpbmdsZSByZXNvdXJjZSB1cmwgb3IgdXJsIGFycmF544CCZS5nLu+8mltcImEucG5nXCIsXCJiLnBuZ1wiXe+8m1xyXG4gICAgICogQHBhcmFtIGNvbXBsZXRlXHTliqDovb3nu5PmnZ/lm57osIPjgILmoLnmja51cmznsbvlnovkuI3lkIzliIbkuLoy56eN5oOF5Ya177yaMS4gdXJs5Li6U3RyaW5n57G75Z6L77yM5Lmf5bCx5piv5Y2V5Liq6LWE5rqQ5Zyw5Z2A77yM5aaC5p6c5Yqg6L295oiQ5Yqf77yM5YiZ5Zue6LCD5Y+C5pWw5YC85Li65Yqg6L295a6M5oiQ55qE6LWE5rqQ77yM5ZCm5YiZ5Li6bnVsbO+8mzIuIHVybOS4uuaVsOe7hOexu+Wei++8jOaMh+WumuS6huS4gOe7hOimgeWKoOi9veeahOi1hOa6kO+8jOWmguaenOWFqOmDqOWKoOi9veaIkOWKn++8jOWImeWbnuiwg+WPguaVsOWAvOS4unRydWXvvIzlkKbliJnkuLpmYWxzZeOAglxyXG4gICAgICogQHBhcmFtIHByb2dyZXNzXHTliqDovb3ov5vluqblm57osIPjgILlm57osIPlj4LmlbDlgLzkuLrlvZPliY3otYTmupDnmoTliqDovb3ov5vluqbkv6Hmga8oMC0xKeOAglxyXG4gICAgICogQHBhcmFtIHR5cGVcdFx06LWE5rqQ57G75Z6L44CC5q+U5aaC77yaTG9hZGVyLklNQUdF44CCXHJcbiAgICAgKiBAcGFyYW0gcHJpb3JpdHlcdChkZWZhdWx0ID0gMSnliqDovb3nmoTkvJjlhYjnuqfvvIzkvJjlhYjnuqfpq5jnmoTkvJjlhYjliqDovb3jgILmnIkwLTTlhbE15Liq5LyY5YWI57qn77yMMOacgOmrmO+8jDTmnIDkvY7jgIJcclxuICAgICAqIEBwYXJhbSBjYWNoZVx0XHTmmK/lkKbnvJPlrZjliqDovb3nu5PmnpzjgIJcclxuICAgICAqIEBwYXJhbSBncm91cFx0XHTliIbnu4TvvIzmlrnkvr/lr7notYTmupDov5vooYznrqHnkIbjgIJcclxuICAgICAqIEBwYXJhbSBpZ25vcmVDYWNoZVx05piv5ZCm5b+955Wl57yT5a2Y77yM5by65Yi26YeN5paw5Yqg6L2944CCXHJcbiAgICAgKiBAcGFyYW0gdXNlV29ya2VyTG9hZGVyKGRlZmF1bHQgPSBmYWxzZSnmmK/lkKbkvb/nlKh3b3JrZXLliqDovb3vvIjlj6rpkojlr7lJTUFHReexu+Wei+WSjEFUTEFT57G75Z6L77yM5bm25LiU5rWP6KeI5Zmo5pSv5oyB55qE5oOF5Ya15LiL55Sf5pWI77yJXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbG9hZFJlcyh1cmw6YW55LGNvbXBsZXRlZD86TGF5YS5IYW5kbGVyLHByb2dyZXNzPzpMYXlhLkhhbmRsZXIsdHlwZT86c3RyaW5nLHByaW9yaXR5PzpudW1iZXIsY2FjaGU/OmJvb2xlYW4sZ3JvdXA/OnN0cmluZyxpZ25vcmVDYWNoZT86Ym9vbGVhbix1c2VXb3JrZXJMb2FkZXI/OmJvb2xlYW4pOkxheWEuTG9hZGVyTWFuYWdlcntcclxuICAgICAgIC8vVE9ETzp3ZW56dW9saSBmb3IgbGF5YSBsaWJyYXJ5IGNhbid0IGNsZWFyIHRoZSByZXMgYnkgZ3JvdXAsIHNvIHRha2UgYSB0ZW1wIHNvbHV0aW9uIHRvIG1hbmFnZW1lbnQgdGhlIHJlc291cmNlLlxyXG4gICAgICAgIGlmKHRoaXMuZ3JvdXBSZXMgPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBSZXMgPSBuZXcgTGF5YS5XZWFrT2JqZWN0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZ3JvdXAmJmdyb3VwLmxlbmd0aD4wKXtcclxuICAgICAgICAgICAgdGhpcy5ncm91cFJlcy5zZXQoZ3JvdXAsdXJsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIExheWEubG9hZGVyLmxvYWQodXJsLGNvbXBsZXRlZCxwcm9ncmVzcyx0eXBlLHByaW9yaXR5LGNhY2hlLGdyb3VwLGlnbm9yZUNhY2hlLHVzZVdvcmtlckxvYWRlcik7XHJcbiAgICAgfSBcclxuXHJcbiAgICAgLyoqXHJcbiAgICAgICAqIOa4heeQhuaMh+Wumui1hOa6kOWcsOWdgOe8k+WtmOOAglxyXG4gICAgICAgKiBAcGFyYW1cdHVybCDotYTmupDlnLDlnYDjgIJcclxuICAgICAgKi9cclxuICAgICBwdWJsaWMgc3RhdGljIGNsZWFyUmVzKHVybDpzdHJpbmcpOnZvaWR7XHJcbiAgICAgICAgTGF5YS5sb2FkZXIuY2xlYXJSZXModXJsKTtcclxuICAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGVhciByZXNvdXJjZSBieSBncm91cCBuYW1l44CCXHJcbiAgICAgKiBAcGFyYW0gZ3JvdXAg5YiG57uE5ZCNXHJcbiAgICAgKi9cclxuICAgICBwdWJsaWMgc3RhdGljIGNsZWFyUmVzQnlHcm91cChncm91cE5hbWU6c3RyaW5nKTp2b2lke1xyXG4gICAgICAgIExheWEubG9hZGVyLmNsZWFyUmVzQnlHcm91cChncm91cE5hbWUpO1xyXG4gICAgICAgIC8vVE9ETzp3ZW56dW9saSAuIGJlY2F1c2UgdGhlIGxheWEgbGlicmFyeSBjbGVhciBieSBnb3J1cCBoYXMgc29tZSBxdWVzdGlvbi5lLmcuIGNhbid0IGNsZWFyLiB3aWxsIGNoZWNrIGxhdGVyLlxyXG4gICAgICAgIGxldCByZXNMaXN0OmFueSA9IHRoaXMuZ3JvdXBSZXMuZ2V0KGdyb3VwTmFtZSk7XHJcbiAgICAgICAgaWYocmVzTGlzdCl7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8cmVzTGlzdC5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgICAgIGlmKHJlc0xpc3RbaV0gaW5zdGFuY2VvZiBTdHJpbmcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJSZXMocmVzTGlzdFtpXSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICByZXNMaXN0W2ldLnVybCYmdGhpcy5jbGVhclJlcyhyZXNMaXN0W2ldLnVybCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICog6ZSA5q+BVGV4dHVyZeS9v+eUqOeahOWbvueJh+i1hOa6kO+8jOS/neeVmXRleHR1cmXlo7PvvIzlpoLmnpzkuIvmrKHmuLLmn5PnmoTml7blgJnvvIzlj5HnjrB0ZXh0dXJl5L2/55So55qE5Zu+54mH6LWE5rqQ5LiN5a2Y5Zyo77yM5YiZ5Lya6Ieq5Yqo5oGi5aSNXHJcbiAgICAgKiDnm7jmr5RjbGVhclJlc++8jGNsZWFyVGV4dHVyZVJlc+WPquaYr+a4heeQhnRleHR1cmXph4zpnaLkvb/nlKjnmoTlm77niYfotYTmupDvvIzlubbkuI3plIDmr4F0ZXh0dXJl77yM5YaN5qyh5L2/55So5Yiw55qE5pe25YCZ5Lya6Ieq5Yqo5oGi5aSN5Zu+54mH6LWE5rqQXHJcbiAgICAgKiDogIxjbGVhclJlc+S8muW9u+W6lemUgOavgXRleHR1cmXvvIzlr7zoh7TkuI3og73lho3kvb/nlKjvvJtjbGVhclRleHR1cmVSZXPog73noa7kv53nq4vljbPplIDmr4Hlm77niYfotYTmupDvvIzlubbkuJTkuI3nlKjmi4Xlv4PplIDmr4HplJnor6/vvIxjbGVhclJlc+WImemHh+eUqOW8leeUqOiuoeaVsOaWueW8j+mUgOavgVxyXG4gICAgICog44CQ5rOo5oSP44CR5aaC5p6c5Zu+54mH5pys6Lqr5Zyo6Ieq5Yqo5ZCI6ZuG6YeM6Z2i77yI6buY6K6k5Zu+54mH5bCP5LqONTEyKjUxMu+8ie+8jOWGheWtmOaYr+S4jeiDveiiq+mUgOavgeeahO+8jOatpOWbvueJh+iiq+Wkp+WbvuWQiOmbhueuoeeQhuWZqOeuoeeQhlxyXG4gICAgICogQHBhcmFtXHR1cmxcdOWbvumbhuWcsOWdgOaIluiAhXRleHR1cmXlnLDlnYDvvIzmr5TlpoIgTG9hZGVyLmNsZWFyVGV4dHVyZVJlcyhcInJlcy9hdGxhcy9jb21wLmF0bGFzXCIpOyBMb2FkZXIuY2xlYXJUZXh0dXJlUmVzKFwiaGFsbC9iZy5qcGdcIik7XHJcbiAgICAgKi9cclxuICAgICBwdWJsaWMgc3RhdGljIGNsZWFyVGV4dHVyZVJlcyh1cmw6c3RyaW5nKTp2b2lke1xyXG4gICAgICAgIExheWEubG9hZGVyLmNsZWFyVGV4dHVyZVJlcyh1cmwpO1xyXG4gICAgIH1cclxuXHJcbiAgICAgLyoqXHJcbiAgICAgKiDojrflj5bmjIflrprotYTmupDlnLDlnYDnmoTotYTmupDjgIJcclxuICAgICAqIEBwYXJhbVx0dXJsIOi1hOa6kOWcsOWdgOOAglxyXG4gICAgICogQHJldHVyblx06L+U5Zue6LWE5rqQ44CCXHJcbiAgICAgKi9cclxuICAgICBwdWJsaWMgc3RhdGljIGdldFJlcyh1cmw6c3RyaW5nKTphbnl7XHJcbiAgICAgICAgIHJldHVybiBMYXlhLmxvYWRlci5nZXRSZXModXJsKTtcclxuICAgICB9XHJcbiAgICAgXHJcbn0iLCIvKiogXHJcbiAqIEhpc3Rvcnk6IDEuIGFkZCBtaW5pLXByb2dyYW0gc3VwcG9ydC4gMjAxOC8xMi8xMSBXZW5adW9saVxyXG4qL1xyXG4gICAgaW1wb3J0IEF1ZGlvRW5naW5lID0gTGF5YS5Tb3VuZE1hbmFnZXI7XHJcbiAgICAvKipcclxuICAgICAqIOWjsOmfs+euoeeQhlxyXG4gICAgICogQEhpc3Rvcnk6IDEuIGFkZCBtaW5pLXByb2dyYW0gc3VwcG9ydC4gMjAxOC8xMi8xMSBXZW5adW9saVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgU291bmRNYW5hZ2VyIHtcclxuICAgICAgICAvKiog6Z+z5LmQ54q25oCBICovXHJcbiAgICAgICAgcHJpdmF0ZSBtTXVzaWNTdGF0ZTpib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICAvKiog6Z+z5pWI54q25oCBICovXHJcbiAgICAgICAgcHJpdmF0ZSBtRWZmZWN0U3RhdGU6Ym9vbGVhbiA9IHRydWU7ICBcclxuICAgICAgICAvKipzdG9yYWdlIGtleSBmb3IgdGhlIGJhY2tncm91bmQgbXVzaWMuICovXHJcbiAgICAgICAgcHJpdmF0ZSBTVE9SRUdFS0VZX0JBQ0tHUk9VTkRfTVVTSUM6c3RyaW5nPVwiYmFja2dyb3VuZF9tdXNpY19vbm9mZlwiO1xyXG4gICAgICAgIC8qKnN0b3JhZ2Uga2V5IGZvciB0aGUgc291bmQgZWZmZWN0LiAqL1xyXG4gICAgICAgIHByaXZhdGUgU1RPUkVHRUtFWV9TT1VORF9FRkZFQ1Q6c3RyaW5nPVwiU291bmRFZmZlY3Rfb25vZmZcIjtcclxuICAgICAgICAvKipzYXZlIGtleSBwcmVmaXggKi9cclxuICAgICAgICBwcml2YXRlIEtFWV9QUkVGSVg6c3RyaW5nPVwiXCI7XHJcbiAgICAgICAgLyoqIGNhY2hlIHNvdW5kIGZpbGVzIHBhdGggKi9cclxuICAgICAgICAvL3ByaXZhdGUgU291bmRTZXQ6TGF5YS5EaWN0aW9uYXJ5O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgLy90aGlzLmxvYWRMb2NhbENvbmZpZ3MoKTsgXHJcbiAgICAgICAgICAgIC8vIOi3n+maj+iuvuWkh+mdmemfs1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS51c2VBdWRpb011c2ljID0gZmFsc2U7IFxyXG4gICAgICAgICAgICAvL3RoaXMuU291bmRTZXQgPSBuZXcgTGF5YS5EaWN0aW9uYXJ5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDojrflj5bmnKzlnLDphY3nva5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgbG9hZExvY2FsQ29uZmlncyhhY2M6c3RyaW5nKTphbnkge1xyXG4gICAgICAgICAgICAvL2luaXQgYWNjb3VudCBvciBrZXlcclxuICAgICAgICAgICAgdGhpcy5LRVlfUFJFRklYID0gYWNjO1xyXG4gICAgICAgICAgICAvL+iDjOaZr+mfs+S5kOeKtuaAgVxyXG4gICAgICAgICAgICBsZXQgX21zdGF0dXM6YW55ID0gdGhpcy5nZXRTdG9yYWdlSXRlbSh0aGlzLlNUT1JFR0VLRVlfQkFDS0dST1VORF9NVVNJQyk7XHJcbiAgICAgICAgICAgIGxldCBfbXVzaWNTdGF0dXM6Ym9vbGVhbiA9IF9tc3RhdHVzPT1udWxsfHxfbXN0YXR1cz09dW5kZWZpbmVkfHxfbXN0YXR1cz09XCJ0cnVlXCJ8fF9tc3RhdHVzPT10cnVlfHxfbXN0YXR1cz09PVwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMubU11c2ljU3RhdGUgPSBfbXVzaWNTdGF0dXM7IFxyXG4gICAgICAgICAgICAvLyBsZXQgbXVzaWNTdGF0dXM6YW55ID0gTGF5YS5Mb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLlNUT1JFR0VLRVlfQkFDS0dST1VORF9NVVNJQyl8fFwidHJ1ZVwiOyBcclxuICAgICAgICAgICAgLy8gdGhpcy5tQmFja2dyb3VuZE11c2ljT24gPSBtdXNpY1N0YXR1cz09XCJ0cnVlXCI7XHJcbiAgICAgICAgICAgICBcclxuICAgICAgICAgICAgLy/og4zmma/pn7PmlYjnirbmgIFcclxuICAgICAgICAgICAgbGV0IF9zc3RhdHVzOmFueSA9IHRoaXMuZ2V0U3RvcmFnZUl0ZW0odGhpcy5TVE9SRUdFS0VZX1NPVU5EX0VGRkVDVCk7XHJcbiAgICAgICAgICAgIGxldCBfc291bmRzdGF0dXM6Ym9vbGVhbiA9IF9zc3RhdHVzPT1udWxsfHxfc3N0YXR1cz09dW5kZWZpbmVkfHxfc3N0YXR1cz09XCJ0cnVlXCJ8fF9zc3RhdHVzPT10cnVlfHxfc3N0YXR1cz09PVwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMubUVmZmVjdFN0YXRlID0gX3NvdW5kc3RhdHVzO1xyXG5cclxuICAgICAgICAgICAgLy8gbGV0IHNvdW5kU3RhdHVzOmFueSA9IExheWEuTG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5TVE9SRUdFS0VZX1NPVU5EX0VGRkVDVCl8fFwidHJ1ZVwiOyAgXHJcbiAgICAgICAgICAgIC8vIHRoaXMubVNvdW5kRWZmZWN0T24gPSBzb3VuZFN0YXR1cz09XCJ0cnVlXCI7XHJcbiAgICAgICAgICAgIC8v6Lef6ZqP6K6+5aSH6Z2Z6Z+zXHJcbiAgICAgICAgICAgIC8vTGF5YS5Tb3VuZE1hbmFnZXIudXNlQXVkaW9NdXNpYz1mYWxzZVxyXG4gICAgICAgIH0gXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHNhdmUgaXRlbSB0byBsb2NhbCBzdG9yYWdlXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1LZXkgaXRlbSBrZXlcclxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzYXZlU3RvcmFnZUl0ZW0oaXRlbUtleTpzdHJpbmcsdmFsdWU6YW55KXtcclxuICAgICAgICAgICAgLy8gaWYoYmVzdGFwcC51dGlscy5HYW1lVmVyaWZ5LmlzTWluUHJvZ3JhbU1vZGUoKSl7XHJcbiAgICAgICAgICAgIC8vICAgICB0cnl7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJ1cGRhdGUgc3RhdHVzOlwiK2l0ZW1LZXkrXCI6XCIrdmFsdWUrXCIsY3VycjpcIit0aGlzLm1NdXNpY1N0YXRlKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhpdGVtS2V5LHZhbHVlKTtcclxuICAgICAgICAgICAgLy8gICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgLy8gICAgICAgICBwcmludEVycm9yKFwiU2F2ZSBzb3VuZCBzZXR0aW5nIGludG8gc3RhcmFnZSBmYWlsZWQuIFwiKVxyXG4gICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAvLyB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIExheWEuTG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5LRVlfUFJFRklYLmNvbmNhdChpdGVtS2V5KSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAvL31cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldCBpdGVtIGJ5IGtleSBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuICAgICAgICAgKiBAcGFyYW0ga2V5IGl0ZW0ga2V5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBnZXRTdG9yYWdlSXRlbShpdGVtS2V5OnN0cmluZyk6YW55e1xyXG4gICAgICAgICAgICAvLyBpZihiZXN0YXBwLnV0aWxzLkdhbWVWZXJpZnkuaXNNaW5Qcm9ncmFtTW9kZSgpKXtcclxuICAgICAgICAgICAgLy8gICAgIHJldHVybiB3eC5nZXRTdG9yYWdlU3luYyhpdGVtS2V5KTtcclxuICAgICAgICAgICAgLy8gfWVsc2V7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTGF5YS5Mb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLktFWV9QUkVGSVguY29uY2F0KGl0ZW1LZXkpKTtcclxuICAgICAgICAgICAgLy99XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDojrflj5bpn7PkuZDmkq3mlL7nirbmgIFcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXVzaWNTdGF0ZSgpOmJvb2xlYW4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImN1cnJlbnQgc3RhdHVzOlwiK3RoaXMubU11c2ljU3RhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tTXVzaWNTdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOiuvue9rumfs+S5kOaSreaUvueKtuaAgVxyXG4gICAgICAgICAqIEBwYXJhbSBzdGF0ZSDmkq3mlL7nirbmgIFcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0TXVzaWNTdGF0ZShzdGF0ZTpib29sZWFuKTp2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5tTXVzaWNTdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2F2ZVN0b3JhZ2VJdGVtKHRoaXMuU1RPUkVHRUtFWV9CQUNLR1JPVU5EX01VU0lDLHN0YXRlKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDojrflj5bpn7PmlYjmkq3mlL7nirbmgIFcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0RWZmZWN0U3RhdGUoKTpib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubUVmZmVjdFN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6K6+572u6Z+z5pWI5pKt5pS+54q25oCBXHJcbiAgICAgICAgICogQHBhcmFtIHN0YXRlIOaSreaUvueKtuaAgVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRFZmZlY3RTdGF0ZShzdGF0ZTpib29sZWFuKTp2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5tRWZmZWN0U3RhdGUgPSBzdGF0ZTtcclxuICAgICAgICAgICAgLy90aGlzLnNhdmVTdG9yYWdlSXRlbSh0aGlzLlNUT1JFR0VLRVlfU09VTkRfRUZGRUNULHN0YXRlKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlgZzmraLmkq3mlL7miYDmnInlo7Dpn7PvvIjljIXmi6zog4zmma/pn7PkuZDlkozpn7PmlYjvvIlcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RvcEFsbCgpOnZvaWQge1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS5zdG9wQWxsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlgZzmraLlo7Dpn7Pmkq3mlL7jgILmraTmlrnms5Xog73lpJ/lgZzmraLku7vmhI/lo7Dpn7PnmoTmkq3mlL7vvIjljIXmi6zog4zmma/pn7PkuZDlkozpn7PmlYjvvInvvIzlj6rpnIDkvKDlhaXlr7nlupTnmoTlo7Dpn7Pmkq3mlL7lnLDlnYBcclxuICAgICAgICAgKiBAcGFyYW0gdXJsIOWjsOmfs+aWh+S7tuWcsOWdgFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdG9wU291bmQodXJsOnN0cmluZyk6dm9pZCB7XHJcbiAgICAgICAgICAgIEF1ZGlvRW5naW5lLnN0b3BTb3VuZCh1cmwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5YGc5q2i5pKt5pS+5omA5pyJ6Z+z5pWI77yI5LiN5YyF5ous6IOM5pmv6Z+z5LmQ77yJXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0b3BBbGxTb3VuZCgpOnZvaWQge1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS5zdG9wQWxsU291bmQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaSreaUvumfs+aViOOAgumfs+aViOWPr+S7peWQjOaXtuaSreaUvuWkmuS4qlxyXG4gICAgICAgICAqIEBwYXJhbSB1cmwg5aOw6Z+z5paH5Lu25Zyw5Z2AXHJcbiAgICAgICAgICogQHBhcmFtIGxvb3BzIOW+queOr+asoeaVsCww6KGo56S65peg6ZmQ5b6q546vXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBsZXRlIOWjsOmfs+aSreaUvuWujOaIkOWbnuiwgyAgSGFuZGxlcuWvueixoVxyXG4gICAgICAgICAqIEBwYXJhbSBzb3VuZENsYXNzIOS9v+eUqOWTquS4quWjsOmfs+exu+i/m+ihjOaSreaUvu+8jG51bGzooajnpLroh6rliqjpgInmi6lcclxuICAgICAgICAgKiBAcGFyYW0gc3RhcnRUaW1lIOWjsOmfs+aSreaUvui1t+Wni+aXtumXtFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBwbGF5U291bmQodXJsOnN0cmluZywgbG9vcHM/Om51bWJlciwgY29tcGxldGU/OkxheWEuSGFuZGxlciwgc291bmRDbGFzcz86YW55LCBzdGFydFRpbWU/Om51bWJlcik6dm9pZCB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubUVmZmVjdFN0YXRlKXtcclxuICAgICAgICAgICAgICAgIEF1ZGlvRW5naW5lLnBsYXlTb3VuZCh1cmwsIGxvb3BzLCBjb21wbGV0ZSwgc291bmRDbGFzcywgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgIC8v6L+Y5pyJ6Zeu6aKY77yM5pqC5pyq5byA5pS+XHJcbiAgICAgICAgICAgICAgICAvLyBpZihiZXN0YXBwLnV0aWxzLkdhbWVWZXJpZnkuaXNNaW5Qcm9ncmFtTW9kZSgpKXtcclxuICAgICAgICAgICAgICAgIC8vICAgICBpZih0aGlzLm1FZmZlY3RTdGF0ZSl7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGxldCBfdGVtVXJsID0gdGhpcy5Tb3VuZFNldC5nZXQodXJsKTsgXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGlmKF90ZW1VcmwhPW51bGwpe1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgQXVkaW9FbmdpbmUucGxheVNvdW5kKF90ZW1VcmwsIGxvb3BzLCBjb21wbGV0ZSwgc291bmRDbGFzcywgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB0aGlzLmRvd25sb2FkV2ViU291bmQodXJsKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIEF1ZGlvRW5naW5lLnBsYXlTb3VuZCh1cmwsIGxvb3BzLCBjb21wbGV0ZSwgc291bmRDbGFzcywgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5YGc5q2i5pKt5pS+6IOM5pmv6Z+z5LmQICjkuI3ljIXmi6zpn7PmlYgpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0b3BNdXNpYygpOnZvaWQge1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS5zdG9wTXVzaWMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaSreaUvuiDjOaZr+mfs+S5kFxyXG4gICAgICAgICAqIEBwYXJhbSB1cmwg5aOw6Z+z5paH5Lu25Zyw5Z2AXHJcbiAgICAgICAgICogQHBhcmFtIGxvb3BzIOW+queOr+asoeaVsCwgMOihqOekuuaXoOmZkOW+queOr1xyXG4gICAgICAgICAqIEBwYXJhbSBjb21wbGV0ZSDlo7Dpn7Pmkq3mlL7lrozmiJDlm57osINcclxuICAgICAgICAgKiBAcGFyYW0gc3RhcnRUaW1lIOWjsOmfs+aSreaUvui1t+Wni+aXtumXtFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBwbGF5TXVzaWModXJsOnN0cmluZywgbG9vcHM/Om51bWJlciwgY29tcGxldGU/OkxheWEuSGFuZGxlciwgc3RhcnRUaW1lPzpudW1iZXIpOnZvaWQge1xyXG4gICAgICAgICAgICBpZih0aGlzLm1NdXNpY1N0YXRlKXtcclxuICAgICAgICAgICAgICAgIEF1ZGlvRW5naW5lLnN0b3BNdXNpYygpOyBcclxuICAgICAgICAgICAgICAgIEF1ZGlvRW5naW5lLnBsYXlNdXNpYyh1cmwsIGxvb3BzLCBjb21wbGV0ZSwgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOmHiuaUvuWjsOmfs+i1hOa6kFxyXG4gICAgICAgICAqIEBwYXJhbSB1cmwg5aOw6Z+z5pKt5pS+5Zyw5Z2AXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGRlc3Ryb3lTb3VuZCh1cmw6c3RyaW5nKTp2b2lkIHtcclxuICAgICAgICAgICAgQXVkaW9FbmdpbmUuZGVzdHJveVNvdW5kKHVybCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDorr7nva7lo7Dpn7Ppn7Pph4/jgILmoLnmja7lj4LmlbDkuI3lkIzvvIzlj6/ku6XliIbliKvorr7nva7mjIflrprlo7Dpn7PvvIjog4zmma/pn7PkuZDmiJbpn7PmlYjvvInpn7Pph4/miJbogIXmiYDmnInpn7PmlYjvvIjkuI3ljIXmi6zog4zmma/pn7PkuZDvvInpn7Pph49cclxuICAgICAgICAgKiBAcGFyYW0gdm9sdW1lIOmfs+mHj+OAguWIneWni+WAvOS4ujHjgILpn7Pph4/ojIPlm7Tku44gMO+8iOmdmemfs++8ieiHsyAx77yI5pyA5aSn6Z+z6YeP77yJXHJcbiAgICAgICAgICogQHBhcmFtIHVybCAoZGVmYXVsdCA9IG51bGwp5aOw6Z+z5pKt5pS+5Zyw5Z2A44CC6buY6K6k5Li6bnVsbOOAguS4uuepuuihqOekuuiuvue9ruaJgOaciemfs+aViO+8iOS4jeWMheaLrOiDjOaZr+mfs+S5kO+8ieeahOmfs+mHj++8jOS4jeS4uuepuuihqOekuuiuvue9ruaMh+WumuWjsOmfs++8iOiDjOaZr+mfs+S5kOaIlumfs+aViO+8ieeahOmfs+mHj1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRTb3VuZFZvbHVtZSh2b2x1bWU6bnVtYmVyLCB1cmw/OnN0cmluZyk6dm9pZCB7XHJcbiAgICAgICAgICAgIEF1ZGlvRW5naW5lLnNldFNvdW5kVm9sdW1lKHZvbHVtZSwgdXJsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOiuvue9ruiDjOaZr+mfs+S5kOmfs+mHj+OAgumfs+mHj+iMg+WbtOS7jiAw77yI6Z2Z6Z+z77yJ6IezIDHvvIjmnIDlpKfpn7Pph4/vvIlcclxuICAgICAgICAgKiBAcGFyYW0gdm9sdW1lIOmfs+mHj+OAguWIneWni+WAvOS4ujHjgILpn7Pph4/ojIPlm7Tku44gMO+8iOmdmemfs++8ieiHsyAx77yI5pyA5aSn6Z+z6YeP77yJXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldE11c2ljVm9sdW1lKHZvbHVtZTpudW1iZXIpOnZvaWQge1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS5zZXRNdXNpY1ZvbHVtZSh2b2x1bWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZG93bmxvYWQgc291bmQgZmlsZSBhbmQgcGxheS5cclxuICAgICAgICAgKiBAcGFyYW0gdXJsIHJlc2x1cmNlIHBhdGgsbGlrZSB0aGlzOiBhdWRpby9hYWEubXAzXHJcbiAgICAgICAgICogQHBhcmFtIGxvb3BzIGxvb3BzXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBsZXRlIGNvbXBsZXRlIGNhbGxiYWNrXHJcbiAgICAgICAgICogQHBhcmFtIHNvdW5kQ2xhc3MgXHJcbiAgICAgICAgICogQHBhcmFtIHN0YXJ0VGltZSBzdGFydCB0aW1lIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgZG93bmxvYWRXZWJTb3VuZCh1cmw6c3RyaW5nLCBsb29wcz86bnVtYmVyLCBjb21wbGV0ZT86TGF5YS5IYW5kbGVyLCBzb3VuZENsYXNzPzphbnksIHN0YXJ0VGltZT86bnVtYmVyKTp2b2lke1xyXG4gICAgICAgICAgICBsZXQgX3RlbVVybDpzdHJpbmcgPSBMYXlhLlVSTC5mb3JtYXRVUkwodXJsKTtcclxuICAgICAgICAgICAgbGV0IF90aGlzOmFueSA9IHRoaXM7XHJcbiAgICAgICAgICAgIC8vIHd4LmRvd25sb2FkRmlsZSh7XHJcbiAgICAgICAgICAgIC8vICAgICB1cmw6X3RlbVVybCxcclxuICAgICAgICAgICAgLy8gICAgIHN1Y2Nlc3M6ZnVuY3Rpb24ocmVzKXtcclxuICAgICAgICAgICAgLy8gICAgICAgICBkemFwcC5tTG9nZ2VyLmRlYnVnKFwiZG93bmxvYWQgb3BlcmF0b24gc3VjY2VzczpcIitKU09OLnN0cmluZ2lmeShyZXMpKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICBpZihyZXMuc3RhdHVzQ29kZT09MjAwKXtcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgX3RoaXMuU291bmRTZXQuc2V0KHVybCxyZXMudGVtcEZpbGVQYXRoKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgQXVkaW9FbmdpbmUucGxheVNvdW5kKHJlcy50ZW1wRmlsZVBhdGgsIGxvb3BzLCBjb21wbGV0ZSwgc291bmRDbGFzcywgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vICAgICB9LGZhaWw6e1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIC8vZHphcHAubUxvZ2dlci5lcnJvcihcImRvd25sb2FkIGZhaWxlZDpcIitKU09OLnN0cmluZ2lmeShyZXMpKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICBBdWRpb0VuZ2luZS5wbGF5U291bmQodXJsLCBsb29wcywgY29tcGxldGUsIHNvdW5kQ2xhc3MsIHN0YXJ0VGltZSk7XHJcbiAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0iLCJpbXBvcnQgQmFzZVNjZW5lIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL2R6cGFnZS9CYXNlU2NlbmVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVJdGVte1xyXG4gICAgY29uc3RydWN0b3Ioa2V5OnN0cmluZyxyZXM6QXJyYXk8YW55PixzY2VuZTpCYXNlU2NlbmUpe1xyXG4gICAgICAgIHRoaXMubUdhbWVLZXkgPSBrZXk7XHJcbiAgICAgICAgdGhpcy5tR2FtZVJlcyA9IHJlcztcclxuICAgICAgICB0aGlzLm1HYW1lVmlldyA9IHNjZW5lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtR2FtZUtleTpzdHJpbmc7XHJcbiAgICBwdWJsaWMgbUdhbWVSZXM6QXJyYXk8YW55PjtcclxuICAgIHB1YmxpYyBtR2FtZVZpZXc6QmFzZVNjZW5lO1xyXG59IiwiaW1wb3J0IHsgZHphcHAgfSBmcm9tIFwiLi4vLi4vLi4vTWFpblwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9iYnlEYXRhe1xyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW4oKTtcclxuICAgICAgICB0aGlzLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbnQ6TG9iYnlEYXRhID0gbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBJbnN0YW50KCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBpbml0KCk6dm9pZHtcclxuICAgICAgICB0aGlzLl9pbnN0YW50ID0gdGhpcy5JbnN0YW50IHx8IG5ldyBMb2JieURhdGEoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudExpc3RlbigpOnZvaWR7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydCgpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuZW50ZXJMb2JieSgpO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxQbGF5ZXJ7XHJcbiBcclxuICAgIC8qKlxyXG4gICAgICog572R57uc5Yqg6L295q2l6aqk77yaMOacqui/m+ihjOWKoOi9ve+8mzHliqDovb3pooTliqDovb3otYTmupDlrozmr5XvvJsy77ya5Yqg6L295ri45oiP6LWE5rqQ5a6M5q+V77ybM++8mui/m+WFpea4uOaIj1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbUNsaWVudExvYWRTdGVwOm51bWJlcj0wO1xyXG5cclxuICAgIHB1YmxpYyBtTG9naW5QbGF0OnN0cmluZz1cIlwiO1xyXG4gICAgcHVibGljIG1BY2NvdW50OnN0cmluZz1cIlwiOyBcclxuICAgIHB1YmxpYyBtUGFzc3dvcmQ6c3RyaW5nPVwiXCI7XHJcbiAgICBwdWJsaWMgbVJlZ1NpdGU6c3RyaW5nPVwiXCI7XHJcblxyXG4gICAgcHVibGljIG1TaXRlTnVtOm51bWJlcj0wO1xyXG4gICAgLyoqIOeOqeWutklkICovXHJcbiAgICBwdWJsaWMgbVVzZXJJZDpudW1iZXIgPSAwO1xyXG4gICAgLyoqIOeOqeWutuaYteensCAqL1xyXG4gICAgcHVibGljIG1OaWNrTmFtZTpzdHJpbmcgPSBcIlwiO1xyXG4gICAgLyoqWVnluJDlj7cgKi9cclxuICAgIHB1YmxpYyBtWVlBY2NvdW50OnN0cmluZz1cIlwiO1xyXG4gICAgLyoqIOeOqeWutuWktOWDjyAqL1xyXG4gICAgcHVibGljIG1GYWNlOnN0cmluZyA9IFwiXCI7XHJcbiAgICAvKiog546p5a626YeR5biBL+mHkeixhiAqL1xyXG4gICAgcHVibGljIG1Hb2xkOm51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgbURaQ2FzaDpudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiDnpLzliLhcclxuICAgICAqL1xyXG4gICAgcHVibGljIG1MaVF1YW46bnVtYmVyID0gMDsgXHJcbiAgICBwdWJsaWMgbUJlYW46bnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBtSG9tZVBlYXM6bnVtYmVyID0gMDtcclxuICAgIC8qKiDnjqnlrrbmgKfliKsgKi9cclxuICAgIHB1YmxpYyBtU2V4Om51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgbUxhc3RSb29tTmFtZTpzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIG1MYXN0Um9vbUlkOm51bWJlciA9IDA7IFxyXG4gICAgcHVibGljIG1HYW1lS2V5OnN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgbVBvcnRLZXk6c3RyaW5nID0gXCJcIjtcclxuICAgIHB1YmxpYyBtTWQ1OnN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgbUlzTmV3VXNlcjpudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIG1CQlNVcmw6c3RyaW5nID0gXCJcIjtcclxuICAgIC8qKiDmiYDlnKjln47luIIgKi9cclxuICAgIHB1YmxpYyBtQ2l0eTpzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIG1DaGFubmVsSWQ6bnVtYmVyID0gMDtcclxuICAgIC8qKiDnjqnlrrbnu4/pqowgKi9cclxuICAgIHB1YmxpYyBtR2FtZUV4cDpudW1iZXIgPSAwO1xyXG4gICAgLyoqIOiDveWQpuWdkOS4iyAqL1xyXG4gICAgcHVibGljIG1DYW5TaXQ6bnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBtVG91clBvaW50Om51bWJlciA9IDA7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIHRoZUFwcC5ldmVudHMub24ocHJvdG9jb2wubGFuZC5HQzJDX1BMQVlFUklORk8sdGhpcywgdGhpcy5yZWZyZXNoVXNlckluZm9CeUdDKTtcclxuICAgICAgICAvLyB0aGVBcHAuZXZlbnRzLm9uKHByb3RvY29sLmxhbmQuR0MyQ19QTEFZRVJJTkZPRVgsdGhpcywgdGhpcy5yZWZyZXNoVXNlckluZm9CeUdDRXgpO1xyXG4gICAgICAgIC8vIHRoZUFwcC5ldmVudHMub24ocHJvdG9jb2wubGFuZC5HUzJDX1VTRVJEQVRBLCB0aGlzLCB0aGlzLnJlZnJlc2hVc2VySW5mb0J5R1MpO1xyXG4gICAgICAgIC8vIHRoZUFwcC5ldmVudHMub24ocHJvdG9jb2wubGFuZC5HUzJDX0xJUVVBTl9OVU0sdGhpcyx0aGlzLnJlZnJlc2hMaVF1YW5CeUdTKTtcclxuICAgICAgICAvLyB0aGVBcHAuZXZlbnRzLm9uKHByb3RvY29sLmxhbmQuR1MyQ19SRUdCLHRoaXMsdGhpcy5yZWZyZXNoVXNlckdvbGQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2hvdyB1c2VyIGdvbGQgYXMgc2hvcnQgc3RyaW5nLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0U2hvcnRHb2xkU3RyaW5nKCk6c3RyaW5ne1xyXG4gICAgICAgIHJldHVybiBOdW1iZXIuVG9TaG9ydFN0cmluZyh0aGlzLm1Hb2xkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNob3cgdXNlciBMaVF1YW4gYXMgc2hvcnQgc3RyaW5nLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0U2hvcnRMaVF1YW5TdHJpbmcoKTpzdHJpbmd7XHJcbiAgICAgICAgcmV0dXJuIE51bWJlci5Ub1Nob3J0U3RyaW5nKHRoaXMubUxpUXVhbik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliLfmlrDph5HluIFcclxuICAgICAqIEBwYXJhbSBkYXRhIOaVsOaNrua1gVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlZnJlc2hVc2VyR29sZChkYXRhOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICB0aGlzLm1Hb2xkID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubURaQ2FzaCA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1CZWFuID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUhvbWVQZWFzID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDnjqnlrrbmlbDmja5ieSBnY1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlZnJlc2hVc2VySW5mb0J5R0MobWVzc2FnZTpMYXlhLkJ5dGUpOnZvaWQge1xyXG4gICAgICAgIHRoaXMubVVzZXJJZCAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1OaWNrTmFtZSAgPSBtZXNzYWdlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgIHRoaXMubUZhY2UgICAgICA9IG1lc3NhZ2UuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5tR29sZCAgICAgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubURaQ2FzaCAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1CZWFuICAgICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tSG9tZVBlYXMgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubVNleCAgICAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOeOqeWutuaVsOaNrmJ5IGdjIEV4XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVmcmVzaFVzZXJJbmZvQnlHQ0V4KG1lc3NhZ2U6TGF5YS5CeXRlKTp2b2lkIHtcclxuICAgICAgICB0aGlzLm1Vc2VySWQgICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tTmlja05hbWUgID0gbWVzc2FnZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLm1GYWNlICAgICAgPSBtZXNzYWdlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgIHRoaXMubUdvbGQgICAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1EWkNhc2ggICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tQmVhbiAgICAgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUhvbWVQZWFzICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1TZXggICAgICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tWVlBY2NvdW50ICA9IG1lc3NhZ2UuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDnjqnlrrbmlbDmja5ieSBnc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlZnJlc2hVc2VySW5mb0J5R1MobWVzc2FnZTpMYXlhLkJ5dGUpOnZvaWQge1xyXG4gICAgICAgIHRoaXMubVBvcnRLZXkgICA9IG1lc3NhZ2UuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5tU2V4ICAgICAgID0gbWVzc2FnZS5nZXRCeXRlKCk7XHJcbiAgICAgICAgdGhpcy5tTmlja05hbWUgID0gbWVzc2FnZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLm1GYWNlICAgICAgPSBtZXNzYWdlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgIHRoaXMubUdvbGQgICAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1EWkNhc2ggICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tQmVhbiAgICAgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUhvbWVQZWFzICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1DaXR5ICAgICAgPSBtZXNzYWdlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgIHRoaXMubUNoYW5uZWxJZCA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1Vc2VySWQgICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tTWQ1ICAgICAgID0gbWVzc2FnZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLm1HYW1lRXhwICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tQ2FuU2l0ICAgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubVRvdXJQb2ludCA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOeOqeWutuekvOWIuOaVsOaNrmJ5IGdzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVmcmVzaExpUXVhbkJ5R1MobWVzc2FnZTpMYXlhLkJ5dGUpOnZvaWQgeyBcclxuICAgICAgICB0aGlzLm1MaVF1YW4gICAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTsgXHJcbiAgICAgICAgLy90aGVBcHAuZXZlbnRzLmV2ZW50KHByb3RvY29sLmxhbmQuR1MyQ19MSVFVQU5fTlVNX0NIQU5HRSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgdGhlIGhlYWQgaW1hZ2Ugb2YgdGhlIGN1cnJlbnQgcGxheWVyLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0SGVhZEltYWdlKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubVNleDwxP1wiZ2FtZS9sYW5kbG9yZHMvaGVhZC9naXJsLnBuZ1wiOlwiZ2FtZS9sYW5kbG9yZHMvaGVhZC9ib3kucG5nXCI7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi9NYWluXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dpbkhhbmRsZXJ7XHJcbiAgICBwcml2YXRlIG1PbkxvZ2luZWQ6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICBjb25zdHJ1Y3RvcigpeyBcclxuICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9naW4gdG8gc3lzdGVtLlxyXG4gICAgICogQHBhcmFtIGFjY291bnQgYWNjb3VudFxyXG4gICAgICogQHBhcmFtIHB3ZCBwYXNzd29yZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9naW4oYWNjb3VudDpzdHJpbmcscHdkOnN0cmluZyxzaXRlOm51bWJlcj0wLG9uTG9naW5lZDpMYXlhLkhhbmRsZXIpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5tT25Mb2dpbmVkID0gb25Mb2dpbmVkO1xyXG4gICAgICAgIGR6YXBwLnNob3dMb2FkaW5nKCk7XHJcbiAgICAgICAgZHphcHAuTmV0LmxvZ2luVG9HQyhhY2NvdW50LHB3ZCxzaXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdExvZ2luRGF0YShieXRlOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICBkemFwcC5oaWRlTG9hZGluZygpO1xyXG4gICAgICAgIC8vb2ZmIFxyXG4gICAgICAgIGR6YXBwLkV2ZW50cy5vZmYoMCxcIlJFTEdcIix0aGlzKTtcclxuICAgICAgICBkemFwcC5Mb2dnZXIuaW5mbyhcImxvZ2luIGNhbGxiYWNrLlwiKTtcclxuICAgICAgICBsZXQgc3RhdHU6bnVtYmVyID0gYnl0ZS5nZXRVaW50MTYoKTtcclxuICAgICAgICBpZihkemFwcCYmc3RhdHU9PTEpe1xyXG4gICAgICAgICAgICAgLy8g5pu05paw546p5a625pWw5o2uXHJcbiAgICAgICAgICAgIGR6YXBwLlBsYXllci5tQ2xpZW50TG9hZFN0ZXAgID0gMztcclxuICAgICAgICAgICAgZHphcHAuUGxheWVyLm1MYXN0Um9vbU5hbWUgICAgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICBkemFwcC5QbGF5ZXIubUxhc3RSb29tSWQgICAgICA9IGJ5dGUuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgZHphcHAuUGxheWVyLm1Vc2VySWQgICAgICAgICAgPSBieXRlLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGR6YXBwLlBsYXllci5tR2FtZUtleSAgICAgICAgID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICAgICAgZHphcHAuUGxheWVyLm1NZDUgICAgICAgICAgICAgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICBkemFwcC5QbGF5ZXIubUlzTmV3VXNlciAgICAgICA9IGJ5dGUuZ2V0Qnl0ZSgpO1xyXG4gICAgICAgICAgICBkemFwcC5QbGF5ZXIubU5pY2tOYW1lICAgICAgICA9IGJ5dGUuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGR6YXBwLlBsYXllci5tQkJTVXJsICAgICAgICAgID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTsgXHJcbiAgICAgICAgICAgIHRoaXMuYWZ0ZXJMb2dpbigpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgIGR6YXBwLnNob3dUb2FzdChcImxvZ2luIGZhaWxlZC5cIik7XHJcbiAgICAgICAgICAgZHphcHAuc2hvd0xvZ2luUGFuZWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGFmdGVyIGxvZ2luIHRvIHN5c3RlbSAuc3VjY2Vzc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFmdGVyTG9naW4oKTp2b2lke1xyXG4gICAgICAgIGlmKHRoaXMubU9uTG9naW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMubU9uTG9naW5lZC5ydW4oKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZHphcHAuTG9nZ2VyLmluZm8oXCJsb2dpbiBzdWNjZXNzIHdpdGggbm8gaGFuZGxlci5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmFuZG9tTWdye1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyB1dWlkKCk6c3RyaW5ne1xyXG4gICAgICAgIHZhciBzID0gW107XHJcbiAgICAgICAgdmFyIGhleERpZ2l0cyA9IFwiMDEyMzQ1Njc4OWFiY2RlZlwiO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzY7IGkrKykge1xyXG4gICAgICAgICAgICBzW2ldID0gaGV4RGlnaXRzLnN1YnN0cihNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAweDEwKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNbMTRdID0gXCI0XCI7ICAvLyBiaXRzIDEyLTE1IG9mIHRoZSB0aW1lX2hpX2FuZF92ZXJzaW9uIGZpZWxkIHRvIDAwMTBcclxuICAgICAgICBzWzE5XSA9IGhleERpZ2l0cy5zdWJzdHIoKHNbMTldICYgMHgzKSB8IDB4OCwgMSk7ICAvLyBiaXRzIDYtNyBvZiB0aGUgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZCB0byAwMVxyXG4gICAgICAgIHNbOF0gPSBzWzEzXSA9IHNbMThdID0gc1syM10gPSBcIi1cIjtcclxuICAgICAgICB2YXIgdXVpZCA9IHMuam9pbihcIlwiKTtcclxuICAgICAgICByZXR1cm4gdXVpZDtcclxuICAgIH1cclxufSIsImltcG9ydCB7IHVpIH0gZnJvbSBcIi4uLy4uLy4uL3VpL2xheWFNYXhVSVwiO1xyXG5cclxuLyoqXHJcbiAqIEBicmllZiA6IGxvYWRpbmcgdmlld1xyXG4gKiBAQXV0aG9yOiBXZW56dW9saVxyXG4gKiBARGF0ZTogMjAxOS8wNC8wOFxyXG4gKi8gXHJcbiAgICBleHBvcnQgZGVmYXVsdCBjbGFzcyBMb2FkaW5nVmlldyBleHRlbmRzIHVpLmR6Z2FtZS5jb21tb24uTG9hZGluZ1VJe1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsYmxUaXBzOkxheWEuTGFiZWw7XHJcbiAgICBwdWJsaWMgc2hvcnQ6Ym9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lke1xyXG4gICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25FbmFibGUoKTp2b2lke1xyXG4gICAgICAgIExheWEudGltZXIubG9vcCg1MDAsdGhpcyx0aGlzLmNoYW5nZUZvbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYW5nZUZvbnQoKTp2b2lke1xyXG4gICAgICAgIHRoaXMuc2hvcnQgPSAhdGhpcy5zaG9ydDtcclxuICAgICAgICBsZXQgbXNnOnN0cmluZyA9IFwiTG9hZGluZ1wiOyBcclxuICAgICAgICB0aGlzLmxibFRpcHMudGV4dCA9IHRoaXMuc2hvcnQ/XCJMb2FkaW5nLlwiOlwiLkxvYWRpbmdcIjtcclxuICAgIH1cclxuXHJcbiAgICBvbkRlc3Ryb3koKTp2b2lke1xyXG4gICAgICAgIExheWEudGltZXIuY2xlYXIodGhpcyx0aGlzLmNoYW5nZUZvbnQpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgdWkgfSBmcm9tIFwiLi4vLi4vLi4vdWkvbGF5YU1heFVJXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXNrVmlldyBleHRlbmRzIHVpLmR6Z2FtZS5jb21tb24uTWFza1VJe1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBzdXBlcigpOyBcclxuICAgIH1cclxuICAgICBcclxuXHJcbiAgICBjcmVhdGVDaGlsZHJlbigpOnZvaWR7XHJcbiAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgIH1cclxuICAgIG9uRW5hYmxlKCk6dm9pZHtcclxuICAgICAgICAgXHJcbiAgICB9IFxyXG59IiwiaW1wb3J0IHsgdWkgfSBmcm9tIFwiLi4vLi4vLi4vdWkvbGF5YU1heFVJXCI7XHJcbmltcG9ydCB7IGR6YXBwIH0gZnJvbSBcIi4uLy4uLy4uL01haW5cIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2dyZXNzVmlldyBleHRlbmRzIHVpLmR6Z2FtZS5jb21tb24uUHJvZ3Jlc3NVSXtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgc3VwZXIoKTsgXHJcbiAgICB9XHJcbiAgICAgXHJcbiAgICBwdWJsaWMgbGJsVGlwczpMYXlhLkxhYmVsO1xyXG4gICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lke1xyXG4gICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICB9XHJcbiAgICBvbkVuYWJsZSgpOnZvaWR7XHJcbiAgICAgICAgIFxyXG4gICAgfSBcclxuXHJcbiAgICBwdWJsaWMgcHJvZ3Jlc3NDaGFuZ2UodmFsOm51bWJlcik6dm9pZHtcclxuICAgICAgICB0aGlzLmxibFRpcHMudGV4dCA9IFwicHJvZ3Jlc3MgXCIuY29uY2F0KCh2YWwqMTAwKS50b1N0cmluZygpLFwiJVwiKTtcclxuICAgICAgICBkemFwcC5Mb2dnZXIuaW5mbyh0aGlzLmxibFRpcHMudGV4dCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyB1aSB9IGZyb20gXCIuLi8uLi8uLi91aS9sYXlhTWF4VUlcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvYXN0VmlldyBleHRlbmRzIHVpLmR6Z2FtZS5jb21tb24uVG9hc3RVSXtcclxuICAgIGNvbnN0cnVjdG9yKG1zZzpzdHJpbmcpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5tTWVzc2FnZSA9IG1zZztcclxuICAgIH1cclxuICAgIHByaXZhdGUgbU1lc3NhZ2U6c3RyaW5nPVwiXCI7XHJcbiAgICBwdWJsaWMgbGJsVGlwczpMYXlhLkxhYmVsO1xyXG4gICAgcHJpdmF0ZSBtQ2xvc2VIYW5kbGVyOkxheWEuSGFuZGxlciA9IG51bGw7XHJcbiAgICBwcml2YXRlIG1EaXNwbGF5VGltZTpudW1iZXIgPTAuNTtcclxuXHJcbiAgICBjcmVhdGVDaGlsZHJlbigpOnZvaWR7XHJcbiAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgIH1cclxuICAgIG9uRW5hYmxlKCk6dm9pZHtcclxuICAgICAgICB0aGlzLmxibFRpcHMudGV4dCA9IHRoaXMubU1lc3NhZ2U7XHJcbiAgICAgICAgTGF5YS5Ud2Vlbi50byh0aGlzLmxibFRpcHMse3k6MzQ0LGFscGhhOjF9LDgwMCxMYXlhLkVhc2Uuc3Ryb25nT3V0LExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLmRlbGF5Q2xvc2UpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlbGF5IGNsb3NlIHRoZSB0b2FzdCB2aWV3XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGVsYXlDbG9zZSgpOnZvaWR7XHJcbiAgICAgICAgTGF5YS50aW1lci5vbmNlKDEwMDAqdGhpcy5tRGlzcGxheVRpbWUsdGhpcyx0aGlzLmhpZGVUb2FzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBleGl0IHRvYXN0IHZpZXdcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoaWRlVG9hc3QoKTp2b2lke1xyXG4gICAgICAgIExheWEuVHdlZW4udG8odGhpcy5sYmxUaXBzLHthbHBoYTowLHk6MTUyfSw5MDAsTGF5YS5FYXNlLnN0cm9uZ091dCxMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsdGhpcy5kZXN0cm95TXNnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkZXN0cm95TXNnKCl7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95KHRydWUpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgZHphcHAgfSBmcm9tIFwiLi4vLi4vLi4vTWFpblwiO1xyXG5pbXBvcnQgeyB1aSB9IGZyb20gXCIuLi8uLi8uLi91aS9sYXlhTWF4VUlcIjtcclxuaW1wb3J0IHsgbGFucmVzIH0gZnJvbSBcIi4uLy4uLy4uL2dhbWVzL2xhbmRsb3Jkcy9jb25mcy9yZXNcIjtcclxuaW1wb3J0IExhbkxvYmJ5VmlldyBmcm9tIFwiLi4vLi4vLi4vZ2FtZXMvbGFuZGxvcmRzL3ZpZXdzL2xhbmxvYmJ5XCI7XHJcbmltcG9ydCBHYW1lc1ZpZXcgZnJvbSBcIi4uLy4uLy4uL2dhbWVzL2dsb2JhbC9nYW1lc3ZpZXdcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvYmJ5VmlldyBleHRlbmRzIHVpLmR6Z2FtZS5HYW1lTG9iYnkuTG9iYnlVSSB7XHJcbiBcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgb25FbmFibGUoKTp2b2lke1xyXG4gICAgICAgIHRoaXMuZXZlbnRCaW5kKCk7XHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2hvd0dhbWVzKCk6dm9pZHtcclxuICAgICAgICBsZXQgZ2FtZXM6R2FtZXNWaWV3ID0gbmV3IEdhbWVzVmlldygpO1xyXG4gICAgICAgIGdhbWVzLnpPcmRlciA9IDE7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZChnYW1lcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudExpc3RlbigpOnZvaWR7XHJcbiAgICAgICBcclxuICAgICAgICBkemFwcC5FdmVudHMuTGlzdGVuKDEsXCJSRUxHXCIsdGhpcyx0aGlzLmFmdGVyTG9naW4pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWZ0ZXJMb2dpbihkYXRhOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICBkemFwcC5Mb2dnZXIuaW5mbyhcImxvZ2luIGNhbGxiYWNrLlwiKTtcclxuICAgICAgICBsZXQgc3RhdHU6bnVtYmVyID0gZGF0YS5nZXRVaW50MTYoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGV2ZW50QmluZCgpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5idG5ERFogJiYgdGhpcy5idG5ERFoub24oTGF5YS5FdmVudC5DTElDSyx0aGlzLHRoaXMub25DbGljayk7XHJcbiAgICAgICAgdGhpcy5idG5Mb2dpbiYmdGhpcy5idG5Mb2dpbi5vbihMYXlhLkV2ZW50LkNMSUNLLHRoaXMsdGhpcy5vbkxvZ2luKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYnRuRERaOkxheWEuQnV0dG9uO1xyXG4gICAgcHVibGljIGJ0blJvb206TGF5YS5CdXR0b247XHJcbiAgICBwdWJsaWMgYnRuTG9naW46TGF5YS5CdXR0b247IFxyXG5cclxuICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZHtcclxuICAgICAgICBzdXBlci5jcmVhdGVDaGlsZHJlbigpO1xyXG4gICAgICAgIHRoaXMuc2hvd0dhbWVzKCk7XHJcbiAgICAgICAgLy9MYXlhLmxvYWRlci5sb2FkKFwiR2FtZUxvYmJ5L0xvYmJ5LnNjZW5lXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uTG9naW4oKTp2b2lke1xyXG4gICAgICAgIC8vZHphcHAuTmV0LkxvZ2luVG9HQyhcIjExMVwiLFwiMTFcIiwwKVxyXG4gICAgICAgIC8vZHphcHAuc2hvd1RvYXN0KFwib24gY2xpY2sgdGhlIGxvZ2luIGJ1dHRvbi5cIik7XHJcbiAgICAgICAgZHphcHAub3BlbkdhbWUobmV3IExhbkxvYmJ5VmlldygpLGxhbnJlcy5sb2JieSk7XHJcbiAgICAgICAvLyBkemFwcC5vcGVuR2FtZShcIkxhbkxvYmJ5XCIsbGFucmVzLmxvYmJ5KTtcclxuICAgIH1cclxuXHJcbiAgICBvbkNsaWNrKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5OZXQuZW50ZXJHYW1lKFwicXVlcnlcIixcImRkel9mcmVlXCIpO1xyXG4gICAgfVxyXG4gXHJcbiBcclxufSIsImltcG9ydCB7IGR6YXBwIH0gZnJvbSBcIi4uLy4uLy4uL01haW5cIjtcclxuaW1wb3J0IHsgdWkgfSBmcm9tIFwiLi4vLi4vLi4vdWkvbGF5YU1heFVJXCI7XHJcbmltcG9ydCBMb2dpbkhhbmRsZXIgZnJvbSBcIi4uLy4uL3ByZXNlbnRlcnMvTG9naW5IYW5kbGVyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVsb2FkVmlldyBleHRlbmRzIHVpLmR6Z2FtZS5jb21tb24uUHJlbG9hZFVJIHtcclxuICAgIHByaXZhdGUgbG9naW46TG9naW5IYW5kbGVyO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTsgIFxyXG4gICAgfVxyXG4gIFxyXG4gICAgcHJpdmF0ZSBlbnRlckxvYmJ5KCk6dm9pZHtcclxuICAgICAgICBkemFwcC5lbnRlckxvYmJ5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGJ0bkxvZ2luOkxheWEuQnV0dG9uO1xyXG5cclxuICAgIC8vIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZHtcclxuICAgIC8vICAgIC8vIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgb25FbmFibGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbigpO1xyXG4gICAgICAgIHRoaXMuZXZlbnRCaW5kKCk7XHJcbiAgICB9IFxyXG5cclxuICAgIHByaXZhdGUgZXZlbnRCaW5kKCk6dm9pZHtcclxuICAgICAgICB0aGlzLmJ0bkxvZ2luJiYodGhpcy5idG5Mb2dpbi52aXNpYmxlPXRydWUpJiZ0aGlzLmJ0bkxvZ2luLm9uKExheWEuRXZlbnQuQ0xJQ0ssdGhpcyx0aGlzLm9uQ2xpY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXZlbnRMaXN0ZW4oKTp2b2lke1xyXG4gICAgICAgIGR6YXBwLkV2ZW50cy5MaXN0ZW4oMSxcIlJFTEdcIix0aGlzLHRoaXMub25Mb2dpbik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkxvZ2luKGJ5dGU6TGF5YS5CeXRlKTp2b2lke1xyXG4gICAgICAgIHRoaXMubG9naW4uaW5pdExvZ2luRGF0YShieXRlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwcml2YXRlIGFmdGVyTG9naW4oYnl0ZTpMYXlhLkJ5dGUpOnZvaWR7XHJcbiAgICAvLyAgICAgLy9vZmYgXHJcbiAgICAvLyAgICAgZHphcHAuRXZlbnRzLm9mZigwLFwiUkVMR1wiLCB0aGlzKTtcclxuICAgIC8vICAgICBkemFwcC5Mb2dnZXIuaW5mbyhcImxvZ2luIGNhbGxiYWNrLlwiKTtcclxuICAgIC8vICAgICBsZXQgc3RhdHU6bnVtYmVyID0gYnl0ZS5nZXRVaW50MTYoKTtcclxuXHJcbiAgICAvLyAgICAgaWYoZHphcHApe1xyXG4gICAgLy8gICAgICAgICAgLy8g5pu05paw546p5a625pWw5o2uXHJcbiAgICAvLyAgICAgICAgIGR6YXBwLlBsYXllci5tQ2xpZW50TG9hZFN0ZXAgID0gMztcclxuICAgIC8vICAgICAgICAgZHphcHAuUGxheWVyLm1MYXN0Um9vbU5hbWUgICAgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgLy8gICAgICAgICBkemFwcC5QbGF5ZXIubUxhc3RSb29tSWQgICAgICA9IGJ5dGUuZ2V0SW50MzIoKTtcclxuICAgIC8vICAgICAgICAgZHphcHAuUGxheWVyLm1Vc2VySWQgICAgICAgICAgPSBieXRlLmdldEludDMyKCk7XHJcbiAgICAvLyAgICAgICAgIGR6YXBwLlBsYXllci5tR2FtZUtleSAgICAgICAgID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgIC8vICAgICAgICAgZHphcHAuUGxheWVyLm1NZDUgICAgICAgICAgICAgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgLy8gICAgICAgICBkemFwcC5QbGF5ZXIubUlzTmV3VXNlciAgICAgICA9IGJ5dGUuZ2V0Qnl0ZSgpO1xyXG4gICAgLy8gICAgICAgICBkemFwcC5QbGF5ZXIubU5pY2tOYW1lICAgICAgICA9IGJ5dGUuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAvLyAgICAgICAgIGR6YXBwLlBsYXllci5tQkJTVXJsICAgICAgICAgID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTsgXHJcbiAgICAvLyAgICAgICAgIGR6YXBwLkxvZ2dlci5lcnJvcihcIlVzZXJJRDpcIitkemFwcC5QbGF5ZXIubVVzZXJJZCk7XHJcbiAgICAvLyAgICAgICAgIGR6YXBwLmVudGVyTG9iYnkoKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgb25DbGljaygpOnZvaWR7XHJcbiAgICAgICAgLy9kemFwcC5OZXQuTG9naW5Ub0dDKFwiMTExXCIsXCIxMVwiLDApXHJcbiAgICAgICAgdGhpcy5sb2dpbj0gbmV3IExvZ2luSGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMubG9naW4ubG9naW4oXCIxMVwiLFwiMTFcIiwwLExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLmVudGVyTG9iYnkpKTtcclxuICAgIH1cclxuICAgIFxyXG59IiwiaW1wb3J0IHsgdWkgfSBmcm9tIFwiLi4vLi4vdWkvbGF5YU1heFVJXCI7XHJcbmltcG9ydCB7IGR6YXBwIH0gZnJvbSBcIi4uLy4uL01haW5cIjtcclxuaW1wb3J0IHsgbGFucmVzIH0gZnJvbSBcIi4uL2xhbmRsb3Jkcy9jb25mcy9yZXNcIjtcclxuaW1wb3J0IExhbkxvYmJ5VmlldyBmcm9tIFwiLi4vbGFuZGxvcmRzL3ZpZXdzL2xhbmxvYmJ5XCI7XHJcbmltcG9ydCB7IHN6cmVzIH0gZnJvbSBcIi4uL3NhbnpoYW5nL2RlZmluZS9zenJlc1wiO1xyXG5pbXBvcnQgbGFuTG9iYnlEYXRhIGZyb20gXCIuLi9sYW5kbG9yZHMvZGF0YS9sYW5sb2JieWRhdGFcIjtcclxuaW1wb3J0IHN6bG9iYnl2aWV3IGZyb20gXCIuLi9zYW56aGFuZy92aWV3cy9zemxvYmJ5XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lc1ZpZXcgZXh0ZW5kcyB1aS5nYW1lcy5nbG9iYWx2aWV3LmdhbWVzVUl7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5tU2VydmVyTGlzdCA9IG5ldyBBcnJheTxhbnk+KCk7XHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbVNlcnZlckxpc3Q6YW55ID0gbnVsbDtcclxuXHJcbiAgICBldmVudExpc3RlbigpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuRXZlbnRzLkxpc3RlbigxLFwiUkVHSVwiLHRoaXMsdGhpcy5nZXRSb29tTGlzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25FbmFibGUoKTp2b2lke1xyXG4gICAgICAgIHRoaXMuYnRuTGFuLm9uKExheWEuRXZlbnQuQ0xJQ0ssdGhpcyx0aGlzLm9wZW5HYW1lLFsxXSk7XHJcbiAgICAgICAgdGhpcy5idG5TWi5vbihMYXlhLkV2ZW50LkNMSUNLLHRoaXMsdGhpcy5vcGVuR2FtZSxbMl0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW5HYW1lKG51bTpudW1iZXIpOnZvaWR7XHJcbiAgICAgICAgaWYobnVtPT0xKXtcclxuICAgICAgICAgICAgZHphcHAuTmV0LmVudGVyR2FtZShcInF1ZXJ5XCIsXCJkZHpfZnJlZVwiKTsgXHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGxldCBsYW46c3psb2JieXZpZXcgPSBuZXcgc3psb2JieXZpZXcoKTtcclxuICAgICAgICAgICAgZHphcHAub3BlbkdhbWUobGFuLHN6cmVzLmxvYmJ5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRSb29tTGlzdChkYXRhOkxheWEuQnl0ZSk6dm9pZHsgXHJcbiAgICAgICAgbGFuTG9iYnlEYXRhLmluc3RhbmNlLmluaXRTZXJ2ZXJzKGRhdGEpO1xyXG4gICAgICAgIHRoaXMub3BlbkREWigpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBvcGVuRERaKCk6dm9pZHtcclxuICAgICAgICBsZXQgbGFuOkxhbkxvYmJ5VmlldyA9IG5ldyBMYW5Mb2JieVZpZXcoKTtcclxuICAgICAgICBkemFwcC5vcGVuR2FtZShsYW4sbGFucmVzLmxvYmJ5KTsgXHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY2xhc3MgbGFucmVzeyBcclxuICAgIHB1YmxpYyBzdGF0aWMgbG9iYnk6YW55W10gPSBbXHJcbiAgICAgICAge3VybDpcImdhbWVzL2xhbmRvcmRzL2xvYmJ5L21haW4ucG5nXCIsIHR5cGU6TGF5YS5Mb2FkZXIuSU1BR0V9LFxyXG4gICAgICAgIHt1cmw6XCJnYW1lcy9sYW5kb3Jkcy9sb2JieS9rdWFuZ2t1YW5nLnNrXCIsIHR5cGU6TGF5YS5Mb2FkZXIuQlVGRkVSfSxcclxuICAgICAgICB7dXJsOlwiZ2FtZXMvbGFuZG9yZHMvbG9iYnkva3VhbmdrdWFuZy5wbmdcIiwgdHlwZTpMYXlhLkxvYWRlci5JTUFHRX0sXHJcbiAgICBdO1xyXG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgbGFuTG9iYnlEYXRhe1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLm1TZXJ2ZXJMaXN0ID0gbmV3IEFycmF5PGFueT4oKTsgXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgbUluc3RhbmNlOmxhbkxvYmJ5RGF0YT1udWxsO1xyXG5cclxuICAgIHByaXZhdGUgbVNlcnZlckxpc3Q6YW55ID0gbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBpbnN0YW5jZSgpe1xyXG4gICAgICAgIGlmKGxhbkxvYmJ5RGF0YS5tSW5zdGFuY2U9PW51bGwpe1xyXG4gICAgICAgICAgICBsYW5Mb2JieURhdGEubUluc3RhbmNlID0gbmV3IGxhbkxvYmJ5RGF0YSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGFuTG9iYnlEYXRhLm1JbnN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0U2VydmVycygpOkFycmF5PGFueT57XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubVNlcnZlckxpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXRTZXJ2ZXJzKGRhdGE6TGF5YS5CeXRlKTp2b2lke1xyXG4gICAgICAgIGxldCBncm91cGlkID0gXCJcIjsgXHJcbiAgICAgICAgdGhpcy5tU2VydmVyTGlzdC5sZW5ndGg9MDtcclxuICAgICAgICBsZXQgbmFtZSA9IGRhdGEuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgd2hpbGUoKGdyb3VwaWQgPSBkYXRhLmdldFVURlN0cmluZygpKSAhPSBcIlwiJiZkYXRhLnBvczxkYXRhLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBpdGVtOiBPYmplY3QgPSB7fTtcclxuICAgICAgICAgICAgaXRlbVtcImdyb3VwaWRcIl0gICAgICAgICA9IGdyb3VwaWQ7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJncm91cG5hbWVcIl0gICAgICAgPSBkYXRhLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICBpdGVtW1wiZ2FtZXBlaWx2XCJdICAgICAgID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgICAgICAgICBpdGVtW1wiaXBcIl0gICAgICAgICAgICAgID0gZGF0YS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICAgICAgaXRlbVtcInBvcnRcIl0gICAgICAgICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcImN1cnJvbmxpbmVcIl0gICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcIm1heG9ubGluZVwiXSAgICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcImlzZ3VpbGRyb29tXCJdICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcImlzdG91cnJvb21cIl0gICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcImF0X2xlYXN0X2dvbGRcIl0gICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcImF0X21vc3RfZ29sZFwiXSAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcImlzaGlnaHJvb21cIl0gICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcImlzaHVhbmxlXCJdICAgICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcIm5vY2hlYXRcIl0gICAgICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcImNob3VzaHVpXCJdICAgICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcIm5hbWVcIl0gICAgICAgICAgICA9IG5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMubVNlcnZlckxpc3QucHVzaChpdGVtKTtcclxuICAgICAgICB9IFxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IHVpIH0gZnJvbSBcIi4uLy4uLy4uL3VpL2xheWFNYXhVSVwiO1xyXG5pbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7XHJcbmltcG9ydCBsYW5Mb2JieURhdGEgZnJvbSBcIi4uL2RhdGEvbGFubG9iYnlkYXRhXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYW5Mb2JieVZpZXcgZXh0ZW5kcyB1aS5nYW1lcy5sYW5kcm9kcy5MYW5Mb2JieVVJe1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgb25FbmFibGUoKTp2b2lkeyAgXHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbigpO1xyXG4gICAgICAgIHRoaXMuc2hvd1Jvb21zKCk7IFxyXG4gICAgICAgIHRoaXMuZXZlbnRCaW5kaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXZlbnRMaXN0ZW4oKTp2b2lke1xyXG4gICAgICAgIGR6YXBwLkV2ZW50cy5MaXN0ZW4oMSxcImdzX2Nvbm5ldGVkXCIsdGhpcyx0aGlzLnN0YXJ0R2FtZSk7XHJcbiAgICB9XHJcbiAgICBldmVudEJpbmRpbmcoKTp2b2lke1xyXG4gICAgICAgIHRoaXMuYnRuQmFjay5vbihMYXlhLkV2ZW50LkNMSUNLLHRoaXMsdGhpcy5nb3RvTG9iYnkpO1xyXG4gICAgICAgIHRoaXMuYnRuUm9vbS5vbihMYXlhLkV2ZW50LkNMSUNLLHRoaXMsdGhpcy5lbnRlclJvb20pO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dSb29tcygpOnZvaWR7XHJcbiAgICAgICAgbGV0IHNlcnZlcnM6QXJyYXk8YW55PiA9IGxhbkxvYmJ5RGF0YS5pbnN0YW5jZS5nZXRTZXJ2ZXJzKCk7XHJcbiAgICAgICAgdGhpcy5sYmxUaXBzLnRleHQgPSBcIldlbGNvbWUgXCIrZHphcHAuUGxheWVyLm1OaWNrTmFtZStcIixpZDpcIitkemFwcC5QbGF5ZXIubVVzZXJJZCtcIlxcbiBSb29tIExpc3QgQ291bnQ6XCIrc2VydmVycy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgZ290b0xvYmJ5KCk6dm9pZHtcclxuICAgICAgICBkemFwcC5lbnRlckxvYmJ5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZW50ZXJSb29tKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5OZXQuZW50ZXJSb29tKFwiZW50ZXJcIixcImRkel9mcmVlXCIsIHBhcnNlSW50KGxhbkxvYmJ5RGF0YS5pbnN0YW5jZS5nZXRTZXJ2ZXJzKClbMF0uZ3JvdXBpZCkpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBtUm9vbUlkOm51bWJlcj0wO1xyXG4gICAgc3RhcnRHYW1lKGJ5dGU6TGF5YS5CeXRlKTp2b2lke1xyXG4gICAgICAgICB0aGlzLm1Sb29tSWQgPSBieXRlLmdldEludDMyKCk7XHJcbiAgICAgICAgIGxldCByZXN1bHQ6bnVtYmVyID0gYnl0ZS5nZXRJbnQzMigpO1xyXG4gICAgICAgICBpZigxPT1yZXN1bHQpe1xyXG4gICAgICAgICAgICAgZHphcHAuc2hvd1RvYXN0KFwi6L+b5YWl5oi/6Ze0Li4ucm9vbWlkOlwiK3RoaXMubVJvb21JZCk7XHJcbiAgICAgICAgICAgICB0aGlzLmJ0blNlbmQub24oTGF5YS5FdmVudC5DTElDSyx0aGlzLHRoaXMuc2VuZE1lc3NhZ2UpO1xyXG4gICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZE1lc3NhZ2UoKTp2b2lke1xyXG4gICAgICAgIGR6YXBwLk5ldC5zZW5kTXNnUGFja2FnZSh0aGlzLm1Sb29tSWQsXCJ4eHh4eFwiLDEsMiwzKTtcclxuICAgICAgICBkemFwcC5OZXQuc2VuZE1zZyh0aGlzLm1Sb29tSWQsXCJ4eHh4eFwiLG5ldyBMYXlhLkJ5dGUoKSk7XHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IGNsYXNzIHN6cmVzeyBcclxuICAgIHB1YmxpYyBzdGF0aWMgbG9iYnk6YW55W10gPSBbXHJcbiAgICAgICAge3VybDpcImdhbWVzL3NhbnpoYW5nL21haW4xLnBuZ1wiLCB0eXBlOkxheWEuTG9hZGVyLklNQUdFfVxyXG4gICAgXTtcclxufSIsImltcG9ydCB7IHVpIH0gZnJvbSBcIi4uLy4uLy4uL3VpL2xheWFNYXhVSVwiO1xyXG5pbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7XHJcbi8vZXhwb3J0IG1vZHVsZSBkemdhbWVzeyBcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mgc3psb2JieXZpZXcgZXh0ZW5kcyB1aS5nYW1lcy5zYW56aGFuZ19leGFtcGxlLnN6bG9iYnlVSXtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvL3B1YmxpYyBidG5CYWNrOkxheWEuQnV0dG9uO1xyXG5cclxuICAgIG9uRW5hYmxlKCk6dm9pZHtcclxuICAgICAgIC8vIHRoaXMuYnRuQmFjay5vbihMYXlhLkV2ZW50LkNMSUNLLHRoaXMsdGhpcy5nb3RvTG9iYnkpOyBcclxuICAgIH1cclxuXHJcbiAgICBnb3RvTG9iYnkoKTp2b2lke1xyXG4gICAgICAgIGR6YXBwLmVudGVyTG9iYnkoKTtcclxuICAgIH1cclxufVxyXG4vL30iLCIvKipUaGlzIGNsYXNzIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGJ5IExheWFBaXJJREUsIHBsZWFzZSBkbyBub3QgbWFrZSBhbnkgbW9kaWZpY2F0aW9ucy4gKi9cbmltcG9ydCBCYXNlVmlldyBmcm9tIFwiLi4vZHpnYW1lcy9jb21wb25lbnRzL2R6cGFnZS9CYXNlVmlld1wiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4uL2R6Z2FtZXMvY29tcG9uZW50cy9kenBhZ2UvQmFzZURhaWxvZ1wiO1xuaW1wb3J0IEJhc2VTY2VuZSBmcm9tIFwiLi4vZHpnYW1lcy9jb21wb25lbnRzL2R6cGFnZS9CYXNlU2NlbmVcIjtcbmV4cG9ydCBtb2R1bGUgdWkuZHpnYW1lLmNvbW1vbiB7XHJcbiAgICBleHBvcnQgY2xhc3MgTG9hZGluZ1VJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG5cdFx0cHVibGljIGxibFRpcHM6TGF5YS5MYWJlbDtcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVZpZXdcIixcInByb3BzXCI6e1wid2lkdGhcIjoxNzI4LFwiaGVpZ2h0XCI6ODY0fSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6Mzc1LFwieFwiOjY2OCxcInZhclwiOlwibGJsVGlwc1wiLFwidGV4dFwiOlwibG9hZGluZy4uLlwiLFwiZm9udFNpemVcIjozNSxcImNvbG9yXCI6XCIjRkZGRkZGXCIsXCJhbmNob3JZXCI6MC41LFwiYW5jaG9yWFwiOjAuNX0sXCJjb21wSWRcIjozfV0sXCJsb2FkTGlzdFwiOltdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhMb2FkaW5nVUkudWlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgY2xhc3MgTWFza1VJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgIHVpVmlldzphbnkgPXtcInR5cGVcIjpcIkJhc2VWaWV3XCIsXCJwcm9wc1wiOntcIndpZHRoXCI6MTcyOCxcInJlbmRlclR5cGVcIjpcIm1hc2tcIixcImhlaWdodFwiOjg2NCxcImF1dG9EZXN0cm95QXRDbG9zZWRcIjp0cnVlfSxcImNvbXBJZFwiOjIsXCJsb2FkTGlzdFwiOltdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhNYXNrVUkudWlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgY2xhc3MgUHJlbG9hZFVJIGV4dGVuZHMgQmFzZVNjZW5lIHtcclxuXHRcdHB1YmxpYyBsYmxUaXBzOkxheWEuTGFiZWw7XG5cdFx0cHVibGljIGJ0bkxvZ2luOkxheWEuQnV0dG9uO1xuICAgICAgICBwdWJsaWMgc3RhdGljICB1aVZpZXc6YW55ID17XCJ0eXBlXCI6XCJCYXNlU2NlbmVcIixcInByb3BzXCI6e1wid2lkdGhcIjoxNzI4LFwibmFtZVwiOlwiZ2FtZUJveFwiLFwiaGVpZ2h0XCI6ODY0fSxcImNvbXBJZFwiOjEsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJTcHJpdGVcIixcInByb3BzXCI6e1wieVwiOjAsXCJ4XCI6MCxcIndpZHRoXCI6MTMzNixcIm5hbWVcIjpcIlVJXCIsXCJoZWlnaHRcIjo3NTB9LFwiY29tcElkXCI6MTQsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6Mzc1LFwieFwiOjY2OCxcInZhclwiOlwibGJsVGlwc1wiLFwidmFsaWduXCI6XCJtaWRkbGVcIixcInRleHRcIjpcIkdhbWUgaXMgc3RhcnRpbmcsUGxzIHdhaXQuLi5cIixcImZvbnRTaXplXCI6NDAsXCJjb2xvclwiOlwiI2M2MzAyZVwiLFwiYW5jaG9yWVwiOjAuNSxcImFuY2hvclhcIjowLjUsXCJhbGlnblwiOlwiY2VudGVyXCJ9LFwiY29tcElkXCI6MTZ9LHtcInR5cGVcIjpcIlNwcml0ZVwiLFwicHJvcHNcIjp7XCJ5XCI6MzI5LFwieFwiOjMyNixcInRleHR1cmVcIjpcInRlc3QvYzEucG5nXCJ9LFwiY29tcElkXCI6MjJ9LHtcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6MzY3LjUsXCJ4XCI6OTMxLFwidmlzaWJsZVwiOmZhbHNlLFwidmFyXCI6XCJidG5Mb2dpblwiLFwic2tpblwiOlwiY29tcC9idXR0b24ucG5nXCIsXCJsYWJlbFwiOlwibG9naW5cIn0sXCJjb21wSWRcIjoyNX1dfV0sXCJsb2FkTGlzdFwiOltcInRlc3QvYzEucG5nXCIsXCJjb21wL2J1dHRvbi5wbmdcIl0sXCJsb2FkTGlzdDNEXCI6W119O1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7IHN1cGVyKCl9XHJcbiAgICAgICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KFByZWxvYWRVSS51aVZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBQcm9ncmVzc1VJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG5cdFx0cHVibGljIGxibFRpcHM6TGF5YS5MYWJlbDtcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVZpZXdcIixcInByb3BzXCI6e1wid2lkdGhcIjoxNzI4LFwiaGVpZ2h0XCI6NzUwfSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6Mzc1LFwieFwiOjY2OCxcInZhclwiOlwibGJsVGlwc1wiLFwiYW5jaG9yWVwiOjAuNSxcImFuY2hvclhcIjowLjV9LFwiY29tcElkXCI6M31dLFwibG9hZExpc3RcIjpbXSxcImxvYWRMaXN0M0RcIjpbXX07XHJcbiAgICAgICAgY29uc3RydWN0b3IoKXsgc3VwZXIoKX1cclxuICAgICAgICBjcmVhdGVDaGlsZHJlbigpOnZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5jcmVhdGVDaGlsZHJlbigpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVZpZXcoUHJvZ3Jlc3NVSS51aVZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBUb2FzdFVJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG5cdFx0cHVibGljIGxibFRpcHM6TGF5YS5MYWJlbDtcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVZpZXdcIixcInByb3BzXCI6e1wid2lkdGhcIjoxNzI4LFwiaGVpZ2h0XCI6ODY0fSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6Mzc1LFwieFwiOjY2OCxcInZhclwiOlwibGJsVGlwc1wiLFwidGV4dFwiOlwiLVwiLFwiZm9udFNpemVcIjo0NSxcImNvbG9yXCI6XCIjRkZGRkZGXCIsXCJhbmNob3JZXCI6MC41LFwiYW5jaG9yWFwiOjAuNX0sXCJjb21wSWRcIjozfV0sXCJsb2FkTGlzdFwiOltdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhUb2FzdFVJLnVpVmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBtb2R1bGUgdWkuZHpnYW1lLkdhbWVMb2JieSB7XHJcbiAgICBleHBvcnQgY2xhc3MgTG9iYnlVSSBleHRlbmRzIEJhc2VTY2VuZSB7XHJcblx0XHRwdWJsaWMgYnRuRERaOkxheWEuQnV0dG9uO1xuXHRcdHB1YmxpYyBidG5Sb29tOkxheWEuQnV0dG9uO1xuXHRcdHB1YmxpYyBidG5Mb2dpbjpMYXlhLkJ1dHRvbjtcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVNjZW5lXCIsXCJwcm9wc1wiOntcIndpZHRoXCI6MTcyOCxcIm5hbWVcIjpcIkxvYmJ5XCIsXCJoZWlnaHRcIjo4NjR9LFwiY29tcElkXCI6MixcImNoaWxkXCI6W3tcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6MzYzLjUsXCJ4XCI6NjE0LFwidmFyXCI6XCJidG5ERFpcIixcInNraW5cIjpcImNvbXAvYnV0dG9uLnBuZ1wiLFwibGFiZWxcIjpcIuaWl+WcsOS4u1wifSxcImNvbXBJZFwiOjN9LHtcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6MzYzLjUsXCJ4XCI6ODAxLFwidmlzaWJsZVwiOmZhbHNlLFwidmFyXCI6XCJidG5Sb29tXCIsXCJza2luXCI6XCJjb21wL2J1dHRvbi5wbmdcIixcImxhYmVsXCI6XCLov5vlhaXmiL/pl7RcIn0sXCJjb21wSWRcIjo1fSx7XCJ0eXBlXCI6XCJCdXR0b25cIixcInByb3BzXCI6e1wieVwiOjM1MixcInhcIjo0MTEsXCJ2YXJcIjpcImJ0bkxvZ2luXCIsXCJza2luXCI6XCJjb21wL2J1dHRvbi5wbmdcIixcImxhYmVsXCI6XCJsb2dpbiBHQ1wifSxcImNvbXBJZFwiOjZ9XSxcImxvYWRMaXN0XCI6W1wiY29tcC9idXR0b24ucG5nXCJdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhMb2JieVVJLnVpVmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBtb2R1bGUgdWkuZ2FtZXMuZ2xvYmFsdmlldyB7XHJcbiAgICBleHBvcnQgY2xhc3MgZ2FtZXNVSSBleHRlbmRzIEJhc2VWaWV3IHtcclxuXHRcdHB1YmxpYyBidG5MYW46TGF5YS5CdXR0b247XG5cdFx0cHVibGljIGJ0blNaOkxheWEuQnV0dG9uO1xuICAgICAgICBwdWJsaWMgc3RhdGljICB1aVZpZXc6YW55ID17XCJ0eXBlXCI6XCJCYXNlVmlld1wiLFwicHJvcHNcIjp7XCJ3aWR0aFwiOjUwMCxcImhlaWdodFwiOjMwMH0sXCJjb21wSWRcIjoyLFwiY2hpbGRcIjpbe1widHlwZVwiOlwiQnV0dG9uXCIsXCJwcm9wc1wiOntcInlcIjo1MCxcInhcIjo1MCxcIndpZHRoXCI6NzgsXCJ2YXJcIjpcImJ0bkxhblwiLFwic2tpblwiOlwiY29tcC9idXR0b24ucG5nXCIsXCJsYWJlbFwiOlwi5paX5Zyw5Li7XCIsXCJoZWlnaHRcIjo0OX0sXCJjb21wSWRcIjozfSx7XCJ0eXBlXCI6XCJCdXR0b25cIixcInByb3BzXCI6e1wieVwiOjYzLFwieFwiOjE2NSxcInZhclwiOlwiYnRuU1pcIixcInNraW5cIjpcImNvbXAvYnV0dG9uLnBuZ1wiLFwibGFiZWxcIjpcIuS4ieW8oFwifSxcImNvbXBJZFwiOjR9XSxcImxvYWRMaXN0XCI6W1wiY29tcC9idXR0b24ucG5nXCJdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhnYW1lc1VJLnVpVmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBtb2R1bGUgdWkuZ2FtZXMubGFuZHJvZHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIExhbkxvYmJ5VUkgZXh0ZW5kcyBCYXNlU2NlbmUge1xyXG5cdFx0cHVibGljIGJ0bkJhY2s6TGF5YS5CdXR0b247XG5cdFx0cHVibGljIGxibFRpcHM6TGF5YS5MYWJlbDtcblx0XHRwdWJsaWMgYnRuUm9vbTpMYXlhLkJ1dHRvbjtcblx0XHRwdWJsaWMgYnRuU2VuZDpMYXlhLkJ1dHRvbjtcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVNjZW5lXCIsXCJwcm9wc1wiOntcIndpZHRoXCI6MTMzNixcImhlaWdodFwiOjc1MH0sXCJjb21wSWRcIjoyLFwiY2hpbGRcIjpbe1widHlwZVwiOlwiU3ByaXRlXCIsXCJwcm9wc1wiOntcInlcIjowLFwieFwiOjAsXCJ3aWR0aFwiOjEzMzYsXCJ0ZXh0dXJlXCI6XCJnYW1lcy9sYW5kb3Jkcy9sb2JieS9tYWluLnBuZ1wiLFwiaGVpZ2h0XCI6NzUwfSxcImNvbXBJZFwiOjN9LHtcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6NjQsXCJ4XCI6NjIsXCJ3aWR0aFwiOjE4MyxcInZhclwiOlwiYnRuQmFja1wiLFwic2tpblwiOlwiY29tcC9idXR0b24ucG5nXCIsXCJsYWJlbFNpemVcIjo0MCxcImxhYmVsXCI6XCLov5Tlm57lpKfljoVcIixcImhlaWdodFwiOjEwNX0sXCJjb21wSWRcIjo0fSx7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6NjAyLFwieFwiOjM3NyxcInZhclwiOlwibGJsVGlwc1wiLFwidGV4dFwiOlwibGFiZWxcIn0sXCJjb21wSWRcIjo1fSx7XCJ0eXBlXCI6XCJCdXR0b25cIixcInByb3BzXCI6e1wieVwiOjIwOCxcInhcIjo3MDMsXCJ3aWR0aFwiOjE4MSxcInZhclwiOlwiYnRuUm9vbVwiLFwic2tpblwiOlwiY29tcC9idXR0b24ucG5nXCIsXCJsYWJlbFwiOlwi6L+b5YWl56ys5LiA5Liq5oi/6Ze0XCIsXCJoZWlnaHRcIjoxMTN9LFwiY29tcElkXCI6Nn0se1widHlwZVwiOlwiQnV0dG9uXCIsXCJwcm9wc1wiOntcInlcIjo2MDIsXCJ4XCI6MTA3NixcInZhclwiOlwiYnRuU2VuZFwiLFwic2tpblwiOlwiY29tcC9idXR0b24ucG5nXCIsXCJsYWJlbFwiOlwi5Y+R6YCB5raI5oGvXCJ9LFwiY29tcElkXCI6N31dLFwibG9hZExpc3RcIjpbXCJnYW1lcy9sYW5kb3Jkcy9sb2JieS9tYWluLnBuZ1wiLFwiY29tcC9idXR0b24ucG5nXCJdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhMYW5Mb2JieVVJLnVpVmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBtb2R1bGUgdWkuZ2FtZXMubG9iYnkge1xyXG4gICAgZXhwb3J0IGNsYXNzIEdhbWVMb2JieVVJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgIHVpVmlldzphbnkgPXtcInR5cGVcIjpcIkJhc2VWaWV3XCIsXCJwcm9wc1wiOntcIndpZHRoXCI6MTcyOCxcImhlaWdodFwiOjg2NH0sXCJjb21wSWRcIjoyLFwiY2hpbGRcIjpbe1widHlwZVwiOlwiQnV0dG9uXCIsXCJwcm9wc1wiOntcInlcIjozMjcsXCJ4XCI6NTIwLFwic2tpblwiOlwiY29tcC9idXR0b24ucG5nXCIsXCJsYWJlbFwiOlwibGFiZWxcIn0sXCJjb21wSWRcIjozfV0sXCJsb2FkTGlzdFwiOltcImNvbXAvYnV0dG9uLnBuZ1wiXSxcImxvYWRMaXN0M0RcIjpbXX07XHJcbiAgICAgICAgY29uc3RydWN0b3IoKXsgc3VwZXIoKX1cclxuICAgICAgICBjcmVhdGVDaGlsZHJlbigpOnZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5jcmVhdGVDaGlsZHJlbigpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVZpZXcoR2FtZUxvYmJ5VUkudWlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IG1vZHVsZSB1aS5nYW1lcy5zYW56aGFuZ19leGFtcGxlIHtcclxuICAgIGV4cG9ydCBjbGFzcyBzemxvYmJ5VUkgZXh0ZW5kcyBCYXNlU2NlbmUge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgIHVpVmlldzphbnkgPXtcInR5cGVcIjpcIkJhc2VTY2VuZVwiLFwicHJvcHNcIjp7XCJ3aWR0aFwiOjUwMCxcImhlaWdodFwiOjMwMH0sXCJjb21wSWRcIjoyLFwiY2hpbGRcIjpbe1widHlwZVwiOlwiU3ByaXRlXCIsXCJwcm9wc1wiOntcInlcIjowLFwieFwiOjAsXCJ3aWR0aFwiOjEzMzYsXCJ0ZXh0dXJlXCI6XCJnYW1lcy9zYW56aGFuZy9tYWluMS5wbmdcIixcImhlaWdodFwiOjc1MH0sXCJjb21wSWRcIjo0fV0sXCJsb2FkTGlzdFwiOltcImdhbWVzL3NhbnpoYW5nL21haW4xLnBuZ1wiXSxcImxvYWRMaXN0M0RcIjpbXX07XHJcbiAgICAgICAgY29uc3RydWN0b3IoKXsgc3VwZXIoKX1cclxuICAgICAgICBjcmVhdGVDaGlsZHJlbigpOnZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5jcmVhdGVDaGlsZHJlbigpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVZpZXcoc3psb2JieVVJLnVpVmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHIiXX0=
