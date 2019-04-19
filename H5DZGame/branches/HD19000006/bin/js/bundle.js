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
},{"./Main":3,"./dzgames/core/eventmgr/EventDispatch":9,"./dzgames/core/logmgr/Logger":10,"./dzgames/core/netmgr/NetworkMgr":11,"./dzgames/core/resmgr/ResourceMgr":13,"./dzgames/core/soundmgr/SoundManager":14,"./dzgames/modes/lobby/GameItem":15,"./dzgames/modes/lobby/LobbyData":16,"./dzgames/modes/lobby/LocalPlayer":17,"./dzgames/views/common/LoadingView":20,"./dzgames/views/common/MaskView":21,"./dzgames/views/common/ProgressView":22,"./dzgames/views/common/ToastView":23,"./dzgames/views/lobby/LobbyView":24,"./dzgames/views/preload/PreloadView":25}],2:[function(require,module,exports){
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
},{"./AppPresenter":1,"./GameConfig":2,"./dzgames/configs/rescfg/imgres/res":8,"./dzgames/core/resmgr/ResourceMgr":13}],4:[function(require,module,exports){
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
},{"../../../Main":3,"../../utils/RandomMgr":19,"./BaseView":5}],5:[function(require,module,exports){
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
},{"../../../Main":3,"./BaseScene":4}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
    UserConfig.serverAddress = "172.17.1.91";
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../../Main");
var Dictionary_1 = require("../../components/extend/Dictionary");
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
},{"../../../Main":3,"../../components/extend/Dictionary":6}],10:[function(require,module,exports){
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
},{"../../configs/customcfg/UserConfig":7}],11:[function(require,module,exports){
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
},{"../../../Main":3,"../../configs/customcfg/UserConfig":7,"./WebSocket":12}],12:[function(require,module,exports){
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
},{"../../../Main":3}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
},{"../../../Main":3}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../Main");
var LoginHandler = /** @class */ (function () {
    function LoginHandler() {
        this.mOnLogined = null;
    }
    LoginHandler.prototype.eventListen = function () {
        Main_1.dzapp.Events.Listen(1, "RELG", this, this.onLogin);
    };
    /**
     * Login to system.
     * @param account account
     * @param pwd password
     */
    LoginHandler.prototype.login = function (account, pwd, site, onLogined) {
        if (site === void 0) { site = 0; }
        this.eventListen();
        this.mOnLogined = onLogined;
        Main_1.dzapp.showLoading();
        Main_1.dzapp.Net.loginToGC(account, pwd, site);
    };
    LoginHandler.prototype.onLogin = function (byte) {
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
},{"../../Main":3}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
},{"../../../ui/layaMaxUI":35}],21:[function(require,module,exports){
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
},{"../../../ui/layaMaxUI":35}],22:[function(require,module,exports){
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
},{"../../../Main":3,"../../../ui/layaMaxUI":35}],23:[function(require,module,exports){
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
},{"../../../ui/layaMaxUI":35}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("../../../Main");
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
var res_1 = require("../../../games/landlords/confs/res");
var lanlobby_1 = require("../../../games/landlords/views/lanlobby");
var gamesview_1 = require("../../../games/global/gamesview");
var SohaLobby_1 = require("../../../games/soha/views/SohaLobby");
var res_2 = require("../../../games/soha/confs/res");
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
        this.btnSoha && this.btnSoha.on(Laya.Event.CLICK, this, this.onClickSoha);
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
        Main_1.dzapp.Net.enterGame("query", "ddz_match");
    };
    LobbyView.prototype.onClickSoha = function () {
        Main_1.dzapp.openGame(new SohaLobby_1.default(), res_2.sohares.lobby);
        Main_1.dzapp.Net.enterGame("query", "soha");
    };
    return LobbyView;
}(layaMaxUI_1.ui.dzgame.GameLobby.LobbyUI));
exports.default = LobbyView;
},{"../../../Main":3,"../../../games/global/gamesview":26,"../../../games/landlords/confs/res":27,"../../../games/landlords/views/lanlobby":29,"../../../games/soha/confs/res":32,"../../../games/soha/views/SohaLobby":34,"../../../ui/layaMaxUI":35}],25:[function(require,module,exports){
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
        //dzapp.mEvents.Listen(0,"RELG",this,this.afterLogin);
    };
    PreloadView.prototype.afterLogin = function (byte) {
        //off 
        Main_1.dzapp.Events.off(0, "RELG", this);
        Main_1.dzapp.Logger.info("login callback.");
        var statu = byte.getUint16();
        if (Main_1.dzapp) {
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
            Main_1.dzapp.Logger.error("UserID:" + Main_1.dzapp.Player.mUserId);
            Main_1.dzapp.enterLobby();
        }
    };
    PreloadView.prototype.onClick = function () {
        //dzapp.Net.LoginToGC("111","11",0)
        var login = new LoginHandler_1.default();
        login.login("11", "11", 0, Laya.Handler.create(this, this.enterLobby));
    };
    return PreloadView;
}(layaMaxUI_1.ui.dzgame.common.PreloadUI));
exports.default = PreloadView;
},{"../../../Main":3,"../../../ui/layaMaxUI":35,"../../presenters/LoginHandler":18}],26:[function(require,module,exports){
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
},{"../../Main":3,"../../ui/layaMaxUI":35,"../landlords/confs/res":27,"../landlords/data/lanlobbydata":28,"../landlords/views/lanlobby":29,"../sanzhang/define/szres":30,"../sanzhang/views/szlobby":31}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lanres = /** @class */ (function () {
    function lanres() {
    }
    lanres.lobby = [
        // {url:"games/landords/lobby/main.png", type:Laya.Loader.IMAGE},
        { url: "games/landords/lobby/kuangkuang.sk", type: Laya.Loader.BUFFER },
        { url: "games/landords/lobby/kuangkuang.png", type: Laya.Loader.IMAGE },
    ];
    return lanres;
}());
exports.lanres = lanres;
},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
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
},{"../../../Main":3,"../../../ui/layaMaxUI":35,"../data/lanlobbydata":28}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
},{"../../../Main":3,"../../../ui/layaMaxUI":35}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sohares = /** @class */ (function () {
    function sohares() {
    }
    sohares.lobby = [
        // {url:"res/atlas/games/soha/lobby.atlas"},
        { url: "games/soha/lobby/bg.jpg", type: Laya.Loader.IMAGE },
    ];
    return sohares;
}());
exports.sohares = sohares;
},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GroupInfo = /** @class */ (function () {
    function GroupInfo() {
        //房间ID
        this.mId = 0;
        //房间名字
        this.mName = "";
        //房间赔率
        this.mGamePeilv = 0;
        //房间ip
        this.mIp = "";
        //房间端口
        this.mPort = 0;
        //当前在线人数
        this.mCurrOnline = 0;
        //最大在线人数
        this.mMaxOnline = 0;
        //是否公会房间
        this.mIsGuildRoom = 0;
        //是否竞技场房间
        this.mIsTourRoom = 0;
        //房间最小携带
        this.mAtLeastGold = 0;
        //房间最大携带
        this.mAtMostGold = 0;
        //是否能坐下
        this.mIsCanSit = 0;
        //是否欢乐豆场
        this.misHuanle = 0;
        //是否放作弊场
        this.mNoCheat = 0;
        //房间抽水(无用参数，有些游戏是动态抽水)
        this.mChoushui = 0;
    }
    GroupInfo.prototype.setData = function (groupId, data) {
        this.mId = groupId;
        this.mName = data.getUTFString();
        this.mGamePeilv = data.getInt32();
        this.mIp = data.getUTFString();
        this.mPort = data.getInt32();
        this.mCurrOnline = data.getInt32();
        this.mMaxOnline = data.getInt32();
        this.mIsGuildRoom = data.getInt32();
        this.mIsTourRoom = data.getInt32();
        this.mAtLeastGold = data.getInt32();
        this.mAtMostGold = data.getInt32();
        this.mIsCanSit = data.getInt32();
        this.misHuanle = data.getInt32();
        this.mNoCheat = data.getInt32();
        this.mChoushui = data.getInt32();
    };
    return GroupInfo;
}());
exports.default = GroupInfo;
},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var layaMaxUI_1 = require("../../../ui/layaMaxUI");
var Main_1 = require("../../../Main");
var GroupInfo_1 = require("../data/GroupInfo");
var SohaLobbyView = /** @class */ (function (_super) {
    __extends(SohaLobbyView, _super);
    function SohaLobbyView() {
        var _this = _super.call(this) || this;
        //房间列表数据
        _this.mRoomList = null;
        //场景是否加载完成
        _this.mLoadOK = false;
        _this.eventListen();
        return _this;
    }
    SohaLobbyView.prototype.onEnable = function () {
        this.mLoadOK = true;
        this.eventBinding();
        //场景加载完成，尝试显示房间列表
        this.showRooms();
    };
    SohaLobbyView.prototype.eventListen = function () {
        Main_1.dzapp.Events.Listen(1, "REGI", this, this.onRecvRoomList);
    };
    SohaLobbyView.prototype.eventBinding = function () {
        this.btnBack.on(Laya.Event.CLICK, this, this.gotoLobby);
        // this.btnRoom.on(Laya.Event.CLICK,this,this.enterRoom);
    };
    SohaLobbyView.prototype.gotoLobby = function () {
        Main_1.dzapp.enterLobby();
    };
    SohaLobbyView.prototype.onRecvRoomList = function (data) {
        this.mRoomList = new Array();
        var groupId = "";
        var groupInfo;
        var name = data.getUTFString();
        while ((groupId = data.getUTFString()) != "" && data.pos < data.length) {
            groupInfo = new GroupInfo_1.default();
            groupInfo.setData(Number(groupId), data);
            this.mRoomList.push(groupInfo);
        }
        //收到数据完成，尝试显示房间列表
        this.showRooms();
    };
    SohaLobbyView.prototype.showRooms = function () {
        if (!this.mLoadOK || !this.mRoomList)
            return;
    };
    return SohaLobbyView;
}(layaMaxUI_1.ui.games.soha.SohaLobbyUI));
exports.default = SohaLobbyView;
},{"../../../Main":3,"../../../ui/layaMaxUI":35,"../data/GroupInfo":33}],35:[function(require,module,exports){
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
                LobbyUI.uiView = { "type": "BaseScene", "props": { "width": 1728, "name": "Lobby", "height": 864 }, "compId": 2, "child": [{ "type": "Button", "props": { "y": 352, "x": 541, "var": "btnDDZ", "skin": "comp/button.png", "label": "斗地主" }, "compId": 3 }, { "type": "Button", "props": { "y": 352, "x": 801, "visible": false, "var": "btnRoom", "skin": "comp/button.png", "label": "进入房间" }, "compId": 5 }, { "type": "Button", "props": { "y": 352, "x": 411, "var": "btnLogin", "skin": "comp/button.png", "label": "login GC" }, "compId": 6 }, { "type": "Button", "props": { "y": 352, "x": 671, "width": 75, "var": "btnSoha", "skin": "comp/button.png", "label": "幸运五张", "height": 23 }, "compId": 17 }], "loadList": ["comp/button.png"], "loadList3D": [] };
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
(function (ui) {
    var games;
    (function (games) {
        var soha;
        (function (soha) {
            var SohaLobbyUI = /** @class */ (function (_super) {
                __extends(SohaLobbyUI, _super);
                function SohaLobbyUI() {
                    return _super.call(this) || this;
                }
                SohaLobbyUI.prototype.createChildren = function () {
                    _super.prototype.createChildren.call(this);
                    this.createView(SohaLobbyUI.uiView);
                };
                SohaLobbyUI.uiView = { "type": "BaseScene", "props": { "width": 1728, "height": 864 }, "compId": 2, "child": [{ "type": "Sprite", "props": { "y": 0, "x": 0, "texture": "games/soha/lobby/bg.jpg" }, "compId": 13 }, { "type": "Sprite", "props": { "y": 27, "x": 737, "texture": "games/soha/lobby/3.png" }, "compId": 15 }, { "type": "Button", "props": { "y": 40, "x": 42, "var": "btnBack", "skin": "games/soha/lobby/1.png" }, "compId": 14 }, { "type": "Image", "props": { "y": 191, "x": 130, "var": "img_room1", "skin": "games/soha/lobby/5.png" }, "compId": 65, "child": [{ "type": "Sprite", "props": { "y": 286, "x": 16, "texture": "games/soha/lobby/2.png", "scaleY": 0.8, "scaleX": 0.8 }, "compId": 46 }, { "type": "FontClip", "props": { "y": 297, "x": 50, "width": 250, "value": "200-20万", "spaceX": -2, "skin": "games/soha/lobby/8.png", "sheet": "-0123456789万亿", "name": "lbl_limit", "height": 36, "align": "center" }, "compId": 47 }, { "type": "Label", "props": { "y": 370, "x": 43, "width": 250, "text": "满2局送礼券x1", "name": "lbl_desc", "height": 32, "fontSize": 30, "font": "Microsoft YaHei", "color": "#ffffff", "align": "center" }, "compId": 48 }] }, { "type": "Image", "props": { "y": 191, "x": 508, "var": "img_room2", "skin": "games/soha/lobby/4.png" }, "compId": 66, "child": [{ "type": "Sprite", "props": { "y": 286, "x": 16, "texture": "games/soha/lobby/2.png", "scaleY": 0.8, "scaleX": 0.8 }, "compId": 67 }, { "type": "FontClip", "props": { "y": 297, "x": 50, "width": 250, "value": "200-20万", "spaceX": -2, "skin": "games/soha/lobby/8.png", "sheet": "-0123456789万亿", "name": "lbl_limit", "height": 36, "align": "center" }, "compId": 68 }, { "type": "Label", "props": { "y": 370, "x": 43, "width": 250, "text": "满2局送礼券x1", "name": "lbl_desc", "height": 32, "fontSize": 30, "font": "Microsoft YaHei", "color": "#ffffff", "align": "center" }, "compId": 69 }] }, { "type": "Image", "props": { "y": 191, "x": 886, "var": "img_room3", "skin": "games/soha/lobby/6.png" }, "compId": 70, "child": [{ "type": "Sprite", "props": { "y": 286, "x": 16, "texture": "games/soha/lobby/2.png", "scaleY": 0.8, "scaleX": 0.8 }, "compId": 71 }, { "type": "FontClip", "props": { "y": 297, "x": 50, "width": 250, "value": "200-20万", "spaceX": -2, "skin": "games/soha/lobby/8.png", "sheet": "-0123456789万亿", "name": "lbl_limit", "height": 36, "align": "center" }, "compId": 72 }, { "type": "Label", "props": { "y": 370, "x": 43, "width": 250, "text": "满2局送礼券x1", "name": "lbl_desc", "height": 32, "fontSize": 30, "font": "Microsoft YaHei", "color": "#ffffff", "align": "center" }, "compId": 73 }] }, { "type": "Image", "props": { "y": 191, "x": 1264, "var": "img_room4", "skin": "games/soha/lobby/7.png" }, "compId": 74, "child": [{ "type": "Sprite", "props": { "y": 286, "x": 16, "texture": "games/soha/lobby/2.png", "scaleY": 0.8, "scaleX": 0.8 }, "compId": 75 }, { "type": "FontClip", "props": { "y": 297, "x": 50, "width": 250, "value": "200-20万", "spaceX": -2, "skin": "games/soha/lobby/8.png", "sheet": "-0123456789万亿", "name": "lbl_limit", "height": 36, "align": "center" }, "compId": 76 }, { "type": "Label", "props": { "y": 370, "x": 43, "width": 250, "text": "满2局送礼券x1", "name": "lbl_desc", "height": 32, "fontSize": 30, "font": "Microsoft YaHei", "color": "#ffffff", "align": "center" }, "compId": 77 }] }], "loadList": ["games/soha/lobby/bg.jpg", "games/soha/lobby/3.png", "games/soha/lobby/1.png", "games/soha/lobby/5.png", "games/soha/lobby/2.png", "games/soha/lobby/8.png", "games/soha/lobby/4.png", "games/soha/lobby/6.png", "games/soha/lobby/7.png"], "loadList3D": [] };
                return SohaLobbyUI;
            }(BaseScene_1.default));
            soha.SohaLobbyUI = SohaLobbyUI;
        })(soha = games.soha || (games.soha = {}));
    })(games = ui.games || (ui.games = {}));
})(ui = exports.ui || (exports.ui = {}));
},{"../dzgames/components/dzpage/BaseScene":4,"../dzgames/components/dzpage/BaseView":5}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6L2NvZGluZy9MYXlhQWlyMi4wLjAvcmVzb3VyY2VzL2FwcC9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL0FwcFByZXNlbnRlci50cyIsInNyYy9HYW1lQ29uZmlnLnRzIiwic3JjL01haW4udHMiLCJzcmMvZHpnYW1lcy9jb21wb25lbnRzL2R6cGFnZS9CYXNlU2NlbmUudHMiLCJzcmMvZHpnYW1lcy9jb21wb25lbnRzL2R6cGFnZS9CYXNlVmlldy50cyIsInNyYy9kemdhbWVzL2NvbXBvbmVudHMvZXh0ZW5kL0RpY3Rpb25hcnkudHMiLCJzcmMvZHpnYW1lcy9jb25maWdzL2N1c3RvbWNmZy9Vc2VyQ29uZmlnLnRzIiwic3JjL2R6Z2FtZXMvY29uZmlncy9yZXNjZmcvaW1ncmVzL3Jlcy50cyIsInNyYy9kemdhbWVzL2NvcmUvZXZlbnRtZ3IvRXZlbnREaXNwYXRjaC50cyIsInNyYy9kemdhbWVzL2NvcmUvbG9nbWdyL0xvZ2dlci50cyIsInNyYy9kemdhbWVzL2NvcmUvbmV0bWdyL05ldHdvcmtNZ3IudHMiLCJzcmMvZHpnYW1lcy9jb3JlL25ldG1nci9XZWJTb2NrZXQudHMiLCJzcmMvZHpnYW1lcy9jb3JlL3Jlc21nci9SZXNvdXJjZU1nci50cyIsInNyYy9kemdhbWVzL2NvcmUvc291bmRtZ3IvU291bmRNYW5hZ2VyLnRzIiwic3JjL2R6Z2FtZXMvbW9kZXMvbG9iYnkvR2FtZUl0ZW0udHMiLCJzcmMvZHpnYW1lcy9tb2Rlcy9sb2JieS9Mb2JieURhdGEudHMiLCJzcmMvZHpnYW1lcy9tb2Rlcy9sb2JieS9Mb2NhbFBsYXllci50cyIsInNyYy9kemdhbWVzL3ByZXNlbnRlcnMvTG9naW5IYW5kbGVyLnRzIiwic3JjL2R6Z2FtZXMvdXRpbHMvUmFuZG9tTWdyLnRzIiwic3JjL2R6Z2FtZXMvdmlld3MvY29tbW9uL0xvYWRpbmdWaWV3LnRzIiwic3JjL2R6Z2FtZXMvdmlld3MvY29tbW9uL01hc2tWaWV3LnRzIiwic3JjL2R6Z2FtZXMvdmlld3MvY29tbW9uL1Byb2dyZXNzVmlldy50cyIsInNyYy9kemdhbWVzL3ZpZXdzL2NvbW1vbi9Ub2FzdFZpZXcudHMiLCJzcmMvZHpnYW1lcy92aWV3cy9sb2JieS9Mb2JieVZpZXcudHMiLCJzcmMvZHpnYW1lcy92aWV3cy9wcmVsb2FkL1ByZWxvYWRWaWV3LnRzIiwic3JjL2dhbWVzL2dsb2JhbC9nYW1lc3ZpZXcudHMiLCJzcmMvZ2FtZXMvbGFuZGxvcmRzL2NvbmZzL3Jlcy50cyIsInNyYy9nYW1lcy9sYW5kbG9yZHMvZGF0YS9sYW5sb2JieWRhdGEudHMiLCJzcmMvZ2FtZXMvbGFuZGxvcmRzL3ZpZXdzL2xhbmxvYmJ5LnRzIiwic3JjL2dhbWVzL3NhbnpoYW5nL2RlZmluZS9zenJlcy50cyIsInNyYy9nYW1lcy9zYW56aGFuZy92aWV3cy9zemxvYmJ5LnRzIiwic3JjL2dhbWVzL3NvaGEvY29uZnMvcmVzLnRzIiwic3JjL2dhbWVzL3NvaGEvZGF0YS9Hcm91cEluZm8udHMiLCJzcmMvZ2FtZXMvc29oYS92aWV3cy9Tb2hhTG9iYnkudHMiLCJzcmMvdWkvbGF5YU1heFVJLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1RBLGlFQUE0RDtBQUU1RCw4REFBeUQ7QUFDekQsNkRBQXdEO0FBQ3hELDREQUF1RDtBQUV2RCx1REFBa0Q7QUFDbEQsK0RBQTBEO0FBQzFELHFFQUFvRTtBQUlwRSxtRUFBOEQ7QUFDOUQsa0VBQTZEO0FBQzdELDZEQUF3RDtBQUN4RCxpRUFBNEQ7QUFDNUQsMkRBQXNEO0FBQ3RELG9FQUErRDtBQUMvRCwrQkFBK0I7QUFDL0IsdUVBQWtFO0FBS2xFOzs7O0dBSUc7QUFDSDtJQXdCSztRQXZCRCx3QkFBd0I7UUFDaEIsbUJBQWMsR0FBVSxFQUFFLENBQUM7UUFDM0Isb0JBQWUsR0FBVSxFQUFFLENBQUM7UUFDNUIsaUJBQVksR0FBVSxDQUFD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QVEsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQU0sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQVEsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQVMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUksT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7T0FFRztJQUNLLHlDQUFtQixHQUEzQixVQUE0QixPQUFpQjtRQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFLLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsSUFBSSxHQUFTLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsS0FBSyxHQUFRLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsS0FBSyxHQUFRLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFNLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFRLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFRLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFNLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNy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QUFNLEVBQUMsTUFBTSxFQUFDLFdBQVcsRUFBQyxPQUFPLEVBQUMsRUFBQyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxTQUFTLEVBQUMsUUFBUSxFQUFDLEdBQUcsRUFBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFDLEdBQUcsRUFBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsT0FBTyxFQUFDLE9BQU8sRUFBQyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsU0FBUyxFQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsTUFBTSxFQUFDLDhCQUE4QixFQUFDLFVBQVUsRUFBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsR0FBRyxFQUFDLFNBQVMsRUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsRUFBQyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLFNBQVMsRUFBQyxhQUFhLEVBQUMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxVQUFVLEVBQUMsTUFBTSxFQUFDLGlCQUFpQixFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUMsRUFBQyxRQUFRLEVB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QVcsRUFBQyxPQUFPLEVBQUMsRUFBQyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLEdBQUcsRUFBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLE1BQU0sRUFBQyxpQkFBaUIsRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUMsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsU0FBUyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsU0FBUyxFQUFDLE1BQU0sRUFBQyxpQkFBaUIsRUFBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUMsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLFVBQVUsRUFBQyxNQUFNLEVBQUMsaUJBQWlCLEVBQUMsT0FBTyxFQUFDLFVBQVUsRUFBQyxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsRUFBQyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLE9BQU8sRUFBQyxFQUFFLEVBQUMsS0FBSyxFQUFDLFNBQVMsRUFBQyxNQUFNLEVBQUMsaUJBQWlCLEVBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsaUJBQWlCLENB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TUFBTSxFQUFDLHdCQUF3QixFQUFDLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLFNBQVMsRUFBQyx3QkFBd0IsRUFBQyxRQUFRLEVBQUMsR0FBRyxFQUFDLFFBQVEsRUFBQyxHQUFHLEVBQUMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLEVBQUMsRUFBQyxNQUFNLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBQyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsR0FBRyxFQUFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyx3QkFBd0IsRUFBQyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sRUFBQyxXQUFXLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxFQUFDLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUMsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLEVBQUMsVUFBVSxFQUFDLE1BQU0sRUFBQyxVQUFVLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxVQUFVLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBQyxpQkFBaUIsRUFBQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFDLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUMsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLFdBQVcsRUFBQyxNQUFNLEVBQUMsd0JBQXdCLEVBQUMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUMsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsU0FBUyxFQUFDLHdCQUF3QixFQUFDLFFBQVEsRUFBQyxHQUFHLEVBQUMsUUFBUSxFQUFDLEdBQUcsRUFBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsRUFBQyxFQUFDLE1BQU0sRUFBQyxVQUFVLEVBQUMsT0FBTyxFQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFDLFNBQVMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLHdCQUF3QixFQUFDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxFQUFDLFdBQVcsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLEVBQUMsRUFBQyxNQUFNLEVBQUMsT0FBTyxFQUFDLE9BQU8sRUFBQyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sRUFBQyxVQUFVLEVBQUMsTUFBTSxFQUFDLFVBQVUsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLFVBQVUsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFDLGlCQUFpQixFQUFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUMsRUFBQyxNQUFNLEVBQUMsT0FBTyxFQUFDLE9BQU8sRUFBQyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsV0FBVyxFQUFDLE1BQU0sRUFBQyx3QkFBd0IsRUFBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxTQUFTLEVBQUMsd0JBQXdCLEVBQUMsUUFBUSxFQUFDLEdBQUcsRUFBQyxRQUFRLEVBQUMsR0FBRyxFQUFDLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxFQUFDLEVBQUMsTUFBTSxFQUFDLFVBQVUsRUFBQyxPQUFPLEVBQUMsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLEdBQUcsRUFBQyxPQUFPLEVBQUMsU0FBUyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsd0JBQXdCLEVBQUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLEVBQUMsV0FBVyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsRUFBQyxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsT0FBTyxFQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxFQUFDLFVBQVUsRUFBQyxNQUFNLEVBQUMsVUFBVSxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsVUFBVSxFQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUMsaUJBQWlCLEVBQUMsT0FBTyxFQUFDLFNBQVMsRUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBQyxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsT0FBTyxFQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxXQUFXLEVBQUMsTUFBTSxFQUFDLHdCQUF3QixFQUFDLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLFNBQVMsRUFBQyx3QkFBd0IsRUFBQyxRQUFRLEVBQUMsR0FBRyxFQUFDLFFBQVEsRUFBQyxHQUFHLEVBQUMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLEVBQUMsRUFBQyxNQUFNLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBQyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsR0FBRyxFQUFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyx3QkFBd0IsRUFBQyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sRUFBQyxXQUFXLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxFQUFDLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUMsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLEVBQUMsVUFBVSxFQUFDLE1BQU0sRUFBQyxVQUFVLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxVQUFVLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBQyxpQkFBaUIsRUFBQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMseUJBQXlCLEVBQUMsd0JBQXdCLEVBQUMsd0JBQXdCLEVBQUMsd0JBQXdCLEVBQUMsd0JBQXdCLEVBQUMsd0JBQXdCLEVBQUMsd0JBQXdCLEVBQUMsd0JBQXdCLEVBQUMsd0JBQXdCLENBQUMsRUFBQyxZQUFZLEVBQUMsRUFBRSxFQUFDLENBQUM7Z0JBTTdqRyxrQkFBQzthQVpELEFBWUMsQ0FaZ0MsbUJBQVMsR0FZekM7WUFaWSxnQkFBVyxjQVl2QixDQUFBO1FBQ0wsQ0FBQyxFQWRzQixJQUFJLEdBQUosVUFBSSxLQUFKLFVBQUksUUFjMUI7SUFBRCxDQUFDLEVBZGdCLEtBQUssR0FBTCxRQUFLLEtBQUwsUUFBSyxRQWNyQjtBQUFELENBQUMsRUFkYSxFQUFFLEdBQUYsVUFBRSxLQUFGLFVBQUUsUUFjZiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcclxuaW1wb3J0IExvY2FsUGxheWVyIGZyb20gXCIuL2R6Z2FtZXMvbW9kZXMvbG9iYnkvTG9jYWxQbGF5ZXJcIjtcclxuaW1wb3J0IEdhbWVDb25maWcgZnJvbSBcIi4vR2FtZUNvbmZpZ1wiO1xyXG5pbXBvcnQgVG9hc3RWaWV3IGZyb20gXCIuL2R6Z2FtZXMvdmlld3MvY29tbW9uL1RvYXN0Vmlld1wiO1xyXG5pbXBvcnQgTG9iYnlWaWV3IGZyb20gXCIuL2R6Z2FtZXMvdmlld3MvbG9iYnkvTG9iYnlWaWV3XCI7XHJcbmltcG9ydCBNYXNrVmlldyBmcm9tIFwiLi9kemdhbWVzL3ZpZXdzL2NvbW1vbi9NYXNrVmlld1wiO1xyXG5pbXBvcnQgeyB1aSB9IGZyb20gXCIuL3VpL2xheWFNYXhVSVwiO1xyXG5pbXBvcnQgTG9nZ2VyIGZyb20gXCIuL2R6Z2FtZXMvY29yZS9sb2dtZ3IvTG9nZ2VyXCI7XHJcbmltcG9ydCBOZXR3b3JrTWdyIGZyb20gXCIuL2R6Z2FtZXMvY29yZS9uZXRtZ3IvTmV0d29ya01nclwiO1xyXG5pbXBvcnQgeyBTb3VuZE1hbmFnZXIgfSBmcm9tIFwiLi9kemdhbWVzL2NvcmUvc291bmRtZ3IvU291bmRNYW5hZ2VyXCI7XHJcbmltcG9ydCBNYWluVmlldyBmcm9tIFwiLi9kemdhbWVzL3ZpZXdzL2NvbW1vbi9NYWluVmlld1wiO1xyXG5pbXBvcnQgQmFzZVNjZW5lIGZyb20gXCIuL2R6Z2FtZXMvY29tcG9uZW50cy9kenBhZ2UvQmFzZVNjZW5lXCI7XHJcbmltcG9ydCBCYXNlVmlldyBmcm9tIFwiLi9kemdhbWVzL2NvbXBvbmVudHMvZHpwYWdlL0Jhc2VWaWV3XCI7XHJcbmltcG9ydCBQcmVsb2FkVmlldyBmcm9tIFwiLi9kemdhbWVzL3ZpZXdzL3ByZWxvYWQvUHJlbG9hZFZpZXdcIjtcclxuaW1wb3J0IExvYWRpbmdWaWV3IGZyb20gXCIuL2R6Z2FtZXMvdmlld3MvY29tbW9uL0xvYWRpbmdWaWV3XCI7XHJcbmltcG9ydCBMb2JieURhdGEgZnJvbSBcIi4vZHpnYW1lcy9tb2Rlcy9sb2JieS9Mb2JieURhdGFcIjtcclxuaW1wb3J0IFJlc291cmNlTWdyIGZyb20gXCIuL2R6Z2FtZXMvY29yZS9yZXNtZ3IvUmVzb3VyY2VNZ3JcIjtcclxuaW1wb3J0IEdhbWVJdGVtIGZyb20gXCIuL2R6Z2FtZXMvbW9kZXMvbG9iYnkvR2FtZUl0ZW1cIjtcclxuaW1wb3J0IFByb2dyZXNzVmlldyBmcm9tIFwiLi9kemdhbWVzL3ZpZXdzL2NvbW1vbi9Qcm9ncmVzc1ZpZXdcIjtcclxuaW1wb3J0IHsgZHphcHAgfSBmcm9tIFwiLi9NYWluXCI7XHJcbmltcG9ydCBFdmVudERpc3BhdGNoIGZyb20gXCIuL2R6Z2FtZXMvY29yZS9ldmVudG1nci9FdmVudERpc3BhdGNoXCI7XHJcblxyXG5cclxuXHJcblxyXG4vKipcclxuICogYnJpZWY6Z2FtZSBjZW50ZXIgcHJlc2VudGVyLlxyXG4gKiBBdXRob3I6IHdlbnp1b2xpXHJcbiAqIERhdGU6IDIwMTkvMDQvMDhcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcFByZXNlbnRlcntcclxuICAgIC8qKmxheWVyIGNvbnRyb2wgc3RhcnQqL1xyXG4gICAgcHJpdmF0ZSBaT1JERVJfTE9BRElORzpudW1iZXIgPSAxMTtcclxuICAgIHByaXZhdGUgWk9SREVSX1BST0dSRVNTOm51bWJlciA9IDEwO1xyXG4gICAgcHJpdmF0ZSBaT1JERVJfVE9BU1Q6bnVtYmVyID0gOTtcclxuICAgIHByaXZhdGUgWk9SREVSX01BU0s6bnVtYmVyID0gODtcclxuICAgIHByaXZhdGUgWk9SREVSX01FU1NBR0U6bnVtYmVyID0gNztcclxuICAgIHByaXZhdGUgWk9SREVSX0xPQkJZOm51bWJlciA9IDA7XHJcblxyXG4gICAgLyoqbGF5ZXIgY29udHJvbCBlbmQgKi9cclxuICAgIHByaXZhdGUgX2VuYWJsZUxvYWRpbmc6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICBwcml2YXRlIF9sb2c6TG9nZ2VyID0gbnVsbDtcclxuICAgIHByaXZhdGUgX2V2ZW50OkV2ZW50RGlzcGF0Y2g9bnVsbDtcclxuICAgIHByaXZhdGUgX25ldDpOZXR3b3JrTWdyID0gbnVsbDtcclxuICAgIHByaXZhdGUgX3NvdW5kOlNvdW5kTWFuYWdlciA9bnVsbDsgXHJcbiAgICBwcml2YXRlIF9wbGF5ZXI6TG9jYWxQbGF5ZXI9bnVsbDsgXHJcblxyXG4gICAgcHJpdmF0ZSBfbWFpblZpZXc6TGF5YS5TcHJpdGUgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfbG9iYnk6TG9iYnlWaWV3ID0gbnVsbDtcclxuICAgIHByaXZhdGUgX3Byb2dyZXNzVmlldzpQcm9ncmVzc1ZpZXcgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfbG9hZGluZ1ZpZXc6TG9hZGluZ1ZpZXcgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgX2dhbWVzOkFycmF5PEdhbWVJdGVtPj1udWxsO1xyXG5cclxuICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgICB0aGlzLnJlZ0NsYXNzKCk7XHJcbiAgICAgICAgdGhpcy5tb2R1bGVJbml0aWFsKCk7XHJcbiAgICAgICAgLy90aGlzLmdhbWVTdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVnQ2xhc3MoKTp2b2lke1xyXG4gICAgICAgLy8gTGF5YS5DbGFzc1V0aWxzLnJlZ0NsYXNzKFwiTGFuTG9iYnlcIixkemdhbWVzLkxhbkxvYmJ5Vmlldyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydGluZyBnYW1lIGxvYmJ5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhcnRHYW1lKCk6dm9pZHtcclxuICAgICAgIC8vIEdhbWVDb25maWcuc3RhcnRTY2VuZSAmJiBMYXlhLlNjZW5lLm9wZW4oR2FtZUNvbmZpZy5zdGFydFNjZW5lKTtcclxuICAgICAgIGxldCBwcmVsb2FkOlByZWxvYWRWaWV3ID0gbmV3IFByZWxvYWRWaWV3KCk7XHJcbiAgICAgICBwcmVsb2FkLm5hbWUgPSBcInByZWxvYWRcIjtcclxuICAgICAgIHRoaXMuX21haW5WaWV3LmFkZENoaWxkKHByZWxvYWQpOy8vZW50ZXIgbG9iYnkgbmVlZCB0byByZW1vdmUgdGhlIHByZWxvYWQgdmlldy5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsb3NlIGFsbCBvcGVuIGdhbWVzIGFuZCBiYWNrIHRvIGxvYmJ5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZW50ZXJMb2JieSgpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95R2FtZXMoKTtcclxuICAgICAgICBsZXQgcHJlbG9hZCA9IHRoaXMuX21haW5WaWV3LmdldENoaWxkQnlOYW1lKFwicHJlbG9hZFwiKTtcclxuICAgICAgICBpZihwcmVsb2FkKXtcclxuICAgICAgICAgICAgdGhpcy5fbWFpblZpZXcucmVtb3ZlQ2hpbGQocHJlbG9hZCk7XHJcbiAgICAgICAgfSBcclxuICAgICAgICBpZih0aGlzLl9sb2JieT09bnVsbCl7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYmJ5ID0gbmV3IExvYmJ5VmlldygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYWluVmlldy5hZGRDaGlsZCh0aGlzLl9sb2JieSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBzY2VuZSB0aGUgbWFpbiBzY2VuZSBvZiB0aGUgZ2FtZSB5b3UgbmVlZCB0byBvcGVuLlxyXG4gICAgICogQHBhcmFtIHJlcyB0aGUgbmV3IGdhbWUgcmVzb3VyY2UgbGlzdDpzeXN0ZW0gd2lsbCBoZWxwIHlvdSBsb2FkIHRoZSByZXNvdXJjZSBsaXN0IGFuZCBtYW5hZ2VtZW50LlxyXG4gICAgICovXHJcbiAgICAvLyBwdWJsaWMgb3BlbkdhbWUyKHVybDpzdHJpbmcscmVzOkFycmF5PHN0cmluZz4pOnZvaWR7XHJcbiAgICAvLyAgICAgbGV0IGNsYXM6YW55ID0gTGF5YS5DbGFzc1V0aWxzLmdldENsYXNzKHVybCk7XHJcbiAgICAvLyAgICAgbGV0IHNjZW5lOmFueSA9IG51bGw7XHJcbiAgICAvLyAgICAgaWYoY2xhcyl7XHJcbiAgICAvLyAgICAgICAgIHNjZW5lID0gbmV3IGNsYXMoKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyAgICAgaWYoc2NlbmU9PW51bGwpe1xyXG4gICAgLy8gICAgICAgICB0aGlzLm1Mb2dnZXIuZXJyb3IoXCJjYW4ndCBmaW5kIHNjZW5lLlwiKTtcclxuICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgaWYocmVzPT1udWxsfHxyZXMubGVuZ3RoPDEpe1xyXG4gICAgLy8gICAgICAgICB0aGlzLm1Mb2dnZXIud2FybihcInN5c3RlbSB3aWxsIG9wZW4gdGhlIG5ldyBzY2VuZSBidXQgbm8gbG9hZCBhbnkgcmVzb3VyY2UuIHBscyBjb25maXJtLlwiKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyAgICAgdGhpcy5zaG93TG9hZGluZygpO1xyXG4gICAgLy8gICAgIHRoaXMuZGVzdHJveUdhbWVzKCk7XHJcbiAgICAvLyAgICAgdGhpcy5fZ2FtZXMucHVzaChuZXcgR2FtZUl0ZW0oc2NlbmUubVNjZW5lS2V5LHJlcyxzY2VuZSkpO1xyXG4gICAgLy8gICAgIGxldCBfY29tcGxldGVkOkxheWEuSGFuZGxlciA9IExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLm9wZW5OZXdTY2VuZSxbc2NlbmUubVNjZW5lS2V5XSk7XHJcbiAgICAvLyAgICAgbGV0IF9wcm9ncmVzczpMYXlhLkhhbmRsZXIgPSBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsdGhpcy5zaG93UHJvZ3Jlc3MsbnVsbCxmYWxzZSk7XHJcbiAgICAvLyAgICAgUmVzb3VyY2VNZ3IubG9hZFJlcyhyZXMsX2NvbXBsZXRlZCxfcHJvZ3Jlc3MsbnVsbCwwLHRydWUsc2NlbmUubVNjZW5lS2V5KTtcclxuICAgIC8vIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHNjZW5lIHRoZSBtYWluIHNjZW5lIG9mIHRoZSBnYW1lIHlvdSBuZWVkIHRvIG9wZW4uXHJcbiAgICAgKiBAcGFyYW0gcmVzIHRoZSBuZXcgZ2FtZSByZXNvdXJjZSBsaXN0OnN5c3RlbSB3aWxsIGhlbHAgeW91IGxvYWQgdGhlIHJlc291cmNlIGxpc3QgYW5kIG1hbmFnZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvcGVuR2FtZShzY2VuZTpCYXNlU2NlbmUscmVzOkFycmF5PHN0cmluZz4pOnZvaWR7XHJcbiAgICAgICAgaWYoc2NlbmU9PW51bGwpe1xyXG4gICAgICAgICAgICB0aGlzLkxvZ2dlci5lcnJvcihcImVycm9yIGNhbGxpbmcuIHRoZSBzY2VuZSBpcyBudWxsLlwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihyZXM9PW51bGx8fHJlcy5sZW5ndGg8MSl7XHJcbiAgICAgICAgICAgIHRoaXMuTG9nZ2VyLndhcm4oXCJzeXN0ZW0gd2lsbCBvcGVuIHRoZSBuZXcgc2NlbmUgYnV0IG5vIGxvYWQgYW55IHJlc291cmNlLiBwbHMgY29uZmlybS5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hvd0xvYWRpbmcoKTtcclxuICAgICAgICB0aGlzLmRlc3Ryb3lHYW1lcygpO1xyXG4gICAgICAgIHRoaXMuX2dhbWVzLnB1c2gobmV3IEdhbWVJdGVtKHNjZW5lLm1TY2VuZUtleSxyZXMsc2NlbmUpKTtcclxuICAgICAgICBsZXQgX2NvbXBsZXRlZDpMYXlhLkhhbmRsZXIgPSBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsdGhpcy5vcGVuTmV3U2NlbmUsW3NjZW5lLm1TY2VuZUtleV0pO1xyXG4gICAgICAgIGxldCBfcHJvZ3Jlc3M6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMuc2hvd1Byb2dyZXNzLG51bGwsZmFsc2UpO1xyXG4gICAgICAgIFJlc291cmNlTWdyLmxvYWRSZXMocmVzLF9jb21wbGV0ZWQsX3Byb2dyZXNzLG51bGwsMCx0cnVlLHNjZW5lLm1TY2VuZUtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXN0cm95IGN1cnJlbnQgZ2FtZXMuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGVzdHJveUdhbWVzKCk6dm9pZHtcclxuICAgICAgICBsZXQgbGVuOm51bWJlciA9IHRoaXMuX2dhbWVzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShsZW4+MCl7XHJcbiAgICAgICAgICAgIGxldCBfdGVtOkdhbWVJdGVtID0gdGhpcy5fZ2FtZXMucG9wKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21haW5WaWV3LnJlbW92ZUNoaWxkKF90ZW0ubUdhbWVWaWV3KTtcclxuICAgICAgICAgICAgX3RlbS5tR2FtZVZpZXcuZXhpdEFuZERlc3Ryb3koKTtcclxuICAgICAgICAgICAgUmVzb3VyY2VNZ3IuY2xlYXJSZXNCeUdyb3VwKF90ZW0ubUdhbWVLZXkpO1xyXG4gICAgICAgICAgICBfdGVtID0gbnVsbDtcclxuICAgICAgICAgICAgbGVuID0gdGhpcy5fZ2FtZXMubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG9wZW4gc2NlbmUgZm9yIG5ldyBnYW1lLlxyXG4gICAgICogQHBhcmFtIGFyZ3MgZ2FtZSBrZXlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBvcGVuTmV3U2NlbmUoa2V5OnN0cmluZyk6dm9pZHtcclxuICAgICAgICBsZXQgdmlldzpCYXNlU2NlbmUgPSBudWxsO1xyXG4gICAgICAgIGZvcihsZXQgaT0wO2k8dGhpcy5fZ2FtZXMubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuX2dhbWVzW2ldLm1HYW1lS2V5PT1rZXkpe1xyXG4gICAgICAgICAgICAgICAgdmlldyA9IHRoaXMuX2dhbWVzW2ldLm1HYW1lVmlldzticmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih2aWV3KXtcclxuICAgICAgICAgICAgdGhpcy5fbWFpblZpZXcuYWRkQ2hpbGQodmlldyk7XHJcbiAgICAgICAgICAgIGxldCBub2RlOmxheWEuZGlzcGxheS5Ob2RlID0gdGhpcy5fbWFpblZpZXcucmVtb3ZlQ2hpbGQodGhpcy5fbG9iYnkpO1xyXG4gICAgICAgICAgICB0aGlzLl9sb2JieSA9IG51bGw7XHJcbiAgICAgICAgICAgIG5vZGUuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5oaWRlTG9hZGluZygpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLnNob3dUb2FzdChcIkNhbid0IGZpbmQgc2NlbmUuXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuIFxyXG4gXHJcbiAgICAvKipcclxuICAgICAqIGluaXRpYWwgcmVsYXRpdmUgbW9kdWxlcy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBtb2R1bGVJbml0aWFsKCk6dm9pZHtcclxuICAgICAgICB0aGlzLl9tYWluVmlldyA9IExheWEuU2NlbmUucm9vdDtcclxuICAgICAgICB0aGlzLl9nYW1lcyA9IG5ldyBBcnJheTxHYW1lSXRlbT4oKTtcclxuICAgICAgICB0aGlzLl9wbGF5ZXIgPSBuZXcgTG9jYWxQbGF5ZXIoKTtcclxuICAgICAgICB0aGlzLl9ldmVudCA9IG5ldyBFdmVudERpc3BhdGNoKCk7XHJcbiAgICAgICAgdGhpcy5fbG9nID0gbmV3IExvZ2dlcigpO1xyXG4gICAgICAgIGxldCBfb25jb25uZWN0ZWQ6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMub25Db25uZWN0ZWQpOyBcclxuICAgICAgICBsZXQgX29uQ29ubmVjdEZhaWxlZDpMYXlhLkhhbmRsZXIgPSBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsdGhpcy5vbkNvbm5lY3RGYWlsZWQpO1xyXG4gICAgICAgIGxldCBfb25TZW5kTXNnRmFpbGVkOkxheWEuSGFuZGxlciA9IExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLm9uU2VuZE1zZ0ZhaWxlZCxudWxsLGZhbHNlKTtcclxuICAgICAgICB0aGlzLl9uZXQgPSBuZXcgTmV0d29ya01ncihfb25jb25uZWN0ZWQsX29uQ29ubmVjdEZhaWxlZCxfb25TZW5kTXNnRmFpbGVkKTtcclxuICAgICAgICB0aGlzLl9zb3VuZCA9IG5ldyBTb3VuZE1hbmFnZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IE5ldCgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uZXQ7XHJcbiAgICB9XHJcbiBcclxuICAgIC8qKlNvdW5kIG1hbmFnZXIgKi9cclxuICAgIHB1YmxpYyBnZXQgU291bmQoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc291bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBldmVudCBkaXNwYXRjaCBtb2R1bGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgRXZlbnRzKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2dnZXIgbW9kdWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgTG9nZ2VyKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvZztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogZ2FtZSBwbGF5ZXIgZGF0YVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IFBsYXllcigpe1xyXG4gICAgICAgIGlmKHRoaXMuX3BsYXllcj09bnVsbCl7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYXllciA9IG5ldyBMb2NhbFBsYXllcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fcGxheWVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3dpdGNoIHRoZSBsb2FkaW5nIHN0YXR1cy5cclxuICAgICAqIHRydWU6IGVuYWJsZSBzaG93IGxvYWRpbmcgdmlldy4gc2hvdyBsb2FkaW5nIHZpZXcgd2hlbiBzeXN0ZW0gaW4gbG9hZGluZyByZXMuXHJcbiAgICAgKiBmYWxzZTogaGlkZSB0aGUgbG9hZGluZyB2aWV3IHdoZW4gc3lzdGVtIGluIGxvYWRpbmcuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgZW5hYmxlTG9hZGluZyhlbmFibGU6Ym9vbGVhbil7XHJcbiAgICAgICAgdGhpcy5fZW5hYmxlTG9hZGluZyA9IGVuYWJsZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBzaG93IHRvYXN0IG1lc3NhZ2UuXHJcbiAgICAgKiBAcGFyYW0gbXNnIG1lc3NhZ2Ugc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzaG93VG9hc3QobXNnOnN0cmluZyk6dm9pZHtcclxuICAgICAgICBsZXQgdG9hc3Q6VG9hc3RWaWV3ID0gbmV3IFRvYXN0Vmlldyhtc2cpO1xyXG4gICAgICAgIHRvYXN0LnpPcmRlcj10aGlzLlpPUkRFUl9UT0FTVDtcclxuICAgICAgICBMYXlhLlNjZW5lLnJvb3QuYWRkQ2hpbGQodG9hc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBtZXNzYWdlIHdpbmRvd1xyXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgZGlzcGxheSBtZXNzYWdlXHJcbiAgICAgKiBAcGFyYW0gb2tDYWxsYmFjayBvayBjYWxsYmFjayAgICBcclxuICAgICAqIEBwYXJhbSBjYW5jZWxDYWxsYmFjayBjYW5jZWwgY2FsbGJhY2sgICAgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzaG93TXNnKG1lc3NhZ2U6c3RyaW5nLG9rQ2FsbGJhY2s/OkxheWEuSGFuZGxlcixjYW5jZWxDYWxsYmFjaz86TGF5YS5IYW5kbGVyKTp2b2lke1xyXG4gICAgICAgIC8vVE9ETzp3ZW56dW9saVxyXG4gICAgICAgIGlmKGNvbmZpcm0obWVzc2FnZSkpe1xyXG4gICAgICAgICAgICBva0NhbGxiYWNrJiZva0NhbGxiYWNrLnJ1bigpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjYW5jZWxDYWxsYmFjayYmY2FuY2VsQ2FsbGJhY2sucnVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBtYXNrIGZvciBkaXNhYmxlIGFueSB0b3VjaC9jbGljayBldmVudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dNYXNrKCk6dm9pZHtcclxuICAgICAgICBsZXQgbWFzazpNYXNrVmlldyA9IG5ldyBNYXNrVmlldygpO1xyXG4gICAgICAgIG1hc2suek9yZGVyPXRoaXMuWk9SREVSX01BU0s7XHJcbiAgICAgICAgTGF5YS5TY2VuZS5yb290LmFkZENoaWxkKG1hc2spO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhpZGUgdGhlIGxvYWRpbmcgdmlldy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGhpZGVMb2FkaW5nKCk6dm9pZHtcclxuICAgICAgICBpZih0aGlzLl9lbmFibGVMb2FkaW5nJiZ0aGlzLl9sb2FkaW5nVmlldyl7XHJcbiAgICAgICAgICAgIGxldCBub2RlOmFueSA9IHRoaXMuX21haW5WaWV3LnJlbW92ZUNoaWxkKHRoaXMuX2xvYWRpbmdWaWV3KTtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGluZ1ZpZXcgPSBudWxsO1xyXG4gICAgICAgICAgICBub2RlLmRlc3Ryb3kodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2hvdyBsb2FkaW5nIHZpZXcuIHVzZSBmb3IgdHJhbnNpdGlvbiBvciBzd2l0Y2hpbmcgdGhlIHNjZW5lc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2hvd0xvYWRpbmcoKTp2b2lke1xyXG4gICAgICAgIGlmKHRoaXMuX2VuYWJsZUxvYWRpbmcpe1xyXG4gICAgICAgICAgICBpZighdGhpcy5fbG9hZGluZ1ZpZXcpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZGluZ1ZpZXcgPSBuZXcgTG9hZGluZ1ZpZXcoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdWaWV3LnpPcmRlciA9IHRoaXMuWk9SREVSX0xPQURJTkc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYWluVmlldy5hZGRDaGlsZCh0aGlzLl9sb2FkaW5nVmlldyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzaG93IGxvYWRpbmcgcHJvZ3Jlc3MuXHJcbiAgICAgKiBAcGFyYW0gdmFsIHByb2dyZXNzIGZvciBsb2FkaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzaG93UHJvZ3Jlc3ModmFsOm51bWJlcik6dm9pZHtcclxuICAgICAgICBpZighdGhpcy5fcHJvZ3Jlc3NWaWV3KXtcclxuICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3NWaWV3ID0gbmV3IFByb2dyZXNzVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9ncmVzc1ZpZXcuek9yZGVyID0gdGhpcy5aT1JERVJfUFJPR1JFU1M7XHJcbiAgICAgICAgICAgIHRoaXMuX21haW5WaWV3LmFkZENoaWxkKHRoaXMuX3Byb2dyZXNzVmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCF0aGlzLl9wcm9ncmVzc1ZpZXcudmlzaWJsZSl7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzVmlldy52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodmFsPT0xKXtcclxuICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3NWaWV3LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3NWaWV3LnByb2dyZXNzQ2hhbmdlKHZhbCk7IFxyXG4gICAgICAgIH0gICBcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvd0xvZ2luUGFuZWwoKTp2b2lke1xyXG4gICAgICAgIGR6YXBwLkxvZ2dlci53YXJuKFwiZnVuY3Rpb24gJ3Nob3dMb2dpblBhbmVsJyBub3QgaW1wbGVtZW50ZWQuXCIpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb25uZWN0IHRvIGZvcndhcmQgcmVzdWx0LlxyXG4gICAgICogQHBhcmFtIGRhdGEgcmVjZWl2ZWQgZGF0YVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb25Db25uZWN0ZWQoZGF0YSk6dm9pZHtcclxuICAgICAgICAvL2Nvbm5lY3QgdG8gZm9yd2FyZCBzdWNjZXNzLlxyXG4gICAgICAgIExvYmJ5RGF0YS5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb25uZWN0IHRvIGZvcndhcmQgcmVzdWx0LlxyXG4gICAgICogQHBhcmFtIGRhdGEgcmVjZWl2ZWQgZGF0YVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb25Db25uZWN0RmFpbGVkKGRhdGEpOnZvaWR7XHJcbiAgICAgICAgLy9jb25uZWN0IHRvIGZvcndhcmQgc3VjY2Vzcy5cclxuICAgICAgICB0aGlzLnNob3dUb2FzdChcIkNvbm5lY3QgdG8gc2VydmVyIGZhaWxlZC5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvblNlbmRNc2dGYWlsZWQoKTp2b2lke1xyXG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KFwiTWVzc2FnZSBzZW5kIGZhaWxlZC5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGF5IHNvdW5kXHJcbiAgICAgKiBAcGFyYW0gdXJsIHBhdGhcclxuICAgICAqIEBwYXJhbSBsb29wcyBsb29wcyxvcHRpb25hbFxyXG4gICAgICogQHBhcmFtIGNvbXBsZXRlIGNhbGxiYWNrXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBwbGF5ZXJTb3VuZEVmZmVjdCh1cmw6IHN0cmluZywgbG9vcHM/OiBudW1iZXIsIGNvbXBsZXRlPzpMYXlhLkhhbmRsZXIpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5fc291bmQucGxheVNvdW5kKHVybCxsb29wcyxjb21wbGV0ZSk7ICBcclxuICAgIH1cclxufSIsIi8qKlRoaXMgY2xhc3MgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgYnkgTGF5YUFpcklERSwgcGxlYXNlIGRvIG5vdCBtYWtlIGFueSBtb2RpZmljYXRpb25zLiAqL1xyXG5cclxuLypcclxuKiDmuLjmiI/liJ3lp4vljJbphY3nva47XHJcbiovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVDb25maWd7XHJcbiAgICBzdGF0aWMgd2lkdGg6bnVtYmVyPTE3Mjg7XHJcbiAgICBzdGF0aWMgaGVpZ2h0Om51bWJlcj04NjQ7XHJcbiAgICBzdGF0aWMgc2NhbGVNb2RlOnN0cmluZz1cImZpeGVkd2lkdGhcIjtcclxuICAgIHN0YXRpYyBzY3JlZW5Nb2RlOnN0cmluZz1cIm5vbmVcIjtcclxuICAgIHN0YXRpYyBhbGlnblY6c3RyaW5nPVwidG9wXCI7XHJcbiAgICBzdGF0aWMgYWxpZ25IOnN0cmluZz1cImxlZnRcIjtcclxuICAgIHN0YXRpYyBzdGFydFNjZW5lOmFueT1cImR6Z2FtZS9jb21tb24vUHJlbG9hZC5zY2VuZVwiO1xyXG4gICAgc3RhdGljIHNjZW5lUm9vdDpzdHJpbmc9XCJcIjtcclxuICAgIHN0YXRpYyBkZWJ1Zzpib29sZWFuPWZhbHNlO1xyXG4gICAgc3RhdGljIHN0YXQ6Ym9vbGVhbj1mYWxzZTtcclxuICAgIHN0YXRpYyBwaHlzaWNzRGVidWc6Ym9vbGVhbj1mYWxzZTtcclxuICAgIHN0YXRpYyBleHBvcnRTY2VuZVRvSnNvbjpib29sZWFuPXRydWU7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe31cclxuICAgIHN0YXRpYyBpbml0KCl7XHJcbiAgICAgICAgdmFyIHJlZzogRnVuY3Rpb24gPSBMYXlhLkNsYXNzVXRpbHMucmVnQ2xhc3M7XHJcblxyXG4gICAgfVxyXG59XHJcbkdhbWVDb25maWcuaW5pdCgpOyIsImltcG9ydCBHYW1lQ29uZmlnIGZyb20gXCIuL0dhbWVDb25maWdcIjtcclxuaW1wb3J0IEFwcFByZXNlbnRlciBmcm9tIFwiLi9BcHBQcmVzZW50ZXJcIjtcclxuaW1wb3J0IExvYWRpbmdWaWV3IGZyb20gXCIuL2R6Z2FtZXMvdmlld3MvY29tbW9uL0xvYWRpbmdWaWV3XCI7XHJcbmltcG9ydCBSZXNvdXJjZU1nciBmcm9tIFwiLi9kemdhbWVzL2NvcmUvcmVzbWdyL1Jlc291cmNlTWdyXCI7XHJcbmltcG9ydCBSZXNMaXN0IGZyb20gXCIuL2R6Z2FtZXMvY29uZmlncy9yZXNjZmcvaW1ncmVzL3Jlc1wiO1xyXG5cclxuZXhwb3J0IGxldCBkemFwcDpBcHBQcmVzZW50ZXIgPSBudWxsO1xyXG5jbGFzcyBNYWluIHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdC8v5qC55o2uSURF6K6+572u5Yid5aeL5YyW5byV5pOOXHRcdFxyXG5cdFx0aWYgKHdpbmRvd1tcIkxheWEzRFwiXSkgTGF5YTNELmluaXQoR2FtZUNvbmZpZy53aWR0aCwgR2FtZUNvbmZpZy5oZWlnaHQpO1xyXG5cdFx0ZWxzZSBMYXlhLmluaXQoR2FtZUNvbmZpZy53aWR0aCwgR2FtZUNvbmZpZy5oZWlnaHQsIExheWFbXCJXZWJHTFwiXSk7XHJcblx0XHRMYXlhW1wiUGh5c2ljc1wiXSAmJiBMYXlhW1wiUGh5c2ljc1wiXS5lbmFibGUoKTtcclxuXHRcdExheWFbXCJEZWJ1Z1BhbmVsXCJdICYmIExheWFbXCJEZWJ1Z1BhbmVsXCJdLmVuYWJsZSgpO1xyXG5cdFx0TGF5YS5zdGFnZS5zY2FsZU1vZGUgPSBHYW1lQ29uZmlnLnNjYWxlTW9kZTtcclxuXHRcdExheWEuc3RhZ2Uuc2NyZWVuTW9kZSA9IEdhbWVDb25maWcuc2NyZWVuTW9kZTtcclxuXHRcdC8v5YW85a655b6u5L+h5LiN5pSv5oyB5Yqg6L29c2NlbmXlkI7nvIDlnLrmma9cclxuXHRcdExheWEuVVJMLmV4cG9ydFNjZW5lVG9Kc29uID0gR2FtZUNvbmZpZy5leHBvcnRTY2VuZVRvSnNvbjtcclxuXHJcblx0XHQvL+aJk+W8gOiwg+ivlemdouadv++8iOmAmui/h0lEReiuvue9ruiwg+ivleaooeW8j++8jOaIluiAhXVybOWcsOWdgOWinuWKoGRlYnVnPXRydWXlj4LmlbDvvIzlnYflj6/miZPlvIDosIPor5XpnaLmnb/vvIlcclxuXHRcdGlmIChHYW1lQ29uZmlnLmRlYnVnIHx8IExheWEuVXRpbHMuZ2V0UXVlcnlTdHJpbmcoXCJkZWJ1Z1wiKSA9PSBcInRydWVcIikgTGF5YS5lbmFibGVEZWJ1Z1BhbmVsKCk7XHJcblx0XHRpZiAoR2FtZUNvbmZpZy5waHlzaWNzRGVidWcgJiYgTGF5YVtcIlBoeXNpY3NEZWJ1Z0RyYXdcIl0pIExheWFbXCJQaHlzaWNzRGVidWdEcmF3XCJdLmVuYWJsZSgpO1xyXG5cdFx0aWYgKEdhbWVDb25maWcuc3RhdCkgTGF5YS5TdGF0LnNob3coKTtcclxuXHRcdExheWEuYWxlcnRHbG9iYWxFcnJvciA9IHRydWU7XHJcblxyXG5cdFx0Ly/mv4DmtLvotYTmupDniYjmnKzmjqfliLbvvIx2ZXJzaW9uLmpzb27nlLFJREXlj5HluIPlip/og73oh6rliqjnlJ/miJDvvIzlpoLmnpzmsqHmnInkuZ/kuI3lvbHlk43lkI7nu63mtYHnqItcclxuXHRcdExheWEuUmVzb3VyY2VWZXJzaW9uLmVuYWJsZShcInZlcnNpb24uanNvblwiLCBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsIHRoaXMub25WZXJzaW9uTG9hZGVkKSwgTGF5YS5SZXNvdXJjZVZlcnNpb24uRklMRU5BTUVfVkVSU0lPTik7XHJcblx0fVxyXG5cclxuXHRvblZlcnNpb25Mb2FkZWQoKTogdm9pZCB7XHJcblx0XHQvL+a/gOa0u+Wkp+Wwj+WbvuaYoOWwhO+8jOWKoOi9veWwj+WbvueahOaXtuWAme+8jOWmguaenOWPkeeOsOWwj+WbvuWcqOWkp+WbvuWQiOmbhumHjOmdou+8jOWImeS8mOWFiOWKoOi9veWkp+WbvuWQiOmbhu+8jOiAjOS4jeaYr+Wwj+WbvlxyXG5cdFx0TGF5YS5BdGxhc0luZm9NYW5hZ2VyLmVuYWJsZShcImZpbGVjb25maWcuanNvblwiLCBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsIHRoaXMub25SZXNvdWNlTG9hZGVkKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBhZnRlciBjb25maWcgbG9hZGVkIHRoZW4gc3RhcnRpbmcgdG8gbG9hZCByZXNvdXJjZS91aVxyXG5cdCAqL1xyXG5cdG9uQ29uZmlnTG9hZGVkKCk6IHZvaWQge1xyXG5cdFx0Ly9yZXNvdXJjZSBsb2FkXHJcblx0XHRsZXQgbG9nb1JlczphbnlbXSA9IG5ldyBBcnJheSgpO1xyXG5cdFx0UmVzTGlzdC5QcmVsb2FkLmZvckVhY2goZWxlbWVudCA9PiB7XHJcblx0XHRcdGxvZ29SZXMucHVzaChlbGVtZW50KTtcclxuXHRcdH0pO1xyXG5cdCBcclxuXHRcdFJlc291cmNlTWdyLmxvYWRSZXMobG9nb1JlcywgTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLCB0aGlzLm9uUmVzb3VjZUxvYWRlZCkpO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBhZnRlciByZXNvdXJjZSBsb2FkZWQgdGhlbiBydW4gcHJlc2VudGVyLlxyXG5cdCAqL1xyXG5cdG9uUmVzb3VjZUxvYWRlZCgpOnZvaWR7XHJcblx0XHRkemFwcCA9IGR6YXBwfHwgbmV3IEFwcFByZXNlbnRlcigpOyBcclxuXHRcdGR6YXBwLnN0YXJ0R2FtZSgpO1xyXG5cdH1cclxufVxyXG4vL+a/gOa0u+WQr+WKqOexu1xyXG5uZXcgTWFpbigpO1xyXG4iLCJpbXBvcnQgQmFzZVZpZXcgZnJvbSBcIi4vQmFzZVZpZXdcIjtcclxuaW1wb3J0IFJhbmRvbU1nciBmcm9tIFwiLi4vLi4vdXRpbHMvUmFuZG9tTWdyXCI7XHJcbmltcG9ydCB7IGR6YXBwIH0gZnJvbSBcIi4uLy4uLy4uL01haW5cIjtcclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb246YmFzZSBzY2VuZS5cclxuICogQGF1dGhvcjogd2VuenVvbGlcclxuICogQERhdGU6IDIwMTkvMDQvMDhcclxuICovXHJcbiAgICBleHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlU2NlbmUgZXh0ZW5kcyBMYXlhLlNjZW5le1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7ICBcclxuICAgICAgICAgICAgdGhpcy5tU2NlbmVLZXkgPSBSYW5kb21NZ3IudXVpZCgpO1xyXG4gICAgICAgICAgICAvL3RoaXMub24oTGF5YS5FdmVudC5SRU1PVkVELHRoaXMsdGhpcy5vZmZBbGxMaXN0ZW5lcik7XHJcbiAgICAgICAgfSBcclxuICAgICAgICBwdWJsaWMgbVNjZW5lS2V5OnN0cmluZztcclxuICAgICAgICAvKipjdXJyZW50IHotaW5kZXggZm9yIGFkZCBjaGlsZC4gKi9cclxuICAgICAgICBwcml2YXRlIHpJbmRleDpudW1iZXIgPSAwO1xyXG4gICAgICAgIHByaXZhdGUgbUV4aXRUaW1lOm51bWJlciA9IDEwMDAqMC41O1xyXG5cclxuICAgICAgICBvbkRlc3Ryb3koKTp2b2lke1xyXG4gICAgICAgICAgICB0aGlzLm9mZkFsbExpc3RlbmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlIGFsbCB0aGUgbGlzdGVuZXJzIG9mIHRoZSBjdXJyZW50IHBhZ2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIG9mZkFsbExpc3RlbmVyKCk6dm9pZHtcclxuICAgICAgICAgICAgZHphcHAuRXZlbnRzLm9mZkFsbEJ5Q2FsbGVyKHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogXHJcbiAgICAgICAgICogQHBhcmFtIG5vZGUgZGlzcGxheSBub2RlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhZGRDaGlsZChub2RlOmxheWEuZGlzcGxheS5Ob2RlKTpsYXlhLmRpc3BsYXkuTm9kZXtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYobm9kZSBpbnN0YW5jZW9mIEJhc2VTY2VuZSl7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkNhbm5vdCBhZGQgc2NlbmUgaW4gdGhlIHNjZW5lLlwiO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMuekluZGV4PT11bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy56SW5kZXggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKG5vZGUgaW5zdGFuY2VvZiBCYXNlVmlldyl7XHJcbiAgICAgICAgICAgICAgICBub2RlLnpPcmRlciA9IHRoaXMuekluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nb3RvVmlldyhub2RlKTtcclxuICAgICAgICAgICAgfSAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5hZGRDaGlsZEF0KG5vZGUsdGhpcy56SW5kZXgrKyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmUgZnJvbSBwYXJlbnQgY29udGFpbmVyIGFuZCBkZXN0cm95IHNlbGYuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGV4aXRBbmREZXN0cm95KCk6dm9pZHsgXHJcbiAgICAgICAgICAgIHRoaXMuZXhpdFN5c3RlbSh0aGlzLmRlc3Ryb3ksW3RydWVdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGV4aXQgc3lzdGVtXHJcbiAgICAgICAgICogQHBhcmFtIGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXHJcbiAgICAgICAgICogQHBhcmFtIGFyZ3MgZnVuY3Rpb24gYXJndW1lbnRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBleGl0U3lzdGVtKGNhbGxiYWNrOkZ1bmN0aW9uLC4uLmFyZ3M6YW55W10pOnZvaWR7XHJcbiAgICAgICAgICAgIExheWEuVHdlZW4udG8odGhpcywge2FscGhhOjAuMSx4Oi0yMTYwfSxcclxuICAgICAgICAgICAgICAgIHRoaXMubUV4aXRUaW1lLCBMYXlhLkVhc2UuY3ViaWNPdXQsIExheWEuSGFuZGxlci5jcmVhdGUodGhpcyxjYWxsYmFjayxhcmdzKSwgMFxyXG4gICAgICAgICAgICApOyAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBnb3RvIHRoZSB0YXJnZXQgdmlldyAsbXVzdCB1c2UgdGhlIGdvQmFjayB0byBjb21lIGJhY2tcclxuICAgICAgICAgKiBAcGFyYW0gdiBuZXcgdmlld1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnb3RvVmlldyh2OmxheWEuZGlzcGxheS5Ob2RlKTpsYXlhLmRpc3BsYXkuTm9kZXtcclxuICAgICAgICAgICByZXR1cm4gc3VwZXIuYWRkQ2hpbGQodik7XHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIHRoZSBzd2l0Y2ggZWZmZWN0LlxyXG4gICAgICAgICAgICAvLyBsZXQgX2xvYWRpbmc6QmxhY2tpbmdVSSA9IG5ldyBCbGFja2luZ1VJKCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuYWRkQ2hpbGQoX2xvYWRpbmcpO1xyXG4gICAgICAgICAgICAvLyBfbG9hZGluZy5zaG93KDMwMCxMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsdGhpcy5hZGRWaWV3LFt2LF9sb2FkaW5nXSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IiwiaW1wb3J0IHsgZHphcHAgfSBmcm9tIFwiLi4vLi4vLi4vTWFpblwiO1xyXG5pbXBvcnQgQmFzZVNjZW5lIGZyb20gXCIuL0Jhc2VTY2VuZVwiO1xyXG5cclxuLyoqXHJcbiAqIEBkZXNjIDogYmFzZSB2aWV3XHJcbiAqIEBhdXRob3I6IFdlbnp1b2xpXHJcbiAqIEBEYXRlOiAyMDE5LzA0LzA4XHJcbiAqLyBcclxuIGV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VWaWV3IGV4dGVuZHMgTGF5YS5WaWV3e1xyXG4gICAgIHByaXZhdGUgbUV4aXRUaW1lOm51bWJlciA9IDEwMDAqMC41OyBcclxuICAgICAvKipjdXJyZW50IHotaW5kZXggZm9yIGFkZCBjaGlsZC4gKi9cclxuICAgICBwcml2YXRlIHpJbmRleDpudW1iZXIgPSAwO1xyXG4gICAgLyoqIFxyXG4gICAgICogUGFnZSdzIGJhc2UgdmlldyBpbmNsdWRlIGFsbCBjb21tb24gZnVuY3Rpb25zLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgLy90aGlzLm9uKExheWEuRXZlbnQuUkVNT1ZFRCx0aGlzLHRoaXMub2ZmQWxsTGlzdGVuZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uRGVzdHJveSgpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5vZmZBbGxMaXN0ZW5lcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIGFsbCB0aGUgbGlzdGVuZXJzIG9mIHRoZSBjdXJyZW50IHBhZ2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBvZmZBbGxMaXN0ZW5lcigpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuRXZlbnRzLm9mZkFsbEJ5Q2FsbGVyKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIGZyb20gcGFyZW50IGNvbnRhaW5lciBhbmQgZGVzdHJveSBzZWxmLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZXhpdEFuZERlc3Ryb3koKTp2b2lkeyBcclxuICAgICAgICB0aGlzLmV4aXRTeXN0ZW0odGhpcy5kZXN0cm95LFt0cnVlXSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBleGl0IHN5c3RlbVxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXHJcbiAgICAgKiBAcGFyYW0gYXJncyBmdW5jdGlvbiBhcmd1bWVudHNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBleGl0U3lzdGVtKGNhbGxiYWNrOkZ1bmN0aW9uLC4uLmFyZ3M6YW55W10pOnZvaWR7XHJcbiAgICAgICAgTGF5YS5Ud2Vlbi50byh0aGlzLCB7YWxwaGE6MC4xLHg6LTIxNjB9LFxyXG4gICAgICAgICAgICB0aGlzLm1FeGl0VGltZSwgTGF5YS5FYXNlLmN1YmljT3V0LCBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsY2FsbGJhY2ssYXJncyksIDBcclxuICAgICAgICApOyAgXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBiYWNrIHRvIGxhc3Qgdmlld1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ29CYWNrKCk6dm9pZHtcclxuICAgICAgICB0aGlzLmV4aXRBbmREZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnb3RvIHRoZSB0YXJnZXQgdmlldyAsbXVzdCB1c2UgdGhlIGdvQmFjayB0byBjb21lIGJhY2tcclxuICAgICAqIEBwYXJhbSB2IG5ldyB2aWV3XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnb3RvVmlldyh2OmxheWEuZGlzcGxheS5Ob2RlKTpsYXlhLmRpc3BsYXkuTm9kZXtcclxuICAgICAgICAgcmV0dXJuIHN1cGVyLmFkZENoaWxkKHYpO1xyXG4gICAgICAgICAvL3JlbW92ZSB0aGUgc3dpdGNoIGVmZmVjdC5cclxuICAgICAgICAvLyBsZXQgX2xvYWRpbmc6QmxhY2tpbmdVSSA9IG5ldyBCbGFja2luZ1VJKCk7XHJcbiAgICAgICAgLy8gdGhpcy5hZGRDaGlsZChfbG9hZGluZyk7XHJcbiAgICAgICAgLy8gX2xvYWRpbmcuc2hvdygzMDAsTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMuYWRkVmlldyxbdixfbG9hZGluZ10pKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBjaGlsZCB0byB2aWV3LlxyXG4gICAgICogQHBhcmFtIG5vZGUgY2hpbGRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZENoaWxkKG5vZGU6bGF5YS5kaXNwbGF5Lk5vZGUpOmxheWEuZGlzcGxheS5Ob2Rle1xyXG4gICAgICAgIGlmKG5vZGUgaW5zdGFuY2VvZiBCYXNlU2NlbmUpe1xyXG4gICAgICAgICAgICB0aHJvdyBcIkNhbm5vdCBhZGQgc2NlbmUgaW4gdGhlIHZpZXcuXCI7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy56SW5kZXg9PXVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMuekluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYobm9kZSBpbnN0YW5jZW9mIEJhc2VWaWV3KXtcclxuICAgICAgICAgICAgbm9kZS56T3JkZXIgPSB0aGlzLnpJbmRleCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nb3RvVmlldyhub2RlKTtcclxuICAgICAgICB9ICAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gc3VwZXIuYWRkQ2hpbGRBdChub2RlLHRoaXMuekluZGV4KyspO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGNoaWxkcyB0byB2aWV3LlxyXG4gICAgICogQHBhcmFtIGFyZ3MgY2hpbGRzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRDaGlsZHJlbiguLi5hcmdzOmFueVtdKTp2b2lke1xyXG4gICAgICAgIHN1cGVyLmFkZENoaWxkcmVuKC4uLmFyZ3MpO1xyXG4gICAgfVxyXG59ICIsIi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRGljdGlvbmFyeSBtb2R1bGUuXHJcbiAqIEBhdXRob3Igd2VuenVvbGlcclxuICogQGRhdGUgMjAxOS80LzE2XHJcbiovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpY3Rpb25hcnk8SyxUPntcclxuICAgIGNvbnN0cnVjdG9yKCl7IFxyXG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBuZXcgQXJyYXkoKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZWxlbWVudHM6QXJyYXk8YW55Pj1udWxsO1xyXG4gICAgXHJcbiAgICAvKipMZW5ndGggb2YgRGljdGlvbmFyeSovXHJcbiAgICBwdWJsaWMgZ2V0IGxlbmd0aCgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipDaGVjayB3aGV0aGVyIHRoZSBEaWN0aW9uYXJ5IGlzIGVtcHR5Ki9cclxuICAgIHB1YmxpYyBnZXQgaXNFbXB0eSAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHMubGVuZ3RoPDE7XHJcbiAgICB9O1xyXG4gICAgLyoqcmVtb3ZlIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBEaWN0aW9uYXJ5Ki9cclxuICAgIHB1YmxpYyByZW1vdmVBbGwoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IG5ldyBBcnJheSgpO1xyXG4gICAgfTtcclxuICAgIC8qKmdldCBzcGVjaWZ5IGVsZW1lbnQgb2YgdGhlIGRpY3Rpb25hcnkqL1xyXG4gICAgcHVibGljIGdldEl0ZW1CeUluZGV4KGluZGV4Om51bWJlcik6VCB7XHJcbiAgICAgICAgbGV0IHJsdDpUID0gbnVsbDtcclxuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMuZWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJsdCA9IHRoaXMuZWxlbWVudHNbaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfVxyXG4gICAgLyoqY2hlY2sgd2hldGhlciB0aGUgRGljdGlvbmFyeSBjb250YWlucyB0aGlzIGtleSovXHJcbiAgICBwdWJsaWMgQ29udGFpbihrZXk6Sykge1xyXG4gICAgICAgIGxldCBybHQgPSBmYWxzZTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgaUxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50c1tpXS5rZXkgPT0ga2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgIH07XHJcbiAgICAvKipjaGVjayB3aGV0aGVyIHRoZSBEaWN0aW9uYXJ5IGNvbnRhaW5zIHRoaXMgdmFsdWUqL1xyXG4gICAgcHVibGljIGNvbnRhaW5zVmFsdWUodmFsdWU6VCk6Ym9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHJsdDpib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlMZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZWxlbWVudHNbaV0udmFsdWUgPT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBybHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfTtcclxuICAgIC8qKnJlbW92ZSB0aGlzIGtleSBmcm9tIHRoZSBEaWN0aW9uYXJ5Ki9cclxuICAgIHB1YmxpYyByZW1vdmVCeUtleShrZXk6Syk6Ym9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHJsdDpib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlMZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZWxlbWVudHNbaV0ua2V5ID09IGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBybHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqYWRkIHRoaXMga2V5L3ZhbHVlIHRvIHRoZSBEaWN0aW9uYXJ5LGlmIGtleSBpcyBleGlzdHMscmVwbGFjZSB0aGUgdmFsdWUqL1xyXG4gICAgcHVibGljIGFkZChrZXk6SywgdmFsdWU6VCkge1xyXG4gICAgICAgIGlmKHRoaXMuQ29udGFpbihrZXkpKXtcclxuICAgICAgICAgICAgdGhyb3cgXCJjYW4ndCBhZGQgc2FtZSBrZXkgaW50byB0aGUgZGljdGlvbmFyeS5cIjtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgdGhpcy5lbGVtZW50cy5wdXNoKHtcclxuICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIHNldFZhbHVlKGtleTpLLHZhbDpUKTp2b2lke1xyXG4gICAgICAgIGxldCBpdGVtOlQgPSB0aGlzLmdldEl0ZW1CeUtleShrZXkpO1xyXG4gICAgICAgIGl0ZW0gPSB2YWw7XHJcbiAgICB9XHJcbiAgICAvKiphZGQgdGhpcyBrZXkvdmFsdWUgdG8gdGhlIERpY3Rpb25hcnksaWYga2V5IGlzIGV4aXN0cyB0aGVuIHJlY292ZXIqL1xyXG4gICAgcHVibGljIHNldChrZXk6SywgdmFsdWU6VCkge1xyXG4gICAgICAgIGlmKHRoaXMuQ29udGFpbihrZXkpKXtcclxuICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZShrZXksdmFsdWUpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzLnB1c2goa2V5LHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipnZXQgdmFsdWUgb2YgdGhlIGtleSovXHJcbiAgICBwdWJsaWMgZ2V0SXRlbUJ5S2V5KGtleTpLKTpUIHtcclxuICAgICAgICBsZXQgcmx0OlQgPSBudWxsO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpTGVuID0gdGhpcy5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRzW2ldLmtleSA9PSBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBybHQgPSB0aGlzLmVsZW1lbnRzW2ldLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfTtcclxuICAgIC8qKmdldCBhbGwga2V5cyBvZiB0aGUgZGljdGlvbmFyeSovXHJcbiAgICBwdWJsaWMga2V5cygpOkFycmF5PEs+IHtcclxuICAgICAgICB2YXIgYXJyOkFycmF5PEs+ID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlMZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xyXG4gICAgICAgICAgICBhcnIucHVzaCh0aGlzLmVsZW1lbnRzW2ldLmtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhcnI7XHJcbiAgICB9XHJcbiAgICAvKipnZXQgYWxsIHZhbHVlcyBvZiB0aGUgZGljdGlvbmFyeSovXHJcbiAgICBwdWJsaWMgdmFsdWVzKCk6QXJyYXk8VD4ge1xyXG4gICAgICAgIHZhciBhcnI6QXJyYXk8VD4gPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaUxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKHRoaXMuZWxlbWVudHNbaV0udmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG59IiwiIC8qKlxyXG4gKiBicmllZjpjb21tb24gZW51bXMgZGVmaW5kXHJcbiAqIEF1dGhvcjogd2VuenVvbGlcclxuICogRGF0ZTogMjAxOS8wNC8wMlxyXG4gKi9cclxuICAgIGV4cG9ydCAgZGVmYXVsdCBjbGFzcyBVc2VyQ29uZmlne1xyXG4gICAgLyoqXHJcbiAgICAgKiDnqIvluo/pnIDopoHov5DooYznmoTmqKHlvI9cclxuICAgICAqL1xyXG4gICAgIHB1YmxpYyBzdGF0aWMgUnVubmluZ01vZGU9e1xyXG4gICAgICAgIC8qKue9kemhteeJiCAqL1xyXG4gICAgICAgIHdlYjoxLFxyXG4gICAgICAgIC8qKuW+ruS/oeWwj+eoi+W6jyAqL1xyXG4gICAgICAgIG1pbmlQcm9ncmFtOjIsIFxyXG4gICAgICAgIC8qKuWuieWNk0FQUCAqL1xyXG4gICAgICAgIGFuZHJvaWRBcHA6MyxcclxuICAgICAgICAvKipJT1MgQVBQICovXHJcbiAgICAgICAgaW9zQXBwOjRcclxuICAgIH1cclxuICAgIC8qKmNvbm5lY3Rpb24gY29udHJvbCByb29tIElEICovXHJcbiAgICBzdGF0aWMgY29udHJvbFJvb21JZDpudW1iZXIgPSAwWDExMDQxMTA0O1xyXG4gICAgLyoqc3lzdGVtIGJhc2Ugcm9vbSBpZDpHQyBzZXJ2ZXIgKi9cclxuICAgIHN0YXRpYyBiYXNlUm9vbUlkOm51bWJlciA9IDE7XHJcbiAgICAvKiogcHJvZ3JhbSBydW5uaW5nIG1vZGU6d2ViL21pbmlwcm9ncmFtL2FuZHJvaWQgYXBwL2lvcyBhcHAgZS5nLiovXHJcbiAgICBzdGF0aWMgcnVubmluZ01vZGU6bnVtYmVyID0gVXNlckNvbmZpZy5SdW5uaW5nTW9kZS53ZWI7XHJcbiAgICAvKipnYW1lIHNlcnZlciBhZGRyZXNzOmRldiBzZXJ2ZXI6MTcyLjE3LjMuMTgwICovXHJcbiAgICBzdGF0aWMgc2VydmVyQWRkcmVzczpzdHJpbmcgPSBcIjE3Mi4xNy4xLjkxXCI7XHJcbiAgICAvKipnYW1lIHNlcnZlciBwb3J0O2RlZmF1bHQgcG9ydDo4MzAwICovXHJcbiAgICBzdGF0aWMgc2VydmVyUG9ydDpudW1iZXIgPSA3Nzc3O1xyXG4gICAgLy9DdXN0b20gZ2FtZSBjb25maWcgaW50byBoZXJlXHJcbiAgICAvKiplbmFibGUgbG9nIHByaW50ICovXHJcbiAgICBzdGF0aWMgZW5hYmxlRXZlbnRMb2c6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgLyoqZXZlbnQgbG9nIHN1Ym1pdCBwYXRoLiAqL1xyXG4gICAgc3RhdGljIGV2ZW50TG9nU3VibWl0VXJsOnN0cmluZyA9IFwiaHR0cDovL3N0YXQyLndlYi55eS5jb20vYy5naWZcIjtcclxuICAgIC8qKnJlc291cmNlIHVybCAqL1xyXG4gICAgc3RhdGljIFJlc291cmNlVXJsOnN0cmluZyA9XCJodHRwczovL3NtYWxsLmRvemVuZ2FtZS5jb20vXCI7XHJcbiAgICAvL2UuZy5cclxuICAgIC8vc3RhdGljIHJlc291cmNlVXJsOnN0cmluZyA9IFwiaHR0cDovL2dhbWUuZG96ZW5nYW1lLmNvbS9cIjtcclxuICAgIC8vQ3VzdG9tIGdhbWUgY29uZmlnIGVuZC5cclxuICAgICBcclxufVxyXG5leHBvcnQgZW51bSBMb2dnZXJMZXZlbHtcclxuICAgIEFMTD0wLFxyXG4gICAgVFJBQ0UsXHJcbiAgICBERUJVRyxcclxuICAgIElORk8sXHJcbiAgICBXQVJOLFxyXG4gICAgRVJST1IsXHJcbiAgICBGQVRBTCxcclxuICAgIE9GRlxyXG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzTGlzdCB7IFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcHJlbG9hZCByZXNcclxuICAgICAqL1xyXG4gICBwdWJsaWMgc3RhdGljIFByZWxvYWQ6YW55W10gPSBbXHJcbiAgICAgICAge3VybDpcInVpLmpzb25cIiwgdHlwZTpMYXlhLkxvYWRlci5KU09OfSxcclxuICAgICAgICB7dXJsOlwicmVzL2F0bGFzL2NvbXAuYXRsYXNcIn0sXHJcbiAgICAgICAge3VybDpcInJlcy9hdGxhcy90ZXN0LmF0bGFzXCJ9XHJcbiAgICBdO1xyXG5cclxufSIsIlxyXG5pbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7IFxyXG5pbXBvcnQgRGljdGlvbmFyeSBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9leHRlbmQvRGljdGlvbmFyeVwiO1xyXG4vKipcclxuICogQGRlc2NyaXB0aW9uIOS6i+S7tuebkeWQrOS4jua0vuWPkVxyXG4gKiBAYXV0aG9yIHdlbnp1b2xpXHJcbiAqIEBkYXRlOiAwNC8xOC8yMDE5XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudERpc3BhdGNoe1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLm1EaWMgPSBuZXcgRGljdGlvbmFyeTxudW1iZXIsRGljdGlvbmFyeTxhbnksRGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5Pj4+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtRGljOkRpY3Rpb25hcnk8bnVtYmVyLERpY3Rpb25hcnk8YW55LERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4+PiA9IG51bGw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDkvb/nlKggRXZlbnREaXNwYXRjaGVyIOWvueixoeazqOWGjOaMh+Wumuexu+Wei+eahOS6i+S7tuS+puWQrOWZqOWvueixoe+8jOS7peS9v+S+puWQrOWZqOiDveWkn+aOpeaUtuS6i+S7tumAmuefpeOAglxyXG4gICAgICogQHBhcmFtIHJvb21JZCDmnI3liqHlmahJRCDnlLHkvaDov57mjqXnmoTmuLjmiI/noa7lrppcclxuICAgICAqIEBwYXJhbSB0eXBlIOS6i+S7tuexu+WeiyDlpoIg4oCcQ0xJQ0vigJ0g5LmL57G7IOWPguiAgyBMYXlhLkV2ZW50LkNMSUNLXHJcbiAgICAgKiBAcGFyYW0gY2FsbGVyIOS6i+S7tuS+puWQrOWHveaVsOeahOaJp+ihjOWfn1xyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIOS6i+S7tuS+puWQrOWHveaVsFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgTGlzdGVuKHJvb21JZDpudW1iZXIsdHlwZTpzdHJpbmcsY2FsbGVyOmFueSxsaXN0ZW5lcjpGdW5jdGlvbik6dm9pZHtcclxuICAgICAgICBsZXQgX3Jvb206RGljdGlvbmFyeTxhbnksRGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5Pj4gPSB0aGlzLm1EaWMuZ2V0SXRlbUJ5S2V5KHJvb21JZCk7XHJcbiAgICAgICAgbGV0IF9pdGVtOkxpc3RlbkVudGl0eSA9IG5ldyBMaXN0ZW5FbnRpdHkocm9vbUlkLGNhbGxlcix0eXBlLGxpc3RlbmVyKTtcclxuXHJcbiAgICAgICAgaWYoX3Jvb20pe1xyXG4gICAgICAgICAgICBsZXQgX2NsOkRpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4gPSBfcm9vbS5nZXRJdGVtQnlLZXkoY2FsbGVyKTtcclxuICAgICAgICAgICAgaWYoX2NsKXtcclxuICAgICAgICAgICAgICAgIF9jbC5hZGQodHlwZSxfaXRlbSk7XHJcbiAgICAgICAgICAgIH1lbHNleyBcclxuICAgICAgICAgICAgICAgIF9jbCA9IG5ldyBEaWN0aW9uYXJ5PHN0cmluZyxMaXN0ZW5FbnRpdHk+KCk7XHJcbiAgICAgICAgICAgICAgICBfY2wuYWRkKHR5cGUsX2l0ZW0pO1xyXG4gICAgICAgICAgICAgICAgX3Jvb20uYWRkKGNhbGxlcixfY2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIF9yb29tID0gbmV3IERpY3Rpb25hcnk8YW55LERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4+KCk7XHJcbiAgICAgICAgICAgIGxldCBfY2w6RGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5PiA9bmV3IERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4oKTtcclxuICAgICAgICAgICAgX2NsLmFkZCh0eXBlLF9pdGVtKTtcclxuICAgICAgICAgICAgX3Jvb20uYWRkKHJvb21JZCxfY2wpO1xyXG4gICAgICAgICAgICB0aGlzLm1EaWMuYWRkKHJvb21JZCxfcm9vbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGR6YXBwLkxvZ2dlci5pbmZvKFwiQWRkIGxpc3RlbiBmb3I6XCIrcm9vbUlkK1wiOlwiK3R5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5rS+5Y+R5LqL5Lu2XHJcbiAgICAgKiBAcGFyYW0gcm9vbUlkIOacjeWKoeWZqElEIOeUseS9oOi/nuaOpeeahOa4uOaIj+ehruWumlxyXG4gICAgICogQHBhcmFtIHR5cGUg5LqL5Lu257G75Z6LIOWmgiDigJxDTElDS+KAnSDkuYvnsbsg5Y+C6ICDIExheWEuRXZlbnQuQ0xJQ0tcclxuICAgICAqIEBwYXJhbSBkYXRhIO+8iOWPr+mAie+8ieWbnuiwg+aVsOaNruOAgjxiPuazqOaEj++8mjwvYj7lpoLmnpzmmK/pnIDopoHkvKDpgJLlpJrkuKrlj4LmlbAgcDEscDIscDMsLi4u5Y+v5Lul5L2/55So5pWw57uE57uT5p6E5aaC77yaW3AxLHAyLHAzLC4uLl0g77yb5aaC5p6c6ZyA6KaB5Zue6LCD5Y2V5Liq5Y+C5pWwIHAg77yM5LiUIHAg5piv5LiA5Liq5pWw57uE77yM5YiZ6ZyA6KaB5L2/55So57uT5p6E5aaC77yaW3Bd77yM5YW25LuW55qE5Y2V5Liq5Y+C5pWwIHAg77yM5Y+v5Lul55u05o6l5Lyg5YWl5Y+C5pWwIHDjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIEV2ZW50KHJvb21JZDpudW1iZXIsdHlwZTpzdHJpbmcsZGF0YT86YW55KTp2b2lke1xyXG4gICAgICAgIGxldCBfcm9vbTpEaWN0aW9uYXJ5PGFueSxEaWN0aW9uYXJ5PHN0cmluZyxMaXN0ZW5FbnRpdHk+PiA9IHRoaXMubURpYy5nZXRJdGVtQnlLZXkocm9vbUlkKTtcclxuICAgICAgICBpZihfcm9vbSl7XHJcbiAgICAgICAgICAgIGxldCBfY2xzOkFycmF5PGFueT4gPSBfcm9vbS5rZXlzKCk7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8X2Nscy5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgICAgIGxldCBfY2w6RGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5PiA9IF9yb29tLmdldEl0ZW1CeUtleShfY2xzW2ldKTtcclxuICAgICAgICAgICAgICAgIGxldCBfbHN0Okxpc3RlbkVudGl0eSA9IF9jbC5nZXRJdGVtQnlLZXkodHlwZSk7XHJcbiAgICAgICAgICAgICAgICBpZihfbHN0KXtcclxuICAgICAgICAgICAgICAgICAgICBfbHN0Lkxpc3RlbmVyLnJ1bldpdGgoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBkemFwcC5Mb2dnZXIud2FybihcIk5ldHdvcmsgZXZlbnQgbm8gaGFuZGxlcjpcIityb29tSWQrXCI6XCIrdHlwZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZHphcHAuTG9nZ2VyLndhcm4oXCJOZXR3b3JrIGV2ZW50IG5vIGhhbmRsZXI6XCIrcm9vbUlkK1wiOlwiK3R5cGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS7jiBFdmVudERpc3BhdGNoZXIg5a+56LGh5Lit5Yig6Zmk5L6m5ZCs5Zmo44CCXHJcbiAgICAgKiBAcGFyYW0gcm9vbUlkIOimgeWIoOmZpOWTquS4quacjeWKoeWZqOeahOebkeWQrOWZqFxyXG4gICAgICogQHBhcmFtIHR5cGUg6KaB5Yig6Zmk55qE5LqL5Lu257G75Z6LXHJcbiAgICAgKiBAcGFyYW0gY2FsbGVyIOimgeWIoOmZpOeahOWHveaVsOeahOaJp+ihjOWfn1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2ZmKHJvb21JZDpudW1iZXIsdHlwZTpzdHJpbmcsY2FsbGVyOmFueSk6dm9pZHtcclxuICAgICAgICBsZXQgX3Jvb206RGljdGlvbmFyeTxhbnksRGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5Pj4gPSB0aGlzLm1EaWMuZ2V0SXRlbUJ5S2V5KHJvb21JZCk7XHJcbiAgICAgICAgaWYoX3Jvb20pe1xyXG4gICAgICAgICAgICBsZXQgX2NsOkRpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4gPSBfcm9vbS5nZXRJdGVtQnlLZXkoY2FsbGVyKTtcclxuICAgICAgICAgICAgaWYoX2NsKXtcclxuICAgICAgICAgICAgICAgIGxldCBfbHN0ID0gX2NsLmdldEl0ZW1CeUtleSh0eXBlKTtcclxuICAgICAgICAgICAgICAgIF9sc3QgJiYgX2NsLnJlbW92ZUJ5S2V5KHR5cGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5LqL5Lu257G75Yig6Zmk5LqL5Lu255uR5ZCsXHJcbiAgICAgKiBAcGFyYW0gdHlwZSDopoHliKDpmaTnmoTkuovku7bnsbvlnotcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9mZkFsbEJ5VHlwZSh0eXBlOnN0cmluZyk6dm9pZHtcclxuICAgICAgICBsZXQgX3JrZXlzOkFycmF5PG51bWJlcj4gPSB0aGlzLm1EaWMua2V5cygpO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7aTxfcmtleXMubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIGxldCBfY2xzOkRpY3Rpb25hcnk8YW55LERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4+ICA9IHRoaXMubURpYy5nZXRJdGVtQnlLZXkoX3JrZXlzW2ldKTtcclxuICAgICAgICAgICAgbGV0IF9jbHNrZXlzOkFycmF5PGFueT4gPSBfY2xzLmtleXMoKTtcclxuICAgICAgICAgICAgZm9yKGxldCBqPTA7ajxfY2xza2V5cy5sZW5ndGg7aisrKXtcclxuICAgICAgICAgICAgICAgIGxldCBfY2w6RGljdGlvbmFyeTxzdHJpbmcsTGlzdGVuRW50aXR5PiA9IF9jbHMuZ2V0SXRlbUJ5S2V5KF9jbHNrZXlzW2pdKTtcclxuICAgICAgICAgICAgICAgIGlmKF9jbC5Db250YWluKHR5cGUpKXtcclxuICAgICAgICAgICAgICAgICAgICBfY2wucmVtb3ZlQnlLZXkodHlwZSk7XHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5omn6KGM5Z+f5Yig6Zmk5omA5pyJ55uR5ZCsXHJcbiAgICAgKiBAcGFyYW0gY2FsbGVyIOaJp+ihjOWfn1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2ZmQWxsQnlDYWxsZXIoY2FsbGVyOmFueSk6dm9pZHtcclxuICAgICAgICBsZXQgX3JrZXlzOkFycmF5PG51bWJlcj4gPSB0aGlzLm1EaWMua2V5cygpO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7aTxfcmtleXMubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIGxldCBfY2xzOkRpY3Rpb25hcnk8YW55LERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4+ICA9IHRoaXMubURpYy5nZXRJdGVtQnlLZXkoX3JrZXlzW2ldKTtcclxuICAgICAgICAgICAgbGV0IF9jbDpEaWN0aW9uYXJ5PHN0cmluZyxMaXN0ZW5FbnRpdHk+ID0gX2Nscy5nZXRJdGVtQnlLZXkoY2FsbGVyKTtcclxuICAgICAgICAgICAgaWYoX2Nscy5Db250YWluKGNhbGxlcikpe1xyXG4gICAgICAgICAgICAgICAgX2Nscy5yZW1vdmVCeUtleShjYWxsZXIpO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIoOmZpOaJgOacieebkeWQrFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb2ZmQWxsKCk6dm9pZHtcclxuICAgICAgICAgdGhpcy5tRGljID0gbmV3IERpY3Rpb25hcnk8bnVtYmVyLERpY3Rpb25hcnk8YW55LERpY3Rpb25hcnk8c3RyaW5nLExpc3RlbkVudGl0eT4+PigpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBMaXN0ZW5FbnRpdHl7XHJcbiAgICBjb25zdHJ1Y3RvcihyaWQ6bnVtYmVyLGNhbGxlcjphbnksdHlwZTpzdHJpbmcsbGlzdGVuZXI6RnVuY3Rpb24pe1xyXG4gICAgICAgIHRoaXMubVJvb21JZCA9IHJpZDtcclxuICAgICAgICB0aGlzLm1DYWxsZXIgPSBjYWxsZXI7XHJcbiAgICAgICAgdGhpcy5tVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5tTGlzdGVuZXIgPSBMYXlhLkhhbmRsZXIuY3JlYXRlKGNhbGxlcixsaXN0ZW5lcixudWxsLGZhbHNlKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgbVJvb21JZDpudW1iZXIgPTA7XHJcbiAgICBwcml2YXRlIG1DYWxsZXI6YW55ID0gbnVsbDtcclxuICAgIHByaXZhdGUgbVR5cGU6c3RyaW5nID0gbnVsbDtcclxuICAgIHByaXZhdGUgbUxpc3RlbmVyOkxheWEuSGFuZGxlciA9IG51bGw7IFxyXG5cclxuICAgIHB1YmxpYyBnZXQgTGlzdGVuZXIoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5tTGlzdGVuZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBDYWxsZXIoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5tQ2FsbGVyO1xyXG4gICAgfVxyXG4gICAgICAgIFxyXG59XHJcbiIsImltcG9ydCB7IExvZ2dlckxldmVsIH0gZnJvbSBcIi4uLy4uL2NvbmZpZ3MvY3VzdG9tY2ZnL1VzZXJDb25maWdcIjtcclxuXHJcbi8qKlxyXG4gKiBAZGVzYyA6IGxvZyBoYW5kbGVyLlxyXG4gKiBAYXV0aG9yOiBXZW56dW9saVxyXG4gKiBARGF0ZTogMjAxOS8wNC8wOFxyXG4gKi8gXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvZ2dlcntcclxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipwcmludCBsb2cgbGV2ZWw6ZGVmYXVsdCBvbmx5IHByaW50IGVycm9yIGxvZyAqL1xyXG4gICAgICAgIHByaXZhdGUgX2xldmVsOkxvZ2dlckxldmVsID0gTG9nZ2VyTGV2ZWwuRVJST1I7XHJcbiAgICAgICAgLyoqc2V0dXAgdGhlIGxvZ2dlciBwcmludCBsZXZlbC4gKi9cclxuICAgICAgICBwdWJsaWMgc2V0IExldmVsKGxldmVsOkxvZ2dlckxldmVsKXtcclxuICAgICAgICAgICAgdGhpcy5fbGV2ZWwgPSBsZXZlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqcHJpbnQgZGVidWcgbG9nICovXHJcbiAgICAgICAgcHVibGljIGRlYnVnKC4uLmFyZ3M6YW55W10pOnZvaWR7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2coTG9nZ2VyTGV2ZWwuREVCVUcsYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKnByaW50IGluZm8gbG9nICovXHJcbiAgICAgICAgcHVibGljIGluZm8oLi4uYXJnczphbnlbXSk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy53cml0ZUxvZyhMb2dnZXJMZXZlbC5JTkZPLGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipwcmludCB3YXJuIGxvZzp3aWxsIGJlIGhpZ2hsaWdodGVkICovXHJcbiAgICAgICAgcHVibGljIHdhcm4oLi4uYXJnczphbnlbXSk6dm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2coTG9nZ2VyTGV2ZWwuV0FSTixhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqcHJpbnQgd2FybiBsb2c6d2lsbCBiZSBoaWdobGlnaHRlZCAqL1xyXG4gICAgICAgIHB1YmxpYyBlcnJvciguLi5hcmdzOmFueVtdKTp2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy53cml0ZUxvZyhMb2dnZXJMZXZlbC5FUlJPUixhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgIC8qKnByaW50IHdhcm4gbG9nOndpbGwgYmUgaGlnaGxpZ2h0ZWQgKi9cclxuICAgICAgICBwdWJsaWMgZmF0YWwoLi4uYXJnczphbnlbXSk6dm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2coTG9nZ2VyTGV2ZWwuRkFUQUwsYXJncyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHdyaXRlTG9nKGxldmVsOm51bWJlcixhcmdzOmFueVtdKTp2b2lke1xyXG4gICAgICAgICAgICBpZih0aGlzLl9sZXZlbD49bGV2ZWwpe1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoKGxldmVsKXtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIExvZ2dlckxldmVsLkVSUk9SOlxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTG9nZ2VyTGV2ZWwuV0FSTjpcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIExvZ2dlckxldmVsLkZBVEFMOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9jb25zb2xlW0RaR2FtZS5Vc2VyQ29uZmlnLkxvZ2dlckxldmVsW2xldmVsXS50b0xvd2VyQ2FzZSgpXSguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICB9IFxyXG4iLCJpbXBvcnQgV2ViU29ja2V0IGZyb20gXCIuL1dlYlNvY2tldFwiO1xyXG5pbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7XHJcbmltcG9ydCBVc2VyQ29uZmlnIGZyb20gXCIuLi8uLi9jb25maWdzL2N1c3RvbWNmZy9Vc2VyQ29uZmlnXCI7XHJcbi8qKlxyXG4gKiBicmllZjpOZXR3b3JrIGJ1c2luZXNzIGluc3RhbmNlXHJcbiAqIEF1dGhvcjogd2VuenVvbGlcclxuICogRGF0ZTogMjAxOS8wNC8wMlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTmV0d29ya01ncntcclxuICAgIC8qKnNvY2tldCBjb21tdW5pY2F0aW9uICovXHJcbiAgICBwcml2YXRlIG1XZWJzb2NrZXQ6V2ViU29ja2V0PW51bGw7XHJcbiAgICAvKipnYW1lIHNlcnZlciBkaXNjb25uZWN0IGNhbGxiYWNrICovXHJcbiAgICBwcml2YXRlIG1Jc0Rpc2Nvbm5lY3Q6Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAvKipnYW1lIHNlcnZlciBjb25uZWN0IGNhbGxiYWNrICovXHJcbiAgICBwcml2YXRlIG1PbkNvbm5lY3Rpbmc6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICAvKipnYW1lIHNlcnZlciBjb25uZWN0IGNhbGxiYWNrICovXHJcbiAgICBwcml2YXRlIG1PbkNvbm5lY3RlZDpMYXlhLkhhbmRsZXI9bnVsbDtcclxuICAgIC8qKmdhbWUgc2VydmVyIGNvbm5lY3QgZmFpbGVkIGNhbGxiYWNrICovXHJcbiAgICBwcml2YXRlIG1PbkNvbm5lY3RGYWlsZWQ6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICAvKipzZW5kIG1lc3NhZ2UgZmFpbGVkIGNhbGxiYWNrLiAqL1xyXG4gICAgcHJpdmF0ZSBtT25TZW5kTXNnRmFpbGVkOkxheWEuSGFuZGxlciA9IG51bGw7XHJcbiAgICAvKip0aGUgdGVtcCBtZXNzYWdlIGJ1ZmZlciAgKi9cclxuICAgIHByaXZhdGUgbU9ialNwbGl0TXNnOm9iamVjdCA9IHt9O1xyXG4gICAgLyoqbWVzc2FnZSBwYWNrYWdlIG1vZHVsZSAqL1xyXG4gICAgcHJpdmF0ZSBtTXNnUGFja2FnZTphbnkgPSBudWxsO1xyXG4gXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBuZXR3b3JrIGhhbmRsZXIgbW9kdWxlOnNlbmQgbWVzc2FnZSBlLmcuXHJcbiAgICAgKiBAcGFyYW0gb25Db25uZWN0ZWQgY29ubmVjdCBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvbkNvbm5lY3RlZDpMYXlhLkhhbmRsZXIsb25Db25uZWN0RmFpbGVkOkxheWEuSGFuZGxlcixvblNlbmRNc2dGYWlsZWQ/OkxheWEuSGFuZGxlcil7XHJcbiAgICAgICAgLy90b2RvOndlbnp1b2xpIG1vZGlmeSB0byB1c2UgaW1wb3J0IHRvIGF0dGFjaC5cclxuICAgICAgICB0aGlzLm1Nc2dQYWNrYWdlID0gTGF5YS5Ccm93c2VyLndpbmRvdy5tc2dwYWNrNSgpO1xyXG4gICAgICAgIHRoaXMubU9uQ29ubmVjdGVkID0gb25Db25uZWN0ZWQ7XHJcbiAgICAgICAgdGhpcy5tT25Db25uZWN0RmFpbGVkID0gb25Db25uZWN0RmFpbGVkO1xyXG4gICAgICAgIGxldCBfc3RhcnRDb25uZWN0aW5nOkxheWEuSGFuZGxlciA9IExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLnN0YXJ0Q29ubmVjdGluZyk7XHJcbiAgICAgICAgbGV0IF9hZnRlckNvbm5lY3Q6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMuYWZ0ZXJDb25uZWN0ZWQpO1xyXG4gICAgICAgIGxldCBfYWZ0ZXJDb25uZWN0RmFpbGVkOkxheWEuSGFuZGxlciA9IExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLmFmdGVyQ29ubmVjdEZhaWxlZCk7XHJcbiAgICAgICAgbGV0IF9hZnRlckRpc2Nvbm5lY3Q6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMuYWZ0ZXJEaXNjb25uZWN0ZWQpO1xyXG4gICAgICAgIGxldCBfYWZ0ZXJNc2c6TGF5YS5IYW5kbGVyID0gTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMucmVjZWl2ZWRNc2csbnVsbCxmYWxzZSk7XHJcbiAgICAgICAgb25TZW5kTXNnRmFpbGVkICYmICh0aGlzLm1PblNlbmRNc2dGYWlsZWQgPSBvblNlbmRNc2dGYWlsZWQpO1xyXG4gICAgICAgIHRoaXMubVdlYnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoX3N0YXJ0Q29ubmVjdGluZyxfYWZ0ZXJDb25uZWN0LF9hZnRlckNvbm5lY3RGYWlsZWQsX2FmdGVyRGlzY29ubmVjdCxfYWZ0ZXJNc2cpO1xyXG4gICAgICAgIHRoaXMubVdlYnNvY2tldC5BdXRvUmVjb25uZWN0PXRydWU7XHJcbiAgICAgICAgdGhpcy5tV2Vic29ja2V0LmNvbm5lY3QoVXNlckNvbmZpZy5zZXJ2ZXJBZGRyZXNzLFVzZXJDb25maWcuc2VydmVyUG9ydCk7XHJcbiAgICB9XHJcbiAgICAgLyoqc3RhcnQgY29ubmVjdGluZyB0byBnYW1lIHNlcnZlciAqL1xyXG4gICAgIHByaXZhdGUgc3RhcnRDb25uZWN0aW5nKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5zaG93TG9hZGluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKmFmdGVyIGNvbm5lY3RlZCB0byBnYW1lIHNlcnZlciAqL1xyXG4gICAgcHJpdmF0ZSBhZnRlckNvbm5lY3RlZCgpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5tSXNEaXNjb25uZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgZHphcHAuaGlkZUxvYWRpbmcoKTtcclxuICAgICAgICBpZih0aGlzLm1PbkNvbm5lY3RlZCl7XHJcbiAgICAgICAgICAgIHRoaXMubU9uQ29ubmVjdGVkLnJ1bigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKmFmdGVyIGNvbm5lY3RlZCB0byBnYW1lIHNlcnZlciBmYWlsZWQgY2FsbGJhY2sgKi9cclxuICAgIHByaXZhdGUgYWZ0ZXJDb25uZWN0RmFpbGVkKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5oaWRlTG9hZGluZygpO1xyXG4gICAgICAgIGlmKHRoaXMubU9uQ29ubmVjdEZhaWxlZCl7XHJcbiAgICAgICAgICAgIHRoaXMubU9uQ29ubmVjdEZhaWxlZC5ydW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiphZnRlciBnYW1lIHNlcnZlciBkaXNjb25uZWN0ICovXHJcbiAgICBwcml2YXRlIGFmdGVyRGlzY29ubmVjdGVkKCk6dm9pZHtcclxuICAgICAgICBpZighdGhpcy5tSXNEaXNjb25uZWN0KXtcclxuICAgICAgICAgICAgdGhpcy5tSXNEaXNjb25uZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZHphcHAuc2hvd1RvYXN0KFwi572R57uc5pat5byAXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogYWZ0ZXIgcmVjZWl2ZWQgbWVzc2FnZSBjYWxsYmFjay4gXHJcbiAgICAgKiBAcGFyYW0gZGF0YSByZWNlaXZlZCBkYXRhIGZyb20gd2Vic29ja2V0IG1vZHVsZVtldmVudG5hbWU6c3RyaW5nLGRhdGE6Ynl0ZV1cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZWNlaXZlZE1zZyhkYXRhKTp2b2lke1xyXG4gICAgICAgIC8vcHJlZml4IG1lYW4gdGhpcyBtZXNzYWdlIHJlY2VpdmVkIGZyb20gd2l0Y2ggZ2FtZSBzZXJ2ZXIuXHJcbiAgICAgICAgbGV0IF9wcmVmaXg6c3RyaW5nID0gZGF0YVswXTtcclxuICAgICAgICBsZXQgX21zZzphbnkgPWRhdGE7XHJcblxyXG4gICAgICAgIGxldCBldmVudE5hbWU6c3RyaW5nID0gXCJcIjtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGxldCBieXRlID0gbmV3IExheWEuQnl0ZShfbXNnKTtcclxuICAgICAgICAgICAgbGV0IF9yb29tSWQ6bnVtYmVyID0gYnl0ZS5nZXRJbnQzMigpO1xyXG4gICAgICAgICAgICBldmVudE5hbWUgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICBpZihfcm9vbUlkPT0wWDExMDQxMTA0KXsvLyBnYyBjb25uZWN0ICYgZ3MgY29ubmVjdCBzdWNjZXNzZnVsbHkuXHJcbiAgICAgICAgICAgICAgICBkemFwcC5Mb2dnZXIuaW5mbyhcImNvbm5lY3QgZ2MvZ3Mgc3VjY2Vzc2Z1bGx5Li5cIik7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG8gaWYgbmVlZC4gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYodGhpcy5pc0tpY2tPZmYoZXZlbnROYW1lKSl7XHJcbiAgICAgICAgICAgICAgICAvL1RPRE86d2VuenVvbGlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaChldmVudE5hbWUpe1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIllPVUtJQ0tcIjpcclxuICAgICAgICAgICAgICAgICAgICAvL1RPRE86d2VuenVvbGlcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIk1TR1BBQ0xfUFJPVE9DT0xcIjpcclxuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWUgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtcFNpemUgPSBieXRlLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1wQXJyQnl0ZTogVWludDhBcnJheSA9IGJ5dGUuZ2V0VWludDhBcnJheShieXRlLnBvcywgbXBTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1zZ1BhY2thZ2VEaXNwYXRjaChfcm9vbUlkLGV2ZW50TmFtZSxtcEFyckJ5dGUpOyBcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIk1TR1BBQ0xfUFJPVE9DT0xfU1BMSVRfU1RBUlRcIjpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY21kID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1PYmpTcGxpdE1zZ1tjbWRdID0gbmV3IExheWEuQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiTVNHUEFDTF9QUk9UT0NPTF9TUExJVFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjbWQgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzaXplID0gYnl0ZS5nZXRJbnQzMigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzcGxpdEJ5dGUgPSB0aGlzLm1PYmpTcGxpdE1zZ1tjbWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwbGl0Qnl0ZS53cml0ZUFycmF5QnVmZmVyKGJ5dGUuYnVmZmVyLCBieXRlLnBvcywgc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJNU0dQQUNMX1BST1RPQ09MX1NQTElUX0VORFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjbWQgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzcGxpdEJ5dGUgPSB0aGlzLm1PYmpTcGxpdE1zZ1tjbWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtcEFyckJ5dGU6IFVpbnQ4QXJyYXkgPSBzcGxpdEJ5dGUuZ2V0VWludDhBcnJheSgwLCBzcGxpdEJ5dGUubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmdzT25Nc2dQYWNrTXNnKGNtZCwgbXBBcnJCeXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1zZ1BhY2thZ2VEaXNwYXRjaChfcm9vbUlkLGNtZCxtcEFyckJ5dGUpOyBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1PYmpTcGxpdE1zZ1tjbWRdID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvL2V2ZW50IG5hbWUgbmVlZCBhZGQgdGhlIGxvY2FsIHByb3RvY29sIHByZWZpeC5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vcm1hbE1zZ0Rpc3BhdGNoKF9yb29tSWQsZXZlbnROYW1lLGJ5dGUpOyBcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICBcclxuICAgICAgICAgICAgYnl0ZS5jbGVhcigpO1xyXG4gICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgZHphcHAuTG9nZ2VyLmVycm9yKGUubWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWVzc2FnZSBwYWNrYWdlIGRpc3BhdGNoXHJcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIGV2ZW50IG5hbWVcclxuICAgICAqIEBwYXJhbSBtcEJ5dGUgcmVjZWl2ZWQgYnVmZmVyXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgbXNnUGFja2FnZURpc3BhdGNoKHJvb21JZDpudW1iZXIsZXZlbnROYW1lOnN0cmluZyxtcEJ5dGU6VWludDhBcnJheSk6dm9pZHtcclxuICAgICAgICBsZXQgZGF0YSA9IHRoaXMubU1zZ1BhY2thZ2UuZGVjb2RlKG1wQnl0ZSk7ICBcclxuICAgICAgICB0aGlzLm5vcm1hbE1zZ0Rpc3BhdGNoKHJvb21JZCxldmVudE5hbWUsZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBub3JtYWwgbWVzc2FnZSBkaXNwYXRjaChieXRlKVxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBldmVudCBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBuZWVkIGRpc3BhdGNoIGRhdGEoYnl0ZSlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBub3JtYWxNc2dEaXNwYXRjaChyb29tSWQ6bnVtYmVyLGV2ZW50TmFtZTpzdHJpbmcsZGF0YTphbnkpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuTG9nZ2VyLmluZm8oXCJyZWNlaXZlZCBtZXNzYWdlOlwiK2V2ZW50TmFtZSk7XHJcbiAgICAgICAgZHphcHAuRXZlbnRzLkV2ZW50KHJvb21JZCxldmVudE5hbWUsZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kIG1lc3NhZ2UgcGFja2FnZS5cclxuICAgICAqIEBwYXJhbSBjb21tYW5kIHByb3RvY29sIGV2ZW50IG5hbWVcclxuICAgICAqIEBwYXJhbSBhcmdzIG90aGVyIHBhcmFtZXRlcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNlbmRNc2dQYWNrYWdlKHJvb21JZDpudW1iZXIsY29tbWFuZDpzdHJpbmcsLi4uYXJnczphbnlbXSl7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLm1Nc2dQYWNrYWdlLmVuY29kZShhcmdzKTtcclxuICAgICAgICAgICAgdmFyIGJ5dGU6TGF5YS5CeXRlID0gbmV3IExheWEuQnl0ZSgpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlSW50MzIocm9vbUlkKTtcclxuICAgICAgICAgICAgYnl0ZS53cml0ZVVURlN0cmluZyhcIk1TR1BBQ0xfUFJPVE9DT0xcIik7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcoY29tbWFuZCk7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVJbnQzMihkYXRhLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVBcnJheUJ1ZmZlcihkYXRhLDApOyBcclxuICAgICAgICAgICAgLy8gZm9yKGxldCBpID0gMDsgaTwgZGF0YS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIC8vICAgICBieXRlLndyaXRlQnl0ZShkYXRhW2ldKTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKGJ5dGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VuZCBub3JtYWwgbWVzc2FnZS5cclxuICAgICAqIEBwYXJhbSBieXRlIHNlbmQgYnVmZmVyXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2VuZE1lc3NhZ2UoYnl0ZTpMYXlhLkJ5dGUpOnZvaWR7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBpZihudWxsICE9IHRoaXMubVdlYnNvY2tldCl7XHJcbiAgICAgICAgICAgICAgICAvLyBpZih0aW1lb3V0PjApe1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIHRoaXMub25UdXJub25EZWxheSh0aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIC8vIH0gXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRTb2NrZXRNc2coYnl0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIGR6YXBwLkxvZ2dlci5lcnJvcihlLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoZWNrIGlzIGtpY2tvZmYgYnkgc2VydmVyXHJcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIGV2ZW50IG5hbWVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBpc0tpY2tPZmYoZXZlbnROYW1lOnN0cmluZyk6Ym9vbGVhbntcclxuICAgICAgICByZXR1cm4gZXZlbnROYW1lLmluZGV4T2YoXCJZT1VLSUNLXCIpPi0xO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlbnRlclJvb20oZXZlbnROYW1lOnN0cmluZyxnYW1lVHlwZTpzdHJpbmcscm9vbUlkOm51bWJlcil7XHJcbiAgICAgICAgLy8weDExMDQxMTA0LCBcInF1ZXJ5XCIsIFwiZGR6X2ZyZWVcIlxyXG4gICAgICAgIHZhciBieXRlOkxheWEuQnl0ZSA9IG5ldyBMYXlhLkJ5dGUoKTtcclxuICAgICAgICBieXRlLndyaXRlSW50MzIoMFgxMTA0MTEwNCk7XHJcbiAgICAgICAgYnl0ZS53cml0ZVVURlN0cmluZyhldmVudE5hbWUpO1xyXG4gICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcoZ2FtZVR5cGUpO1xyXG4gICAgICAgIGJ5dGUud3JpdGVJbnQzMihyb29tSWQpO1xyXG4gICAgICAgIHRoaXMuc2VuZFNvY2tldE1zZyhieXRlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBldmVudCBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZ2FtZVR5cGUgZ2FtZSB0eXBlIDpkZHpfZnJlZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZW50ZXJHYW1lKGV2ZW50TmFtZTpzdHJpbmcsZ2FtZVR5cGU6c3RyaW5nKXtcclxuICAgICAgICAvLzB4MTEwNDExMDQsIFwicXVlcnlcIiwgXCJkZHpfZnJlZVwiXHJcbiAgICAgICAgdmFyIGJ5dGU6TGF5YS5CeXRlID0gbmV3IExheWEuQnl0ZSgpO1xyXG4gICAgICAgIGJ5dGUud3JpdGVJbnQzMigwWDExMDQxMTA0KTtcclxuICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKGV2ZW50TmFtZSk7XHJcbiAgICAgICAgYnl0ZS53cml0ZVVURlN0cmluZyhnYW1lVHlwZSk7XHJcbiAgICAgICAgdGhpcy5zZW5kU29ja2V0TXNnKGJ5dGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VuZCBtZXNzYWdlXHJcbiAgICAgKiBAcGFyYW0gcm9vbUlkIHJvb21pZFxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBldmVudCBuYW1lXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBkYXRhXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZW5kTXNnKHJvb21JZDpudW1iZXIsZXZlbnROYW1lOnN0cmluZyxkYXRhOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICB2YXIgYnl0ZTpMYXlhLkJ5dGUgPSBuZXcgTGF5YS5CeXRlKCk7XHJcbiAgICAgICAgYnl0ZS53cml0ZUludDMyKHJvb21JZCk7IFxyXG4gICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcoZXZlbnROYW1lKTtcclxuICAgICAgICBieXRlLndyaXRlQXJyYXlCdWZmZXIoZGF0YSwwKTtcclxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKGJ5dGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbG9naW4gdG8gZ2NcclxuICAgICAqIEBwYXJhbSBhY2MgYWNjb3VudFxyXG4gICAgICogQHBhcmFtIHB3ZCBwd2RcclxuICAgICAqIEBwYXJhbSBzaXRlIGRlZmF1bHQgMFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9naW5Ub0dDKGFjYzpzdHJpbmcscHdkOnN0cmluZyxzaXRlOm51bWJlcj0wKTp2b2lke1xyXG4gICAgICAgIGlmICh0eXBlb2YgYWNjICE9PSBcInN0cmluZ1wiKSB7IGFjYyA9IFwiXCI7IH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwd2QgIT09IFwic3RyaW5nXCIpIHsgcHdkID0gXCJcIjsgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNpdGUgIT09IFwibnVtYmVyXCIpIHsgc2l0ZSA9IDA7IH1cclxuXHJcbiAgICAgICAgICAgIGlmICgwID49IGFjYy5sZW5ndGgpIHsgYWNjID0gXCIxMTlcIjsgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGJ5dGU6TGF5YS5CeXRlID0gbmV3IExheWEuQnl0ZSgpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlSW50MzIoMSk7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcoXCJSUUxHXCIpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKGFjYyk7XHJcbiAgICAgICAgICAgIGJ5dGUud3JpdGVVVEZTdHJpbmcocHdkKTtcclxuICAgICAgICAgICAgYnl0ZS53cml0ZUludDMyKHNpdGUpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKFwiXCIpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKFwiXCIpO1xyXG4gICAgICAgICAgICBieXRlLndyaXRlVVRGU3RyaW5nKFwiXCIpO1xyXG4gICAgICAgICAgICAvL3RoaXMubVdlYnNvY2tldC5zZW5kTXNnKGJ5dGUpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmRTb2NrZXRNc2coYnl0ZSk7XHJcbiAgICB9IFxyXG5cclxuICAgIC8qKnNlbmQgbWVzc2FnZSB0byBzZXJ2ZXIgKi9cclxuICAgIHByaXZhdGUgc2VuZFNvY2tldE1zZyhieXRlOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICBpZih0aGlzLm1XZWJzb2NrZXQgJiYgdGhpcy5tV2Vic29ja2V0LmNvbm5lY3RlZCl7XHJcbiAgICAgICAgICAgIHRoaXMubVdlYnNvY2tldC5zZW5kTXNnKGJ5dGUpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLm1PblNlbmRNc2dGYWlsZWQmJnRoaXMubU9uU2VuZE1zZ0ZhaWxlZC5ydW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7XHJcblxyXG5cclxuLyoqXHJcbiAqIGJyaWVmOkJhc2UgU29ja2V0IG1vZHVsZVxyXG4gKiBBdXRob3I6IHdlbnp1b2xpXHJcbiAqIERhdGU6IDIwMTkvMDQvMDJcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlYlNvY2tldCBleHRlbmRzIExheWEuU29ja2V0IHtcclxuICAgIC8vbWVzc2FnZSBkaXN0cmlidXRpb25cclxuICAgIHByaXZhdGUgX29uRXZlbnQ6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICAvKipvbiBzZXJ2ZXIgY29ubmVjdGluZy4gKi9cclxuICAgIHByaXZhdGUgX29uQ29ubmVjdGluZzpMYXlhLkhhbmRsZXI9bnVsbDtcclxuICAgIC8qKm9uIHNlcnZlciBjb25uZWN0IHN1Y2Nlc3NmdWxseS4gKi9cclxuICAgIHByaXZhdGUgX29uQ29ubmVjdGVkOkxheWEuSGFuZGxlcj1udWxsO1xyXG4gICAgLyoqb24gY29ubmVjdCB0byBzZXJ2ZXIgZmFpbGVkLiAqL1xyXG4gICAgcHJpdmF0ZSBfb25Db25uZWN0RmFpbGVkOkxheWEuSGFuZGxlcj1udWxsO1xyXG4gICAgLy9vbiBzZXJ2ZXIgZGlzY29ubmVjdFxyXG4gICAgcHJpdmF0ZSBfb25EaXNDb25uZWN0ZWQ6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICAvL2lmIGF1dG8gcmVjb25uZWN0XHJcbiAgICBwcml2YXRlIF9hdXRvUmVjb25uZWN0OmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgLy8gY29ubmVjdGlvbiBhZGRyZXNzICAgICAgICAgICAgXHJcbiAgICBwdWJsaWMgbUFkZHJlc3M6c3RyaW5nID0gXCIxMjcuMC4wLjFcIjsgICAgXHJcbiAgICAvLyBjb25uZWN0IHBvcnQuICAgICAgICAgICAgXHJcbiAgICBwdWJsaWMgbVBvcnQ6bnVtYmVyID0gNDQzOyAgICAgXHJcbiAgICAvL3JldHJ5IGVhY2ggMiBzZWNvbmRzLlxyXG4gICAgcHJpdmF0ZSBtUmVjb25uZWN0VGltZW91dDpudW1iZXI9MTAwMCoyOyBcclxuICAgIC8vbWF4IHJldHJ5IHRpbWUgd2hlbiBjb25uZWN0IGZhaWxlZC4gLTEgbm90IGxpbWl0LlxyXG4gICAgcHJpdmF0ZSBfUmVjb25uZWN0VGltZTpudW1iZXI9MzsgICAgICAgXHJcbiAgICAvKipkaXNjb25uZWN0IHR5IGdhbWUgc2VydmVyKi9cclxuICAgIHByaXZhdGUgbVNlcnZlcktpY2tlZDpib29sZWFuID0gZmFsc2U7IFxyXG4gICAgLyoqZGlzY29ubmVjdCB0aW1lICovXHJcbiAgICBwcml2YXRlIG1LaWNrZWRUaW1lOkRhdGU7XHJcbiAgICAvKipjdXJyZW50IGlzIHJlY29ubmVjdO+8mm5vdCBmaXJzdCB0aW1lIHRvIGNvbm5lY3QgdG8gZ2FtZSBzZXJ2ZXIgKi9cclxuICAgIHByaXZhdGUgbUlzUmVjb25uZWN0OmJvb2xlYW49ZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3ZWIgc29ja2V0IGVudHJ5LlxyXG4gICAgICogQHBhcmFtIG9uQ29ubmVjdGluZyBzdGFydCByZWNvbm5lY3RpbmcgY2FsbGJhY2tcclxuICAgICAqIEBwYXJhbSBvbkNvbm5lY3RlZCBvbiBjb25uZWN0ZWQgc3VjY2Vzc2Z1bGx5LlxyXG4gICAgICogQHBhcmFtIG9uRGlzY29ubmVjdGVkIG9uIGdhbWUgc2VydmVyIGRpc2Nvbm5lY3QuXHJcbiAgICAgKiBAcGFyYW0gb25SZWNNc2cgb24gcmVjZWl2ZWQgbmV3IG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9uQ29ubmVjdGluZzpMYXlhLkhhbmRsZXIsb25Db25uZWN0ZWQ6TGF5YS5IYW5kbGVyLG9uQ29ubmVjdEZhaWxlZDpMYXlhLkhhbmRsZXIsb25EaXNjb25uZWN0ZWQ6TGF5YS5IYW5kbGVyLG9uUmVjTXNnOkxheWEuSGFuZGxlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5lbmRpYW4gPSBMYXlhLkJ5dGUuTElUVExFX0VORElBTjsgXHJcblxyXG4gICAgICAgIHRoaXMub24oTGF5YS5FdmVudC5PUEVOLCB0aGlzLCB0aGlzLm9uT3BlbkhhbmRsZXIpO1xyXG4gICAgICAgIHRoaXMub24oTGF5YS5FdmVudC5DTE9TRSwgdGhpcywgdGhpcy5vbkNsb3NlSGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5vbihMYXlhLkV2ZW50Lk1FU1NBR0UsIHRoaXMsIHRoaXMub25SZWN2SGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5vbihMYXlhLkV2ZW50LkVSUk9SLCB0aGlzLCB0aGlzLm9uRXJyb3JIYW5kbGVyKTsgXHJcblxyXG4gICAgICAgIHRoaXMuX29uQ29ubmVjdGluZyA9IG9uQ29ubmVjdGluZztcclxuICAgICAgICB0aGlzLl9vbkNvbm5lY3RlZCA9IG9uQ29ubmVjdGVkO1xyXG4gICAgICAgIHRoaXMuX29uQ29ubmVjdEZhaWxlZCA9IG9uQ29ubmVjdEZhaWxlZDtcclxuICAgICAgICB0aGlzLl9vbkRpc0Nvbm5lY3RlZCA9IG9uRGlzY29ubmVjdGVkO1xyXG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBvblJlY01zZztcclxuICAgIH1cclxuIFxyXG4gICAgLyoqc2V0IGF1dG8gcmVjb25uZWN0IHN0YXR1cy4gKi9cclxuICAgIHB1YmxpYyBzZXQgQXV0b1JlY29ubmVjdChhdXRvUmVjb25uZWN0OmJvb2xlYW4pe1xyXG4gICAgICAgIHRoaXMuX2F1dG9SZWNvbm5lY3QgPSBhdXRvUmVjb25uZWN0O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvbm5lY3QgdG8gc2VydmVyXHJcbiAgICAgKiBAcGFyYW0gaXAgY29ubmVjdCBhZGRyZXNzOiBzdXBwb3J0IGlwL1xyXG4gICAgICogQHBhcmFtIHBvcnQgcG9ydFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY29ubmVjdChhZGRyZXNzOnN0cmluZywgcG9ydDpudW1iZXIpOnZvaWQge1xyXG4gICAgICAgIHRoaXMubUFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgICAgIHRoaXMubVBvcnQgPSBwb3J0O1xyXG4gICAgICAgIGlmKGFkZHJlc3MuaW5kZXhPZihcIndzczovL1wiKT4tMXx8YWRkcmVzcy5pbmRleE9mKFwid3M6Ly9cIik+LTEpe1xyXG4gICAgICAgICAgICBsZXQgdXJsOnN0cmluZyA9IGFkZHJlc3MgKyBcIjpcIiArIHBvcnQ7XHJcbiAgICAgICAgICAgIHN1cGVyLmNvbm5lY3RCeVVybCh1cmwpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBzdXBlci5jb25uZWN0KHRoaXMubUFkZHJlc3MsdGhpcy5tUG9ydCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VuZCBidWZmZXJcclxuICAgICAqIEBwYXJhbSBieXRlIGJ5dGUgYnVmZmVyXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZW5kTXNnKGJ5dGU6TGF5YS5CeXRlKTp2b2lkIHtcclxuICAgICAgICBieXRlLmVuZGlhbiA9IExheWEuQnl0ZS5MSVRUTEVfRU5ESUFOO1xyXG4gICAgICAgIHRoaXMuc2VuZChieXRlLmJ1ZmZlcik7XHJcbiAgICAgICAgYnl0ZS5jbGVhcigpO1xyXG4gICAgfSBcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmjqXmlLbmlbDmja5cclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIOe9kee7nOaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIG9uUmVjdkhhbmRsZXIobWVzc2FnZTphbnkpOnZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2UgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcclxuICAgICAgICAgICAgICAgIGxldCBlcnI6c3RyaW5nID1cIlNvY2tldCBlcnJvcjogTWVzc2FnZSB0eXBlIGlzIG5vdCBhIHN0YW5kYXJkIGFycmF5YnVmZmVyXCI7XHJcbiAgICAgICAgICAgICAgICBkemFwcC5Mb2dnZXIuZXJyb3IoZXJyKTsgXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodGhpcy5fb25FdmVudCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50LnJ1bldpdGgobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBkemFwcC5Mb2dnZXIuZXJyb3IoXCJTb2NrZXQgZXJyb3I6IHJlYWQgYnVmZmVyIGV4Y2VwdGlvbi5cIiwgZXJyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb25uZWN0IHN1Y2Nlc3NmdWxseS5cclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHJlY2VpdmVkIG1lc3NhZ2UgZGF0YS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBvbk9wZW5IYW5kbGVyKG1lc3NhZ2U6YW55KTp2b2lkIHtcclxuICAgICAgICAvL2NsZWFyIHRoZSByZWNvbm5lY3QgdGltZXJcclxuICAgICAgICBMYXlhLnRpbWVyLmNsZWFyKHRoaXMsdGhpcy5yZWNvbm5lY3QpO1xyXG4gICAgICAgIC8vcmVzZXQgdGhlIHJldHJ5IHRpbWVcclxuICAgICAgICB0aGlzLl9SZWNvbm5lY3RUaW1lID0gMzsgXHJcbiAgICAgICAgLy9wcmludCBjb25uZWN0ZWQgbG9nLlxyXG4gICAgICAgIHRoaXMucHJpbnRMb2coXCIpOkNvbm5lY3Rpb24gc2VydmVyIHN1Y2Nlc3NmdWxcIik7IFxyXG5cclxuICAgICAgICAvL2Nvbm5lY3RlZCBjYWxsYmFjay5cclxuICAgICAgICBpZih0aGlzLm1Jc1JlY29ubmVjdCYmdGhpcy5fb25Db25uZWN0ZWQpe1xyXG4gICAgICAgICAgICB0aGlzLm1Jc1JlY29ubmVjdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9vbkNvbm5lY3RlZC5ydW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb25uZWN0aW9uIHdhcyBpbnRlcnJ1cHRlZCBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBvbkNsb3NlSGFuZGxlcigpOnZvaWQge1xyXG4gICAgICAgIGlmKHRoaXMuX2F1dG9SZWNvbm5lY3Qpe1xyXG4gICAgICAgICAgICBpZih0aGlzLl9SZWNvbm5lY3RUaW1lPjB8fHRoaXMuX1JlY29ubmVjdFRpbWU9PS0xKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubUlzUmVjb25uZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubVJlY29ubmVjdFRpbWVvdXQ9dGhpcy5yZXNldFJlY29uZWN0VGltZSgpO1xyXG4gICAgICAgICAgICAgICAgLy9kZWxheSByZXRyeS5cclxuICAgICAgICAgICAgICAgIExheWEudGltZXIub25jZSh0aGlzLm1SZWNvbm5lY3RUaW1lb3V0LHRoaXMsdGhpcy5yZWNvbm5lY3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVjb25uZWN0IHRpbWVvdXQgcmVzZXQgbG9naW4gaGVyZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZXNldFJlY29uZWN0VGltZSgpOm51bWJlcntcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubVJlY29ubmVjdFRpbWVvdXQqMTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGN1cnJlbnQgaXMga2ljayB0aW1lXHJcbiAgICAgKiBAcGFyYW0gZGF0ZTEgXHJcbiAgICAgKiBAcGFyYW0gZGF0ZTIgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaXNLaWNrVGltZShkYXRlMTpEYXRlLGRhdGUyOkRhdGUpOmJvb2xlYW57XHJcbiAgICAgICAgbGV0IG4xOm51bWJlciA9IGRhdGUxLmdldFRpbWUoKTtcclxuICAgICAgICBsZXQgbjI6bnVtYmVyID0gZGF0ZTIuZ2V0VGltZSgpO1xyXG4gICAgICAgIHJldHVybiAoKG4yLW4xKS8xMDAwLzYwKTw1O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY29ubmVjdCBmYWlsZWQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgb25FcnJvckhhbmRsZXIoKTp2b2lkIHtcclxuICAgICAgICBpZih0aGlzLl9vbkNvbm5lY3RGYWlsZWQpe1xyXG4gICAgICAgICAgICB0aGlzLl9vbkNvbm5lY3RGYWlsZWQucnVuKCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIC8vcHJpbnQgZmFpbGVkIGxvZ1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TG9nKFwiQ29ubmVjdGlvbiBzZXJ2ZXIgZmFpbGVkXCIpOyBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWNvbm5lY3QgdG8gZ2FtZSBzZXJ2ZXIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZWNvbm5lY3QoKTp2b2lkeyBcclxuICAgICAgICBpZih0aGlzLmNvbm5lY3RlZCl7XHJcbiAgICAgICAgICAgIHRoaXMucHJpbnRMb2coXCJEaXNjb3ZlcmluZyB0aGF0IHRoZSBzb2NrZXQgaXMgY29ubmVjdGVkIHdoZW4gdHJ5aW5nIHRvIHJlY29ubmVjdC4gc3lzdGVtIHdpbGwgY2xvc2UgaXQgZmlyc3QuXCIpO1xyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJpbnRMb2coXCJBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBjbG9zaW5nIHRoZSBjb25uZWN0aW9uLlwiKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuX1JlY29ubmVjdFRpbWU+MCl7XHJcbiAgICAgICAgICAgIHRoaXMuX1JlY29ubmVjdFRpbWUtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcmludExvZyhcInRyeSB0byByZWNvbm5lY3QuLi5cIik7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0KHRoaXMubUFkZHJlc3MsdGhpcy5tUG9ydCk7IFxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgcHVibGljIHNlcnZlcktpY2tPZmYoKTp2b2lke1xyXG4gICAgICAgIHRoaXMubVNlcnZlcktpY2tlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tS2lja2VkVGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwcmludCBsb2dcclxuICAgICAqIEBwYXJhbSBtc2cgbWVzc2FnZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHByaW50TG9nKG1zZzpzdHJpbmcpOnZvaWR7XHJcbiAgICAgICAgICAgIC8vc2hvdWQgYmUgY2FsbCBldmVudGxvZyBtb2R1bGUgdG8gaGFuZGxlciB0aGlzIGV2ZW50LiBcclxuICAgICAgICBkemFwcC5Mb2dnZXIuaW5mbyhtc2cpO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIEBicmllZiA6IHJlc291cmNlIG1hbmFnZXIgbW9kdWxlLlxyXG4gKiBAQXV0aG9yOiBXZW56dW9saVxyXG4gKiBARGF0ZTogMjAxOS8wNC8wOVxyXG4gKi8gXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc291cmNlTWdyIGV4dGVuZHMgTGF5YS5Mb2FkZXJNYW5hZ2Vye1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ3JvdXBSZXM6TGF5YS5XZWFrT2JqZWN0PW51bGw7XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296LWE5rqQIOWFgeiuuO+8mlJlc291cmNlTWdyLmxvYWQoLi4uKS5sb2FkKC4uLikuLi4g6L+e5o6l6LCD55SoXHJcbiAgICAgKiBAcGFyYW0gdXJsIHNpbmdsZSByZXNvdXJjZSB1cmwgb3IgdXJsIGFycmF544CCZS5nLu+8mltcImEucG5nXCIsXCJiLnBuZ1wiXe+8m1xyXG4gICAgICogQHBhcmFtIGNvbXBsZXRlXHTliqDovb3nu5PmnZ/lm57osIPjgILmoLnmja51cmznsbvlnovkuI3lkIzliIbkuLoy56eN5oOF5Ya177yaMS4gdXJs5Li6U3RyaW5n57G75Z6L77yM5Lmf5bCx5piv5Y2V5Liq6LWE5rqQ5Zyw5Z2A77yM5aaC5p6c5Yqg6L295oiQ5Yqf77yM5YiZ5Zue6LCD5Y+C5pWw5YC85Li65Yqg6L295a6M5oiQ55qE6LWE5rqQ77yM5ZCm5YiZ5Li6bnVsbO+8mzIuIHVybOS4uuaVsOe7hOexu+Wei++8jOaMh+WumuS6huS4gOe7hOimgeWKoOi9veeahOi1hOa6kO+8jOWmguaenOWFqOmDqOWKoOi9veaIkOWKn++8jOWImeWbnuiwg+WPguaVsOWAvOS4unRydWXvvIzlkKbliJnkuLpmYWxzZeOAglxyXG4gICAgICogQHBhcmFtIHByb2dyZXNzXHTliqDovb3ov5vluqblm57osIPjgILlm57osIPlj4LmlbDlgLzkuLrlvZPliY3otYTmupDnmoTliqDovb3ov5vluqbkv6Hmga8oMC0xKeOAglxyXG4gICAgICogQHBhcmFtIHR5cGVcdFx06LWE5rqQ57G75Z6L44CC5q+U5aaC77yaTG9hZGVyLklNQUdF44CCXHJcbiAgICAgKiBAcGFyYW0gcHJpb3JpdHlcdChkZWZhdWx0ID0gMSnliqDovb3nmoTkvJjlhYjnuqfvvIzkvJjlhYjnuqfpq5jnmoTkvJjlhYjliqDovb3jgILmnIkwLTTlhbE15Liq5LyY5YWI57qn77yMMOacgOmrmO+8jDTmnIDkvY7jgIJcclxuICAgICAqIEBwYXJhbSBjYWNoZVx0XHTmmK/lkKbnvJPlrZjliqDovb3nu5PmnpzjgIJcclxuICAgICAqIEBwYXJhbSBncm91cFx0XHTliIbnu4TvvIzmlrnkvr/lr7notYTmupDov5vooYznrqHnkIbjgIJcclxuICAgICAqIEBwYXJhbSBpZ25vcmVDYWNoZVx05piv5ZCm5b+955Wl57yT5a2Y77yM5by65Yi26YeN5paw5Yqg6L2944CCXHJcbiAgICAgKiBAcGFyYW0gdXNlV29ya2VyTG9hZGVyKGRlZmF1bHQgPSBmYWxzZSnmmK/lkKbkvb/nlKh3b3JrZXLliqDovb3vvIjlj6rpkojlr7lJTUFHReexu+Wei+WSjEFUTEFT57G75Z6L77yM5bm25LiU5rWP6KeI5Zmo5pSv5oyB55qE5oOF5Ya15LiL55Sf5pWI77yJXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbG9hZFJlcyh1cmw6YW55LGNvbXBsZXRlZD86TGF5YS5IYW5kbGVyLHByb2dyZXNzPzpMYXlhLkhhbmRsZXIsdHlwZT86c3RyaW5nLHByaW9yaXR5PzpudW1iZXIsY2FjaGU/OmJvb2xlYW4sZ3JvdXA/OnN0cmluZyxpZ25vcmVDYWNoZT86Ym9vbGVhbix1c2VXb3JrZXJMb2FkZXI/OmJvb2xlYW4pOkxheWEuTG9hZGVyTWFuYWdlcntcclxuICAgICAgIC8vVE9ETzp3ZW56dW9saSBmb3IgbGF5YSBsaWJyYXJ5IGNhbid0IGNsZWFyIHRoZSByZXMgYnkgZ3JvdXAsIHNvIHRha2UgYSB0ZW1wIHNvbHV0aW9uIHRvIG1hbmFnZW1lbnQgdGhlIHJlc291cmNlLlxyXG4gICAgICAgIGlmKHRoaXMuZ3JvdXBSZXMgPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBSZXMgPSBuZXcgTGF5YS5XZWFrT2JqZWN0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZ3JvdXAmJmdyb3VwLmxlbmd0aD4wKXtcclxuICAgICAgICAgICAgdGhpcy5ncm91cFJlcy5zZXQoZ3JvdXAsdXJsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIExheWEubG9hZGVyLmxvYWQodXJsLGNvbXBsZXRlZCxwcm9ncmVzcyx0eXBlLHByaW9yaXR5LGNhY2hlLGdyb3VwLGlnbm9yZUNhY2hlLHVzZVdvcmtlckxvYWRlcik7XHJcbiAgICAgfSBcclxuXHJcbiAgICAgLyoqXHJcbiAgICAgICAqIOa4heeQhuaMh+Wumui1hOa6kOWcsOWdgOe8k+WtmOOAglxyXG4gICAgICAgKiBAcGFyYW1cdHVybCDotYTmupDlnLDlnYDjgIJcclxuICAgICAgKi9cclxuICAgICBwdWJsaWMgc3RhdGljIGNsZWFyUmVzKHVybDpzdHJpbmcpOnZvaWR7XHJcbiAgICAgICAgTGF5YS5sb2FkZXIuY2xlYXJSZXModXJsKTtcclxuICAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGVhciByZXNvdXJjZSBieSBncm91cCBuYW1l44CCXHJcbiAgICAgKiBAcGFyYW0gZ3JvdXAg5YiG57uE5ZCNXHJcbiAgICAgKi9cclxuICAgICBwdWJsaWMgc3RhdGljIGNsZWFyUmVzQnlHcm91cChncm91cE5hbWU6c3RyaW5nKTp2b2lke1xyXG4gICAgICAgIExheWEubG9hZGVyLmNsZWFyUmVzQnlHcm91cChncm91cE5hbWUpO1xyXG4gICAgICAgIC8vVE9ETzp3ZW56dW9saSAuIGJlY2F1c2UgdGhlIGxheWEgbGlicmFyeSBjbGVhciBieSBnb3J1cCBoYXMgc29tZSBxdWVzdGlvbi5lLmcuIGNhbid0IGNsZWFyLiB3aWxsIGNoZWNrIGxhdGVyLlxyXG4gICAgICAgIGxldCByZXNMaXN0OmFueSA9IHRoaXMuZ3JvdXBSZXMuZ2V0KGdyb3VwTmFtZSk7XHJcbiAgICAgICAgaWYocmVzTGlzdCl7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8cmVzTGlzdC5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgICAgIGlmKHJlc0xpc3RbaV0gaW5zdGFuY2VvZiBTdHJpbmcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJSZXMocmVzTGlzdFtpXSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICByZXNMaXN0W2ldLnVybCYmdGhpcy5jbGVhclJlcyhyZXNMaXN0W2ldLnVybCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICog6ZSA5q+BVGV4dHVyZeS9v+eUqOeahOWbvueJh+i1hOa6kO+8jOS/neeVmXRleHR1cmXlo7PvvIzlpoLmnpzkuIvmrKHmuLLmn5PnmoTml7blgJnvvIzlj5HnjrB0ZXh0dXJl5L2/55So55qE5Zu+54mH6LWE5rqQ5LiN5a2Y5Zyo77yM5YiZ5Lya6Ieq5Yqo5oGi5aSNXHJcbiAgICAgKiDnm7jmr5RjbGVhclJlc++8jGNsZWFyVGV4dHVyZVJlc+WPquaYr+a4heeQhnRleHR1cmXph4zpnaLkvb/nlKjnmoTlm77niYfotYTmupDvvIzlubbkuI3plIDmr4F0ZXh0dXJl77yM5YaN5qyh5L2/55So5Yiw55qE5pe25YCZ5Lya6Ieq5Yqo5oGi5aSN5Zu+54mH6LWE5rqQXHJcbiAgICAgKiDogIxjbGVhclJlc+S8muW9u+W6lemUgOavgXRleHR1cmXvvIzlr7zoh7TkuI3og73lho3kvb/nlKjvvJtjbGVhclRleHR1cmVSZXPog73noa7kv53nq4vljbPplIDmr4Hlm77niYfotYTmupDvvIzlubbkuJTkuI3nlKjmi4Xlv4PplIDmr4HplJnor6/vvIxjbGVhclJlc+WImemHh+eUqOW8leeUqOiuoeaVsOaWueW8j+mUgOavgVxyXG4gICAgICog44CQ5rOo5oSP44CR5aaC5p6c5Zu+54mH5pys6Lqr5Zyo6Ieq5Yqo5ZCI6ZuG6YeM6Z2i77yI6buY6K6k5Zu+54mH5bCP5LqONTEyKjUxMu+8ie+8jOWGheWtmOaYr+S4jeiDveiiq+mUgOavgeeahO+8jOatpOWbvueJh+iiq+Wkp+WbvuWQiOmbhueuoeeQhuWZqOeuoeeQhlxyXG4gICAgICogQHBhcmFtXHR1cmxcdOWbvumbhuWcsOWdgOaIluiAhXRleHR1cmXlnLDlnYDvvIzmr5TlpoIgTG9hZGVyLmNsZWFyVGV4dHVyZVJlcyhcInJlcy9hdGxhcy9jb21wLmF0bGFzXCIpOyBMb2FkZXIuY2xlYXJUZXh0dXJlUmVzKFwiaGFsbC9iZy5qcGdcIik7XHJcbiAgICAgKi9cclxuICAgICBwdWJsaWMgc3RhdGljIGNsZWFyVGV4dHVyZVJlcyh1cmw6c3RyaW5nKTp2b2lke1xyXG4gICAgICAgIExheWEubG9hZGVyLmNsZWFyVGV4dHVyZVJlcyh1cmwpO1xyXG4gICAgIH1cclxuXHJcbiAgICAgLyoqXHJcbiAgICAgKiDojrflj5bmjIflrprotYTmupDlnLDlnYDnmoTotYTmupDjgIJcclxuICAgICAqIEBwYXJhbVx0dXJsIOi1hOa6kOWcsOWdgOOAglxyXG4gICAgICogQHJldHVyblx06L+U5Zue6LWE5rqQ44CCXHJcbiAgICAgKi9cclxuICAgICBwdWJsaWMgc3RhdGljIGdldFJlcyh1cmw6c3RyaW5nKTphbnl7XHJcbiAgICAgICAgIHJldHVybiBMYXlhLmxvYWRlci5nZXRSZXModXJsKTtcclxuICAgICB9XHJcbiAgICAgXHJcbn0iLCIvKiogXHJcbiAqIEhpc3Rvcnk6IDEuIGFkZCBtaW5pLXByb2dyYW0gc3VwcG9ydC4gMjAxOC8xMi8xMSBXZW5adW9saVxyXG4qL1xyXG4gICAgaW1wb3J0IEF1ZGlvRW5naW5lID0gTGF5YS5Tb3VuZE1hbmFnZXI7XHJcbiAgICAvKipcclxuICAgICAqIOWjsOmfs+euoeeQhlxyXG4gICAgICogQEhpc3Rvcnk6IDEuIGFkZCBtaW5pLXByb2dyYW0gc3VwcG9ydC4gMjAxOC8xMi8xMSBXZW5adW9saVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgU291bmRNYW5hZ2VyIHtcclxuICAgICAgICAvKiog6Z+z5LmQ54q25oCBICovXHJcbiAgICAgICAgcHJpdmF0ZSBtTXVzaWNTdGF0ZTpib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICAvKiog6Z+z5pWI54q25oCBICovXHJcbiAgICAgICAgcHJpdmF0ZSBtRWZmZWN0U3RhdGU6Ym9vbGVhbiA9IHRydWU7ICBcclxuICAgICAgICAvKipzdG9yYWdlIGtleSBmb3IgdGhlIGJhY2tncm91bmQgbXVzaWMuICovXHJcbiAgICAgICAgcHJpdmF0ZSBTVE9SRUdFS0VZX0JBQ0tHUk9VTkRfTVVTSUM6c3RyaW5nPVwiYmFja2dyb3VuZF9tdXNpY19vbm9mZlwiO1xyXG4gICAgICAgIC8qKnN0b3JhZ2Uga2V5IGZvciB0aGUgc291bmQgZWZmZWN0LiAqL1xyXG4gICAgICAgIHByaXZhdGUgU1RPUkVHRUtFWV9TT1VORF9FRkZFQ1Q6c3RyaW5nPVwiU291bmRFZmZlY3Rfb25vZmZcIjtcclxuICAgICAgICAvKipzYXZlIGtleSBwcmVmaXggKi9cclxuICAgICAgICBwcml2YXRlIEtFWV9QUkVGSVg6c3RyaW5nPVwiXCI7XHJcbiAgICAgICAgLyoqIGNhY2hlIHNvdW5kIGZpbGVzIHBhdGggKi9cclxuICAgICAgICAvL3ByaXZhdGUgU291bmRTZXQ6TGF5YS5EaWN0aW9uYXJ5O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgLy90aGlzLmxvYWRMb2NhbENvbmZpZ3MoKTsgXHJcbiAgICAgICAgICAgIC8vIOi3n+maj+iuvuWkh+mdmemfs1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS51c2VBdWRpb011c2ljID0gZmFsc2U7IFxyXG4gICAgICAgICAgICAvL3RoaXMuU291bmRTZXQgPSBuZXcgTGF5YS5EaWN0aW9uYXJ5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDojrflj5bmnKzlnLDphY3nva5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgbG9hZExvY2FsQ29uZmlncyhhY2M6c3RyaW5nKTphbnkge1xyXG4gICAgICAgICAgICAvL2luaXQgYWNjb3VudCBvciBrZXlcclxuICAgICAgICAgICAgdGhpcy5LRVlfUFJFRklYID0gYWNjO1xyXG4gICAgICAgICAgICAvL+iDjOaZr+mfs+S5kOeKtuaAgVxyXG4gICAgICAgICAgICBsZXQgX21zdGF0dXM6YW55ID0gdGhpcy5nZXRTdG9yYWdlSXRlbSh0aGlzLlNUT1JFR0VLRVlfQkFDS0dST1VORF9NVVNJQyk7XHJcbiAgICAgICAgICAgIGxldCBfbXVzaWNTdGF0dXM6Ym9vbGVhbiA9IF9tc3RhdHVzPT1udWxsfHxfbXN0YXR1cz09dW5kZWZpbmVkfHxfbXN0YXR1cz09XCJ0cnVlXCJ8fF9tc3RhdHVzPT10cnVlfHxfbXN0YXR1cz09PVwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMubU11c2ljU3RhdGUgPSBfbXVzaWNTdGF0dXM7IFxyXG4gICAgICAgICAgICAvLyBsZXQgbXVzaWNTdGF0dXM6YW55ID0gTGF5YS5Mb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLlNUT1JFR0VLRVlfQkFDS0dST1VORF9NVVNJQyl8fFwidHJ1ZVwiOyBcclxuICAgICAgICAgICAgLy8gdGhpcy5tQmFja2dyb3VuZE11c2ljT24gPSBtdXNpY1N0YXR1cz09XCJ0cnVlXCI7XHJcbiAgICAgICAgICAgICBcclxuICAgICAgICAgICAgLy/og4zmma/pn7PmlYjnirbmgIFcclxuICAgICAgICAgICAgbGV0IF9zc3RhdHVzOmFueSA9IHRoaXMuZ2V0U3RvcmFnZUl0ZW0odGhpcy5TVE9SRUdFS0VZX1NPVU5EX0VGRkVDVCk7XHJcbiAgICAgICAgICAgIGxldCBfc291bmRzdGF0dXM6Ym9vbGVhbiA9IF9zc3RhdHVzPT1udWxsfHxfc3N0YXR1cz09dW5kZWZpbmVkfHxfc3N0YXR1cz09XCJ0cnVlXCJ8fF9zc3RhdHVzPT10cnVlfHxfc3N0YXR1cz09PVwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMubUVmZmVjdFN0YXRlID0gX3NvdW5kc3RhdHVzO1xyXG5cclxuICAgICAgICAgICAgLy8gbGV0IHNvdW5kU3RhdHVzOmFueSA9IExheWEuTG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5TVE9SRUdFS0VZX1NPVU5EX0VGRkVDVCl8fFwidHJ1ZVwiOyAgXHJcbiAgICAgICAgICAgIC8vIHRoaXMubVNvdW5kRWZmZWN0T24gPSBzb3VuZFN0YXR1cz09XCJ0cnVlXCI7XHJcbiAgICAgICAgICAgIC8v6Lef6ZqP6K6+5aSH6Z2Z6Z+zXHJcbiAgICAgICAgICAgIC8vTGF5YS5Tb3VuZE1hbmFnZXIudXNlQXVkaW9NdXNpYz1mYWxzZVxyXG4gICAgICAgIH0gXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHNhdmUgaXRlbSB0byBsb2NhbCBzdG9yYWdlXHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1LZXkgaXRlbSBrZXlcclxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzYXZlU3RvcmFnZUl0ZW0oaXRlbUtleTpzdHJpbmcsdmFsdWU6YW55KXtcclxuICAgICAgICAgICAgLy8gaWYoYmVzdGFwcC51dGlscy5HYW1lVmVyaWZ5LmlzTWluUHJvZ3JhbU1vZGUoKSl7XHJcbiAgICAgICAgICAgIC8vICAgICB0cnl7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJ1cGRhdGUgc3RhdHVzOlwiK2l0ZW1LZXkrXCI6XCIrdmFsdWUrXCIsY3VycjpcIit0aGlzLm1NdXNpY1N0YXRlKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhpdGVtS2V5LHZhbHVlKTtcclxuICAgICAgICAgICAgLy8gICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgLy8gICAgICAgICBwcmludEVycm9yKFwiU2F2ZSBzb3VuZCBzZXR0aW5nIGludG8gc3RhcmFnZSBmYWlsZWQuIFwiKVxyXG4gICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAvLyB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIExheWEuTG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5LRVlfUFJFRklYLmNvbmNhdChpdGVtS2V5KSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAvL31cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldCBpdGVtIGJ5IGtleSBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuICAgICAgICAgKiBAcGFyYW0ga2V5IGl0ZW0ga2V5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBnZXRTdG9yYWdlSXRlbShpdGVtS2V5OnN0cmluZyk6YW55e1xyXG4gICAgICAgICAgICAvLyBpZihiZXN0YXBwLnV0aWxzLkdhbWVWZXJpZnkuaXNNaW5Qcm9ncmFtTW9kZSgpKXtcclxuICAgICAgICAgICAgLy8gICAgIHJldHVybiB3eC5nZXRTdG9yYWdlU3luYyhpdGVtS2V5KTtcclxuICAgICAgICAgICAgLy8gfWVsc2V7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTGF5YS5Mb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLktFWV9QUkVGSVguY29uY2F0KGl0ZW1LZXkpKTtcclxuICAgICAgICAgICAgLy99XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDojrflj5bpn7PkuZDmkq3mlL7nirbmgIFcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXVzaWNTdGF0ZSgpOmJvb2xlYW4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImN1cnJlbnQgc3RhdHVzOlwiK3RoaXMubU11c2ljU3RhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tTXVzaWNTdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOiuvue9rumfs+S5kOaSreaUvueKtuaAgVxyXG4gICAgICAgICAqIEBwYXJhbSBzdGF0ZSDmkq3mlL7nirbmgIFcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0TXVzaWNTdGF0ZShzdGF0ZTpib29sZWFuKTp2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5tTXVzaWNTdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2F2ZVN0b3JhZ2VJdGVtKHRoaXMuU1RPUkVHRUtFWV9CQUNLR1JPVU5EX01VU0lDLHN0YXRlKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDojrflj5bpn7PmlYjmkq3mlL7nirbmgIFcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0RWZmZWN0U3RhdGUoKTpib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubUVmZmVjdFN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6K6+572u6Z+z5pWI5pKt5pS+54q25oCBXHJcbiAgICAgICAgICogQHBhcmFtIHN0YXRlIOaSreaUvueKtuaAgVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRFZmZlY3RTdGF0ZShzdGF0ZTpib29sZWFuKTp2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5tRWZmZWN0U3RhdGUgPSBzdGF0ZTtcclxuICAgICAgICAgICAgLy90aGlzLnNhdmVTdG9yYWdlSXRlbSh0aGlzLlNUT1JFR0VLRVlfU09VTkRfRUZGRUNULHN0YXRlKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlgZzmraLmkq3mlL7miYDmnInlo7Dpn7PvvIjljIXmi6zog4zmma/pn7PkuZDlkozpn7PmlYjvvIlcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RvcEFsbCgpOnZvaWQge1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS5zdG9wQWxsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlgZzmraLlo7Dpn7Pmkq3mlL7jgILmraTmlrnms5Xog73lpJ/lgZzmraLku7vmhI/lo7Dpn7PnmoTmkq3mlL7vvIjljIXmi6zog4zmma/pn7PkuZDlkozpn7PmlYjvvInvvIzlj6rpnIDkvKDlhaXlr7nlupTnmoTlo7Dpn7Pmkq3mlL7lnLDlnYBcclxuICAgICAgICAgKiBAcGFyYW0gdXJsIOWjsOmfs+aWh+S7tuWcsOWdgFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdG9wU291bmQodXJsOnN0cmluZyk6dm9pZCB7XHJcbiAgICAgICAgICAgIEF1ZGlvRW5naW5lLnN0b3BTb3VuZCh1cmwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5YGc5q2i5pKt5pS+5omA5pyJ6Z+z5pWI77yI5LiN5YyF5ous6IOM5pmv6Z+z5LmQ77yJXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0b3BBbGxTb3VuZCgpOnZvaWQge1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS5zdG9wQWxsU291bmQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaSreaUvumfs+aViOOAgumfs+aViOWPr+S7peWQjOaXtuaSreaUvuWkmuS4qlxyXG4gICAgICAgICAqIEBwYXJhbSB1cmwg5aOw6Z+z5paH5Lu25Zyw5Z2AXHJcbiAgICAgICAgICogQHBhcmFtIGxvb3BzIOW+queOr+asoeaVsCww6KGo56S65peg6ZmQ5b6q546vXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBsZXRlIOWjsOmfs+aSreaUvuWujOaIkOWbnuiwgyAgSGFuZGxlcuWvueixoVxyXG4gICAgICAgICAqIEBwYXJhbSBzb3VuZENsYXNzIOS9v+eUqOWTquS4quWjsOmfs+exu+i/m+ihjOaSreaUvu+8jG51bGzooajnpLroh6rliqjpgInmi6lcclxuICAgICAgICAgKiBAcGFyYW0gc3RhcnRUaW1lIOWjsOmfs+aSreaUvui1t+Wni+aXtumXtFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBwbGF5U291bmQodXJsOnN0cmluZywgbG9vcHM/Om51bWJlciwgY29tcGxldGU/OkxheWEuSGFuZGxlciwgc291bmRDbGFzcz86YW55LCBzdGFydFRpbWU/Om51bWJlcik6dm9pZCB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubUVmZmVjdFN0YXRlKXtcclxuICAgICAgICAgICAgICAgIEF1ZGlvRW5naW5lLnBsYXlTb3VuZCh1cmwsIGxvb3BzLCBjb21wbGV0ZSwgc291bmRDbGFzcywgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgIC8v6L+Y5pyJ6Zeu6aKY77yM5pqC5pyq5byA5pS+XHJcbiAgICAgICAgICAgICAgICAvLyBpZihiZXN0YXBwLnV0aWxzLkdhbWVWZXJpZnkuaXNNaW5Qcm9ncmFtTW9kZSgpKXtcclxuICAgICAgICAgICAgICAgIC8vICAgICBpZih0aGlzLm1FZmZlY3RTdGF0ZSl7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGxldCBfdGVtVXJsID0gdGhpcy5Tb3VuZFNldC5nZXQodXJsKTsgXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGlmKF90ZW1VcmwhPW51bGwpe1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgQXVkaW9FbmdpbmUucGxheVNvdW5kKF90ZW1VcmwsIGxvb3BzLCBjb21wbGV0ZSwgc291bmRDbGFzcywgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB0aGlzLmRvd25sb2FkV2ViU291bmQodXJsKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIEF1ZGlvRW5naW5lLnBsYXlTb3VuZCh1cmwsIGxvb3BzLCBjb21wbGV0ZSwgc291bmRDbGFzcywgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5YGc5q2i5pKt5pS+6IOM5pmv6Z+z5LmQICjkuI3ljIXmi6zpn7PmlYgpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0b3BNdXNpYygpOnZvaWQge1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS5zdG9wTXVzaWMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaSreaUvuiDjOaZr+mfs+S5kFxyXG4gICAgICAgICAqIEBwYXJhbSB1cmwg5aOw6Z+z5paH5Lu25Zyw5Z2AXHJcbiAgICAgICAgICogQHBhcmFtIGxvb3BzIOW+queOr+asoeaVsCwgMOihqOekuuaXoOmZkOW+queOr1xyXG4gICAgICAgICAqIEBwYXJhbSBjb21wbGV0ZSDlo7Dpn7Pmkq3mlL7lrozmiJDlm57osINcclxuICAgICAgICAgKiBAcGFyYW0gc3RhcnRUaW1lIOWjsOmfs+aSreaUvui1t+Wni+aXtumXtFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBwbGF5TXVzaWModXJsOnN0cmluZywgbG9vcHM/Om51bWJlciwgY29tcGxldGU/OkxheWEuSGFuZGxlciwgc3RhcnRUaW1lPzpudW1iZXIpOnZvaWQge1xyXG4gICAgICAgICAgICBpZih0aGlzLm1NdXNpY1N0YXRlKXtcclxuICAgICAgICAgICAgICAgIEF1ZGlvRW5naW5lLnN0b3BNdXNpYygpOyBcclxuICAgICAgICAgICAgICAgIEF1ZGlvRW5naW5lLnBsYXlNdXNpYyh1cmwsIGxvb3BzLCBjb21wbGV0ZSwgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOmHiuaUvuWjsOmfs+i1hOa6kFxyXG4gICAgICAgICAqIEBwYXJhbSB1cmwg5aOw6Z+z5pKt5pS+5Zyw5Z2AXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGRlc3Ryb3lTb3VuZCh1cmw6c3RyaW5nKTp2b2lkIHtcclxuICAgICAgICAgICAgQXVkaW9FbmdpbmUuZGVzdHJveVNvdW5kKHVybCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDorr7nva7lo7Dpn7Ppn7Pph4/jgILmoLnmja7lj4LmlbDkuI3lkIzvvIzlj6/ku6XliIbliKvorr7nva7mjIflrprlo7Dpn7PvvIjog4zmma/pn7PkuZDmiJbpn7PmlYjvvInpn7Pph4/miJbogIXmiYDmnInpn7PmlYjvvIjkuI3ljIXmi6zog4zmma/pn7PkuZDvvInpn7Pph49cclxuICAgICAgICAgKiBAcGFyYW0gdm9sdW1lIOmfs+mHj+OAguWIneWni+WAvOS4ujHjgILpn7Pph4/ojIPlm7Tku44gMO+8iOmdmemfs++8ieiHsyAx77yI5pyA5aSn6Z+z6YeP77yJXHJcbiAgICAgICAgICogQHBhcmFtIHVybCAoZGVmYXVsdCA9IG51bGwp5aOw6Z+z5pKt5pS+5Zyw5Z2A44CC6buY6K6k5Li6bnVsbOOAguS4uuepuuihqOekuuiuvue9ruaJgOaciemfs+aViO+8iOS4jeWMheaLrOiDjOaZr+mfs+S5kO+8ieeahOmfs+mHj++8jOS4jeS4uuepuuihqOekuuiuvue9ruaMh+WumuWjsOmfs++8iOiDjOaZr+mfs+S5kOaIlumfs+aViO+8ieeahOmfs+mHj1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRTb3VuZFZvbHVtZSh2b2x1bWU6bnVtYmVyLCB1cmw/OnN0cmluZyk6dm9pZCB7XHJcbiAgICAgICAgICAgIEF1ZGlvRW5naW5lLnNldFNvdW5kVm9sdW1lKHZvbHVtZSwgdXJsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOiuvue9ruiDjOaZr+mfs+S5kOmfs+mHj+OAgumfs+mHj+iMg+WbtOS7jiAw77yI6Z2Z6Z+z77yJ6IezIDHvvIjmnIDlpKfpn7Pph4/vvIlcclxuICAgICAgICAgKiBAcGFyYW0gdm9sdW1lIOmfs+mHj+OAguWIneWni+WAvOS4ujHjgILpn7Pph4/ojIPlm7Tku44gMO+8iOmdmemfs++8ieiHsyAx77yI5pyA5aSn6Z+z6YeP77yJXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldE11c2ljVm9sdW1lKHZvbHVtZTpudW1iZXIpOnZvaWQge1xyXG4gICAgICAgICAgICBBdWRpb0VuZ2luZS5zZXRNdXNpY1ZvbHVtZSh2b2x1bWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZG93bmxvYWQgc291bmQgZmlsZSBhbmQgcGxheS5cclxuICAgICAgICAgKiBAcGFyYW0gdXJsIHJlc2x1cmNlIHBhdGgsbGlrZSB0aGlzOiBhdWRpby9hYWEubXAzXHJcbiAgICAgICAgICogQHBhcmFtIGxvb3BzIGxvb3BzXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBsZXRlIGNvbXBsZXRlIGNhbGxiYWNrXHJcbiAgICAgICAgICogQHBhcmFtIHNvdW5kQ2xhc3MgXHJcbiAgICAgICAgICogQHBhcmFtIHN0YXJ0VGltZSBzdGFydCB0aW1lIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgZG93bmxvYWRXZWJTb3VuZCh1cmw6c3RyaW5nLCBsb29wcz86bnVtYmVyLCBjb21wbGV0ZT86TGF5YS5IYW5kbGVyLCBzb3VuZENsYXNzPzphbnksIHN0YXJ0VGltZT86bnVtYmVyKTp2b2lke1xyXG4gICAgICAgICAgICBsZXQgX3RlbVVybDpzdHJpbmcgPSBMYXlhLlVSTC5mb3JtYXRVUkwodXJsKTtcclxuICAgICAgICAgICAgbGV0IF90aGlzOmFueSA9IHRoaXM7XHJcbiAgICAgICAgICAgIC8vIHd4LmRvd25sb2FkRmlsZSh7XHJcbiAgICAgICAgICAgIC8vICAgICB1cmw6X3RlbVVybCxcclxuICAgICAgICAgICAgLy8gICAgIHN1Y2Nlc3M6ZnVuY3Rpb24ocmVzKXtcclxuICAgICAgICAgICAgLy8gICAgICAgICBkemFwcC5tTG9nZ2VyLmRlYnVnKFwiZG93bmxvYWQgb3BlcmF0b24gc3VjY2VzczpcIitKU09OLnN0cmluZ2lmeShyZXMpKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICBpZihyZXMuc3RhdHVzQ29kZT09MjAwKXtcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgX3RoaXMuU291bmRTZXQuc2V0KHVybCxyZXMudGVtcEZpbGVQYXRoKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgQXVkaW9FbmdpbmUucGxheVNvdW5kKHJlcy50ZW1wRmlsZVBhdGgsIGxvb3BzLCBjb21wbGV0ZSwgc291bmRDbGFzcywgc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vICAgICB9LGZhaWw6e1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIC8vZHphcHAubUxvZ2dlci5lcnJvcihcImRvd25sb2FkIGZhaWxlZDpcIitKU09OLnN0cmluZ2lmeShyZXMpKTtcclxuICAgICAgICAgICAgLy8gICAgICAgICBBdWRpb0VuZ2luZS5wbGF5U291bmQodXJsLCBsb29wcywgY29tcGxldGUsIHNvdW5kQ2xhc3MsIHN0YXJ0VGltZSk7XHJcbiAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0iLCJpbXBvcnQgQmFzZVNjZW5lIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL2R6cGFnZS9CYXNlU2NlbmVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVJdGVte1xyXG4gICAgY29uc3RydWN0b3Ioa2V5OnN0cmluZyxyZXM6QXJyYXk8YW55PixzY2VuZTpCYXNlU2NlbmUpe1xyXG4gICAgICAgIHRoaXMubUdhbWVLZXkgPSBrZXk7XHJcbiAgICAgICAgdGhpcy5tR2FtZVJlcyA9IHJlcztcclxuICAgICAgICB0aGlzLm1HYW1lVmlldyA9IHNjZW5lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtR2FtZUtleTpzdHJpbmc7XHJcbiAgICBwdWJsaWMgbUdhbWVSZXM6QXJyYXk8YW55PjtcclxuICAgIHB1YmxpYyBtR2FtZVZpZXc6QmFzZVNjZW5lO1xyXG59IiwiaW1wb3J0IHsgZHphcHAgfSBmcm9tIFwiLi4vLi4vLi4vTWFpblwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9iYnlEYXRhe1xyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW4oKTtcclxuICAgICAgICB0aGlzLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbnQ6TG9iYnlEYXRhID0gbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBJbnN0YW50KCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBpbml0KCk6dm9pZHtcclxuICAgICAgICB0aGlzLl9pbnN0YW50ID0gdGhpcy5JbnN0YW50IHx8IG5ldyBMb2JieURhdGEoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudExpc3RlbigpOnZvaWR7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydCgpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuZW50ZXJMb2JieSgpO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxQbGF5ZXJ7XHJcbiBcclxuICAgIC8qKlxyXG4gICAgICog572R57uc5Yqg6L295q2l6aqk77yaMOacqui/m+ihjOWKoOi9ve+8mzHliqDovb3pooTliqDovb3otYTmupDlrozmr5XvvJsy77ya5Yqg6L295ri45oiP6LWE5rqQ5a6M5q+V77ybM++8mui/m+WFpea4uOaIj1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbUNsaWVudExvYWRTdGVwOm51bWJlcj0wO1xyXG5cclxuICAgIHB1YmxpYyBtTG9naW5QbGF0OnN0cmluZz1cIlwiO1xyXG4gICAgcHVibGljIG1BY2NvdW50OnN0cmluZz1cIlwiOyBcclxuICAgIHB1YmxpYyBtUGFzc3dvcmQ6c3RyaW5nPVwiXCI7XHJcbiAgICBwdWJsaWMgbVJlZ1NpdGU6c3RyaW5nPVwiXCI7XHJcblxyXG4gICAgcHVibGljIG1TaXRlTnVtOm51bWJlcj0wO1xyXG4gICAgLyoqIOeOqeWutklkICovXHJcbiAgICBwdWJsaWMgbVVzZXJJZDpudW1iZXIgPSAwO1xyXG4gICAgLyoqIOeOqeWutuaYteensCAqL1xyXG4gICAgcHVibGljIG1OaWNrTmFtZTpzdHJpbmcgPSBcIlwiO1xyXG4gICAgLyoqWVnluJDlj7cgKi9cclxuICAgIHB1YmxpYyBtWVlBY2NvdW50OnN0cmluZz1cIlwiO1xyXG4gICAgLyoqIOeOqeWutuWktOWDjyAqL1xyXG4gICAgcHVibGljIG1GYWNlOnN0cmluZyA9IFwiXCI7XHJcbiAgICAvKiog546p5a626YeR5biBL+mHkeixhiAqL1xyXG4gICAgcHVibGljIG1Hb2xkOm51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgbURaQ2FzaDpudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiDnpLzliLhcclxuICAgICAqL1xyXG4gICAgcHVibGljIG1MaVF1YW46bnVtYmVyID0gMDsgXHJcbiAgICBwdWJsaWMgbUJlYW46bnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBtSG9tZVBlYXM6bnVtYmVyID0gMDtcclxuICAgIC8qKiDnjqnlrrbmgKfliKsgKi9cclxuICAgIHB1YmxpYyBtU2V4Om51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgbUxhc3RSb29tTmFtZTpzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIG1MYXN0Um9vbUlkOm51bWJlciA9IDA7IFxyXG4gICAgcHVibGljIG1HYW1lS2V5OnN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgbVBvcnRLZXk6c3RyaW5nID0gXCJcIjtcclxuICAgIHB1YmxpYyBtTWQ1OnN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgbUlzTmV3VXNlcjpudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIG1CQlNVcmw6c3RyaW5nID0gXCJcIjtcclxuICAgIC8qKiDmiYDlnKjln47luIIgKi9cclxuICAgIHB1YmxpYyBtQ2l0eTpzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIG1DaGFubmVsSWQ6bnVtYmVyID0gMDtcclxuICAgIC8qKiDnjqnlrrbnu4/pqowgKi9cclxuICAgIHB1YmxpYyBtR2FtZUV4cDpudW1iZXIgPSAwO1xyXG4gICAgLyoqIOiDveWQpuWdkOS4iyAqL1xyXG4gICAgcHVibGljIG1DYW5TaXQ6bnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBtVG91clBvaW50Om51bWJlciA9IDA7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIHRoZUFwcC5ldmVudHMub24ocHJvdG9jb2wubGFuZC5HQzJDX1BMQVlFUklORk8sdGhpcywgdGhpcy5yZWZyZXNoVXNlckluZm9CeUdDKTtcclxuICAgICAgICAvLyB0aGVBcHAuZXZlbnRzLm9uKHByb3RvY29sLmxhbmQuR0MyQ19QTEFZRVJJTkZPRVgsdGhpcywgdGhpcy5yZWZyZXNoVXNlckluZm9CeUdDRXgpO1xyXG4gICAgICAgIC8vIHRoZUFwcC5ldmVudHMub24ocHJvdG9jb2wubGFuZC5HUzJDX1VTRVJEQVRBLCB0aGlzLCB0aGlzLnJlZnJlc2hVc2VySW5mb0J5R1MpO1xyXG4gICAgICAgIC8vIHRoZUFwcC5ldmVudHMub24ocHJvdG9jb2wubGFuZC5HUzJDX0xJUVVBTl9OVU0sdGhpcyx0aGlzLnJlZnJlc2hMaVF1YW5CeUdTKTtcclxuICAgICAgICAvLyB0aGVBcHAuZXZlbnRzLm9uKHByb3RvY29sLmxhbmQuR1MyQ19SRUdCLHRoaXMsdGhpcy5yZWZyZXNoVXNlckdvbGQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2hvdyB1c2VyIGdvbGQgYXMgc2hvcnQgc3RyaW5nLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0U2hvcnRHb2xkU3RyaW5nKCk6c3RyaW5ne1xyXG4gICAgICAgIHJldHVybiBOdW1iZXIuVG9TaG9ydFN0cmluZyh0aGlzLm1Hb2xkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNob3cgdXNlciBMaVF1YW4gYXMgc2hvcnQgc3RyaW5nLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0U2hvcnRMaVF1YW5TdHJpbmcoKTpzdHJpbmd7XHJcbiAgICAgICAgcmV0dXJuIE51bWJlci5Ub1Nob3J0U3RyaW5nKHRoaXMubUxpUXVhbik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliLfmlrDph5HluIFcclxuICAgICAqIEBwYXJhbSBkYXRhIOaVsOaNrua1gVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlZnJlc2hVc2VyR29sZChkYXRhOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICB0aGlzLm1Hb2xkID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubURaQ2FzaCA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1CZWFuID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUhvbWVQZWFzID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDnjqnlrrbmlbDmja5ieSBnY1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlZnJlc2hVc2VySW5mb0J5R0MobWVzc2FnZTpMYXlhLkJ5dGUpOnZvaWQge1xyXG4gICAgICAgIHRoaXMubVVzZXJJZCAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1OaWNrTmFtZSAgPSBtZXNzYWdlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgIHRoaXMubUZhY2UgICAgICA9IG1lc3NhZ2UuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5tR29sZCAgICAgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubURaQ2FzaCAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1CZWFuICAgICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tSG9tZVBlYXMgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubVNleCAgICAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOeOqeWutuaVsOaNrmJ5IGdjIEV4XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVmcmVzaFVzZXJJbmZvQnlHQ0V4KG1lc3NhZ2U6TGF5YS5CeXRlKTp2b2lkIHtcclxuICAgICAgICB0aGlzLm1Vc2VySWQgICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tTmlja05hbWUgID0gbWVzc2FnZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLm1GYWNlICAgICAgPSBtZXNzYWdlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgIHRoaXMubUdvbGQgICAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1EWkNhc2ggICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tQmVhbiAgICAgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUhvbWVQZWFzICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1TZXggICAgICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tWVlBY2NvdW50ICA9IG1lc3NhZ2UuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDnjqnlrrbmlbDmja5ieSBnc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlZnJlc2hVc2VySW5mb0J5R1MobWVzc2FnZTpMYXlhLkJ5dGUpOnZvaWQge1xyXG4gICAgICAgIHRoaXMubVBvcnRLZXkgICA9IG1lc3NhZ2UuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5tU2V4ICAgICAgID0gbWVzc2FnZS5nZXRCeXRlKCk7XHJcbiAgICAgICAgdGhpcy5tTmlja05hbWUgID0gbWVzc2FnZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLm1GYWNlICAgICAgPSBtZXNzYWdlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgIHRoaXMubUdvbGQgICAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1EWkNhc2ggICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tQmVhbiAgICAgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUhvbWVQZWFzICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1DaXR5ICAgICAgPSBtZXNzYWdlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgIHRoaXMubUNoYW5uZWxJZCA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1Vc2VySWQgICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tTWQ1ICAgICAgID0gbWVzc2FnZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLm1HYW1lRXhwICAgPSBtZXNzYWdlLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tQ2FuU2l0ICAgID0gbWVzc2FnZS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubVRvdXJQb2ludCA9IG1lc3NhZ2UuZ2V0SW50MzIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOeOqeWutuekvOWIuOaVsOaNrmJ5IGdzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVmcmVzaExpUXVhbkJ5R1MobWVzc2FnZTpMYXlhLkJ5dGUpOnZvaWQgeyBcclxuICAgICAgICB0aGlzLm1MaVF1YW4gICAgICA9IG1lc3NhZ2UuZ2V0SW50MzIoKTsgXHJcbiAgICAgICAgLy90aGVBcHAuZXZlbnRzLmV2ZW50KHByb3RvY29sLmxhbmQuR1MyQ19MSVFVQU5fTlVNX0NIQU5HRSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgdGhlIGhlYWQgaW1hZ2Ugb2YgdGhlIGN1cnJlbnQgcGxheWVyLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0SGVhZEltYWdlKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubVNleDwxP1wiZ2FtZS9sYW5kbG9yZHMvaGVhZC9naXJsLnBuZ1wiOlwiZ2FtZS9sYW5kbG9yZHMvaGVhZC9ib3kucG5nXCI7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi9NYWluXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dpbkhhbmRsZXJ7XHJcbiAgICBwcml2YXRlIG1PbkxvZ2luZWQ6TGF5YS5IYW5kbGVyPW51bGw7XHJcbiAgICBjb25zdHJ1Y3RvcigpeyBcclxuICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXZlbnRMaXN0ZW4oKTp2b2lke1xyXG4gICAgICAgIGR6YXBwLkV2ZW50cy5MaXN0ZW4oMSxcIlJFTEdcIix0aGlzLHRoaXMub25Mb2dpbik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2dpbiB0byBzeXN0ZW0uXHJcbiAgICAgKiBAcGFyYW0gYWNjb3VudCBhY2NvdW50XHJcbiAgICAgKiBAcGFyYW0gcHdkIHBhc3N3b3JkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb2dpbihhY2NvdW50OnN0cmluZyxwd2Q6c3RyaW5nLHNpdGU6bnVtYmVyPTAsb25Mb2dpbmVkOkxheWEuSGFuZGxlcik6dm9pZHtcclxuICAgICAgICB0aGlzLmV2ZW50TGlzdGVuKCk7XHJcbiAgICAgICAgdGhpcy5tT25Mb2dpbmVkID0gb25Mb2dpbmVkO1xyXG4gICAgICAgIGR6YXBwLnNob3dMb2FkaW5nKCk7XHJcbiAgICAgICAgZHphcHAuTmV0LmxvZ2luVG9HQyhhY2NvdW50LHB3ZCxzaXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uTG9naW4oYnl0ZTpMYXlhLkJ5dGUpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuaGlkZUxvYWRpbmcoKTtcclxuICAgICAgICAvL29mZiBcclxuICAgICAgICBkemFwcC5FdmVudHMub2ZmKDAsXCJSRUxHXCIsdGhpcyk7XHJcbiAgICAgICAgZHphcHAuTG9nZ2VyLmluZm8oXCJsb2dpbiBjYWxsYmFjay5cIik7XHJcbiAgICAgICAgbGV0IHN0YXR1Om51bWJlciA9IGJ5dGUuZ2V0VWludDE2KCk7XHJcbiAgICAgICAgaWYoZHphcHAmJnN0YXR1PT0xKXtcclxuICAgICAgICAgICAgIC8vIOabtOaWsOeOqeWutuaVsOaNrlxyXG4gICAgICAgICAgICBkemFwcC5QbGF5ZXIubUNsaWVudExvYWRTdGVwICA9IDM7XHJcbiAgICAgICAgICAgIGR6YXBwLlBsYXllci5tTGFzdFJvb21OYW1lICAgID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICAgICAgZHphcHAuUGxheWVyLm1MYXN0Um9vbUlkICAgICAgPSBieXRlLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGR6YXBwLlBsYXllci5tVXNlcklkICAgICAgICAgID0gYnl0ZS5nZXRJbnQzMigpO1xyXG4gICAgICAgICAgICBkemFwcC5QbGF5ZXIubUdhbWVLZXkgICAgICAgICA9IGJ5dGUuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGR6YXBwLlBsYXllci5tTWQ1ICAgICAgICAgICAgID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICAgICAgZHphcHAuUGxheWVyLm1Jc05ld1VzZXIgICAgICAgPSBieXRlLmdldEJ5dGUoKTtcclxuICAgICAgICAgICAgZHphcHAuUGxheWVyLm1OaWNrTmFtZSAgICAgICAgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICBkemFwcC5QbGF5ZXIubUJCU1VybCAgICAgICAgICA9IGJ5dGUuZ2V0VVRGU3RyaW5nKCk7IFxyXG4gICAgICAgICAgICB0aGlzLmFmdGVyTG9naW4oKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICBkemFwcC5zaG93VG9hc3QoXCJsb2dpbiBmYWlsZWQuXCIpO1xyXG4gICAgICAgICAgIGR6YXBwLnNob3dMb2dpblBhbmVsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBhZnRlciBsb2dpbiB0byBzeXN0ZW0gLnN1Y2Nlc3NcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhZnRlckxvZ2luKCk6dm9pZHtcclxuICAgICAgICBpZih0aGlzLm1PbkxvZ2luZWQpe1xyXG4gICAgICAgICAgICB0aGlzLm1PbkxvZ2luZWQucnVuKCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGR6YXBwLkxvZ2dlci5pbmZvKFwibG9naW4gc3VjY2VzcyB3aXRoIG5vIGhhbmRsZXIuXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFJhbmRvbU1ncntcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgdXVpZCgpOnN0cmluZ3tcclxuICAgICAgICB2YXIgcyA9IFtdO1xyXG4gICAgICAgIHZhciBoZXhEaWdpdHMgPSBcIjAxMjM0NTY3ODlhYmNkZWZcIjtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcclxuICAgICAgICAgICAgc1tpXSA9IGhleERpZ2l0cy5zdWJzdHIoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMHgxMCksIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzWzE0XSA9IFwiNFwiOyAgLy8gYml0cyAxMi0xNSBvZiB0aGUgdGltZV9oaV9hbmRfdmVyc2lvbiBmaWVsZCB0byAwMDEwXHJcbiAgICAgICAgc1sxOV0gPSBoZXhEaWdpdHMuc3Vic3RyKChzWzE5XSAmIDB4MykgfCAweDgsIDEpOyAgLy8gYml0cyA2LTcgb2YgdGhlIGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWQgdG8gMDFcclxuICAgICAgICBzWzhdID0gc1sxM10gPSBzWzE4XSA9IHNbMjNdID0gXCItXCI7XHJcbiAgICAgICAgdmFyIHV1aWQgPSBzLmpvaW4oXCJcIik7XHJcbiAgICAgICAgcmV0dXJuIHV1aWQ7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyB1aSB9IGZyb20gXCIuLi8uLi8uLi91aS9sYXlhTWF4VUlcIjtcclxuXHJcbi8qKlxyXG4gKiBAYnJpZWYgOiBsb2FkaW5nIHZpZXdcclxuICogQEF1dGhvcjogV2VuenVvbGlcclxuICogQERhdGU6IDIwMTkvMDQvMDhcclxuICovIFxyXG4gICAgZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9hZGluZ1ZpZXcgZXh0ZW5kcyB1aS5kemdhbWUuY29tbW9uLkxvYWRpbmdVSXtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbGJsVGlwczpMYXlhLkxhYmVsO1xyXG4gICAgcHVibGljIHNob3J0OmJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZHtcclxuICAgICAgICBzdXBlci5jcmVhdGVDaGlsZHJlbigpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uRW5hYmxlKCk6dm9pZHtcclxuICAgICAgICBMYXlhLnRpbWVyLmxvb3AoNTAwLHRoaXMsdGhpcy5jaGFuZ2VGb250KTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFuZ2VGb250KCk6dm9pZHtcclxuICAgICAgICB0aGlzLnNob3J0ID0gIXRoaXMuc2hvcnQ7XHJcbiAgICAgICAgbGV0IG1zZzpzdHJpbmcgPSBcIkxvYWRpbmdcIjsgXHJcbiAgICAgICAgdGhpcy5sYmxUaXBzLnRleHQgPSB0aGlzLnNob3J0P1wiTG9hZGluZy5cIjpcIi5Mb2FkaW5nXCI7XHJcbiAgICB9XHJcblxyXG4gICAgb25EZXN0cm95KCk6dm9pZHtcclxuICAgICAgICBMYXlhLnRpbWVyLmNsZWFyKHRoaXMsdGhpcy5jaGFuZ2VGb250KTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IHVpIH0gZnJvbSBcIi4uLy4uLy4uL3VpL2xheWFNYXhVSVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFza1ZpZXcgZXh0ZW5kcyB1aS5kemdhbWUuY29tbW9uLk1hc2tVSXtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgc3VwZXIoKTsgXHJcbiAgICB9XHJcbiAgICAgXHJcblxyXG4gICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lke1xyXG4gICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICB9XHJcbiAgICBvbkVuYWJsZSgpOnZvaWR7XHJcbiAgICAgICAgIFxyXG4gICAgfSBcclxufSIsImltcG9ydCB7IHVpIH0gZnJvbSBcIi4uLy4uLy4uL3VpL2xheWFNYXhVSVwiO1xyXG5pbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9ncmVzc1ZpZXcgZXh0ZW5kcyB1aS5kemdhbWUuY29tbW9uLlByb2dyZXNzVUl7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHN1cGVyKCk7IFxyXG4gICAgfVxyXG4gICAgIFxyXG4gICAgcHVibGljIGxibFRpcHM6TGF5YS5MYWJlbDtcclxuICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZHtcclxuICAgICAgICBzdXBlci5jcmVhdGVDaGlsZHJlbigpO1xyXG4gICAgfVxyXG4gICAgb25FbmFibGUoKTp2b2lke1xyXG4gICAgICAgICBcclxuICAgIH0gXHJcblxyXG4gICAgcHVibGljIHByb2dyZXNzQ2hhbmdlKHZhbDpudW1iZXIpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5sYmxUaXBzLnRleHQgPSBcInByb2dyZXNzIFwiLmNvbmNhdCgodmFsKjEwMCkudG9TdHJpbmcoKSxcIiVcIik7XHJcbiAgICAgICAgZHphcHAuTG9nZ2VyLmluZm8odGhpcy5sYmxUaXBzLnRleHQpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgdWkgfSBmcm9tIFwiLi4vLi4vLi4vdWkvbGF5YU1heFVJXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2FzdFZpZXcgZXh0ZW5kcyB1aS5kemdhbWUuY29tbW9uLlRvYXN0VUl7XHJcbiAgICBjb25zdHJ1Y3Rvcihtc2c6c3RyaW5nKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubU1lc3NhZ2UgPSBtc2c7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIG1NZXNzYWdlOnN0cmluZz1cIlwiO1xyXG4gICAgcHVibGljIGxibFRpcHM6TGF5YS5MYWJlbDtcclxuICAgIHByaXZhdGUgbUNsb3NlSGFuZGxlcjpMYXlhLkhhbmRsZXIgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBtRGlzcGxheVRpbWU6bnVtYmVyID0wLjU7XHJcblxyXG4gICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lke1xyXG4gICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICB9XHJcbiAgICBvbkVuYWJsZSgpOnZvaWR7XHJcbiAgICAgICAgdGhpcy5sYmxUaXBzLnRleHQgPSB0aGlzLm1NZXNzYWdlO1xyXG4gICAgICAgIExheWEuVHdlZW4udG8odGhpcy5sYmxUaXBzLHt5OjM0NCxhbHBoYToxfSw4MDAsTGF5YS5FYXNlLnN0cm9uZ091dCxMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsdGhpcy5kZWxheUNsb3NlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWxheSBjbG9zZSB0aGUgdG9hc3Qgdmlld1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRlbGF5Q2xvc2UoKTp2b2lke1xyXG4gICAgICAgIExheWEudGltZXIub25jZSgxMDAwKnRoaXMubURpc3BsYXlUaW1lLHRoaXMsdGhpcy5oaWRlVG9hc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZXhpdCB0b2FzdCB2aWV3XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGlkZVRvYXN0KCk6dm9pZHtcclxuICAgICAgICBMYXlhLlR3ZWVuLnRvKHRoaXMubGJsVGlwcyx7YWxwaGE6MCx5OjE1Mn0sOTAwLExheWEuRWFzZS5zdHJvbmdPdXQsTGF5YS5IYW5kbGVyLmNyZWF0ZSh0aGlzLHRoaXMuZGVzdHJveU1zZykpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGVzdHJveU1zZygpe1xyXG4gICAgICAgIHRoaXMuZGVzdHJveSh0cnVlKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IGR6YXBwIH0gZnJvbSBcIi4uLy4uLy4uL01haW5cIjtcclxuaW1wb3J0IHsgdWkgfSBmcm9tIFwiLi4vLi4vLi4vdWkvbGF5YU1heFVJXCI7XHJcbmltcG9ydCB7IGxhbnJlcyB9IGZyb20gXCIuLi8uLi8uLi9nYW1lcy9sYW5kbG9yZHMvY29uZnMvcmVzXCI7XHJcbmltcG9ydCBMYW5Mb2JieVZpZXcgZnJvbSBcIi4uLy4uLy4uL2dhbWVzL2xhbmRsb3Jkcy92aWV3cy9sYW5sb2JieVwiO1xyXG5pbXBvcnQgR2FtZXNWaWV3IGZyb20gXCIuLi8uLi8uLi9nYW1lcy9nbG9iYWwvZ2FtZXN2aWV3XCI7XHJcbmltcG9ydCBTb2hhTG9iYnlWaWV3IGZyb20gXCIuLi8uLi8uLi9nYW1lcy9zb2hhL3ZpZXdzL1NvaGFMb2JieVwiO1xyXG5pbXBvcnQgeyBzb2hhcmVzIH0gZnJvbSBcIi4uLy4uLy4uL2dhbWVzL3NvaGEvY29uZnMvcmVzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2JieVZpZXcgZXh0ZW5kcyB1aS5kemdhbWUuR2FtZUxvYmJ5LkxvYmJ5VUkge1xyXG4gXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG9uRW5hYmxlKCk6dm9pZHtcclxuICAgICAgICB0aGlzLmV2ZW50QmluZCgpO1xyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNob3dHYW1lcygpOnZvaWR7XHJcbiAgICAgICAgbGV0IGdhbWVzOkdhbWVzVmlldyA9IG5ldyBHYW1lc1ZpZXcoKTtcclxuICAgICAgICBnYW1lcy56T3JkZXIgPSAxO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoZ2FtZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXZlbnRMaXN0ZW4oKTp2b2lke1xyXG4gICAgICAgXHJcbiAgICAgICAgZHphcHAuRXZlbnRzLkxpc3RlbigxLFwiUkVMR1wiLHRoaXMsdGhpcy5hZnRlckxvZ2luKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFmdGVyTG9naW4oZGF0YTpMYXlhLkJ5dGUpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuTG9nZ2VyLmluZm8oXCJsb2dpbiBjYWxsYmFjay5cIik7XHJcbiAgICAgICAgbGV0IHN0YXR1Om51bWJlciA9IGRhdGEuZ2V0VWludDE2KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudEJpbmQoKTp2b2lke1xyXG4gICAgICAgIHRoaXMuYnRuRERaICYmIHRoaXMuYnRuRERaLm9uKExheWEuRXZlbnQuQ0xJQ0ssdGhpcyx0aGlzLm9uQ2xpY2spO1xyXG4gICAgICAgIHRoaXMuYnRuTG9naW4mJnRoaXMuYnRuTG9naW4ub24oTGF5YS5FdmVudC5DTElDSyx0aGlzLHRoaXMub25Mb2dpbik7XHJcbiAgICAgICAgdGhpcy5idG5Tb2hhICYmIHRoaXMuYnRuU29oYS5vbihMYXlhLkV2ZW50LkNMSUNLLHRoaXMsdGhpcy5vbkNsaWNrU29oYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGJ0bkREWjpMYXlhLkJ1dHRvbjtcclxuICAgIHB1YmxpYyBidG5Sb29tOkxheWEuQnV0dG9uO1xyXG4gICAgcHVibGljIGJ0bkxvZ2luOkxheWEuQnV0dG9uOyBcclxuXHJcbiAgICBjcmVhdGVDaGlsZHJlbigpOnZvaWR7XHJcbiAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgICAgICB0aGlzLnNob3dHYW1lcygpO1xyXG4gICAgICAgIC8vTGF5YS5sb2FkZXIubG9hZChcIkdhbWVMb2JieS9Mb2JieS5zY2VuZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkxvZ2luKCk6dm9pZHtcclxuICAgICAgICAvL2R6YXBwLk5ldC5Mb2dpblRvR0MoXCIxMTFcIixcIjExXCIsMClcclxuICAgICAgICAvL2R6YXBwLnNob3dUb2FzdChcIm9uIGNsaWNrIHRoZSBsb2dpbiBidXR0b24uXCIpO1xyXG4gICAgICAgIGR6YXBwLm9wZW5HYW1lKG5ldyBMYW5Mb2JieVZpZXcoKSxsYW5yZXMubG9iYnkpO1xyXG4gICAgICAgLy8gZHphcHAub3BlbkdhbWUoXCJMYW5Mb2JieVwiLGxhbnJlcy5sb2JieSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25DbGljaygpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuTmV0LmVudGVyR2FtZShcInF1ZXJ5XCIsXCJkZHpfbWF0Y2hcIik7XHJcbiAgICB9XHJcbiBcclxuICAgIG9uQ2xpY2tTb2hhKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5vcGVuR2FtZShuZXcgU29oYUxvYmJ5VmlldygpLCBzb2hhcmVzLmxvYmJ5KTtcclxuICAgICAgICBkemFwcC5OZXQuZW50ZXJHYW1lKFwicXVlcnlcIixcInNvaGFcIik7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi8uLi9NYWluXCI7XHJcbmltcG9ydCB7IHVpIH0gZnJvbSBcIi4uLy4uLy4uL3VpL2xheWFNYXhVSVwiO1xyXG5pbXBvcnQgTG9naW5IYW5kbGVyIGZyb20gXCIuLi8uLi9wcmVzZW50ZXJzL0xvZ2luSGFuZGxlclwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlbG9hZFZpZXcgZXh0ZW5kcyB1aS5kemdhbWUuY29tbW9uLlByZWxvYWRVSSB7XHJcbiAgIFxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTsgIFxyXG4gICAgfVxyXG4gIFxyXG4gICAgcHJpdmF0ZSBlbnRlckxvYmJ5KCk6dm9pZHtcclxuICAgICAgICBkemFwcC5lbnRlckxvYmJ5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGJ0bkxvZ2luOkxheWEuQnV0dG9uO1xyXG5cclxuICAgIC8vIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZHtcclxuICAgIC8vICAgIC8vIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgb25FbmFibGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbigpO1xyXG4gICAgICAgIHRoaXMuZXZlbnRCaW5kKCk7XHJcbiAgICB9IFxyXG5cclxuICAgIHByaXZhdGUgZXZlbnRCaW5kKCk6dm9pZHtcclxuICAgICAgICB0aGlzLmJ0bkxvZ2luJiYodGhpcy5idG5Mb2dpbi52aXNpYmxlPXRydWUpJiZ0aGlzLmJ0bkxvZ2luLm9uKExheWEuRXZlbnQuQ0xJQ0ssdGhpcyx0aGlzLm9uQ2xpY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZXZlbnRMaXN0ZW4oKTp2b2lke1xyXG4gICAgICAgIC8vZHphcHAubUV2ZW50cy5MaXN0ZW4oMCxcIlJFTEdcIix0aGlzLHRoaXMuYWZ0ZXJMb2dpbik7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZnRlckxvZ2luKGJ5dGU6TGF5YS5CeXRlKTp2b2lke1xyXG4gICAgICAgIC8vb2ZmIFxyXG4gICAgICAgIGR6YXBwLkV2ZW50cy5vZmYoMCxcIlJFTEdcIiwgdGhpcyk7XHJcbiAgICAgICAgZHphcHAuTG9nZ2VyLmluZm8oXCJsb2dpbiBjYWxsYmFjay5cIik7XHJcbiAgICAgICAgbGV0IHN0YXR1Om51bWJlciA9IGJ5dGUuZ2V0VWludDE2KCk7XHJcblxyXG4gICAgICAgIGlmKGR6YXBwKXtcclxuICAgICAgICAgICAgIC8vIOabtOaWsOeOqeWutuaVsOaNrlxyXG4gICAgICAgICAgICBkemFwcC5QbGF5ZXIubUNsaWVudExvYWRTdGVwICA9IDM7XHJcbiAgICAgICAgICAgIGR6YXBwLlBsYXllci5tTGFzdFJvb21OYW1lICAgID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICAgICAgZHphcHAuUGxheWVyLm1MYXN0Um9vbUlkICAgICAgPSBieXRlLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGR6YXBwLlBsYXllci5tVXNlcklkICAgICAgICAgID0gYnl0ZS5nZXRJbnQzMigpO1xyXG4gICAgICAgICAgICBkemFwcC5QbGF5ZXIubUdhbWVLZXkgICAgICAgICA9IGJ5dGUuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGR6YXBwLlBsYXllci5tTWQ1ICAgICAgICAgICAgID0gYnl0ZS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICAgICAgZHphcHAuUGxheWVyLm1Jc05ld1VzZXIgICAgICAgPSBieXRlLmdldEJ5dGUoKTtcclxuICAgICAgICAgICAgZHphcHAuUGxheWVyLm1OaWNrTmFtZSAgICAgICAgPSBieXRlLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgICAgICBkemFwcC5QbGF5ZXIubUJCU1VybCAgICAgICAgICA9IGJ5dGUuZ2V0VVRGU3RyaW5nKCk7IFxyXG4gICAgICAgICAgICBkemFwcC5Mb2dnZXIuZXJyb3IoXCJVc2VySUQ6XCIrZHphcHAuUGxheWVyLm1Vc2VySWQpO1xyXG4gICAgICAgICAgICBkemFwcC5lbnRlckxvYmJ5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uQ2xpY2soKTp2b2lke1xyXG4gICAgICAgIC8vZHphcHAuTmV0LkxvZ2luVG9HQyhcIjExMVwiLFwiMTFcIiwwKVxyXG4gICAgICAgIGxldCBsb2dpbjpMb2dpbkhhbmRsZXIgPSBuZXcgTG9naW5IYW5kbGVyKCk7XHJcbiAgICAgICAgbG9naW4ubG9naW4oXCIxMVwiLFwiMTFcIiwwLExheWEuSGFuZGxlci5jcmVhdGUodGhpcyx0aGlzLmVudGVyTG9iYnkpKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IHVpIH0gZnJvbSBcIi4uLy4uL3VpL2xheWFNYXhVSVwiO1xyXG5pbXBvcnQgeyBkemFwcCB9IGZyb20gXCIuLi8uLi9NYWluXCI7XHJcbmltcG9ydCB7IGxhbnJlcyB9IGZyb20gXCIuLi9sYW5kbG9yZHMvY29uZnMvcmVzXCI7XHJcbmltcG9ydCBMYW5Mb2JieVZpZXcgZnJvbSBcIi4uL2xhbmRsb3Jkcy92aWV3cy9sYW5sb2JieVwiO1xyXG5pbXBvcnQgeyBzenJlcyB9IGZyb20gXCIuLi9zYW56aGFuZy9kZWZpbmUvc3pyZXNcIjtcclxuaW1wb3J0IGxhbkxvYmJ5RGF0YSBmcm9tIFwiLi4vbGFuZGxvcmRzL2RhdGEvbGFubG9iYnlkYXRhXCI7XHJcbmltcG9ydCBzemxvYmJ5dmlldyBmcm9tIFwiLi4vc2Fuemhhbmcvdmlld3Mvc3psb2JieVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZXNWaWV3IGV4dGVuZHMgdWkuZ2FtZXMuZ2xvYmFsdmlldy5nYW1lc1VJe1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubVNlcnZlckxpc3QgPSBuZXcgQXJyYXk8YW55PigpO1xyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1TZXJ2ZXJMaXN0OmFueSA9IG51bGw7XHJcblxyXG4gICAgZXZlbnRMaXN0ZW4oKTp2b2lke1xyXG4gICAgICAgIGR6YXBwLkV2ZW50cy5MaXN0ZW4oMSxcIlJFR0lcIix0aGlzLHRoaXMuZ2V0Um9vbUxpc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uRW5hYmxlKCk6dm9pZHtcclxuICAgICAgICB0aGlzLmJ0bkxhbi5vbihMYXlhLkV2ZW50LkNMSUNLLHRoaXMsdGhpcy5vcGVuR2FtZSxbMV0pO1xyXG4gICAgICAgIHRoaXMuYnRuU1oub24oTGF5YS5FdmVudC5DTElDSyx0aGlzLHRoaXMub3BlbkdhbWUsWzJdKTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuR2FtZShudW06bnVtYmVyKTp2b2lke1xyXG4gICAgICAgIGlmKG51bT09MSl7XHJcbiAgICAgICAgICAgIGR6YXBwLk5ldC5lbnRlckdhbWUoXCJxdWVyeVwiLFwiZGR6X2ZyZWVcIik7IFxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBsZXQgbGFuOnN6bG9iYnl2aWV3ID0gbmV3IHN6bG9iYnl2aWV3KCk7XHJcbiAgICAgICAgICAgIGR6YXBwLm9wZW5HYW1lKGxhbixzenJlcy5sb2JieSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Um9vbUxpc3QoZGF0YTpMYXlhLkJ5dGUpOnZvaWR7IFxyXG4gICAgICAgIGxhbkxvYmJ5RGF0YS5pbnN0YW5jZS5pbml0U2VydmVycyhkYXRhKTtcclxuICAgICAgICB0aGlzLm9wZW5ERFooKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgb3BlbkREWigpOnZvaWR7XHJcbiAgICAgICAgbGV0IGxhbjpMYW5Mb2JieVZpZXcgPSBuZXcgTGFuTG9iYnlWaWV3KCk7XHJcbiAgICAgICAgZHphcHAub3BlbkdhbWUobGFuLGxhbnJlcy5sb2JieSk7IFxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGNsYXNzIGxhbnJlc3sgXHJcbiAgICBwdWJsaWMgc3RhdGljIGxvYmJ5OmFueVtdID0gW1xyXG4gICAgICAgIC8vIHt1cmw6XCJnYW1lcy9sYW5kb3Jkcy9sb2JieS9tYWluLnBuZ1wiLCB0eXBlOkxheWEuTG9hZGVyLklNQUdFfSxcclxuICAgICAgICB7dXJsOlwiZ2FtZXMvbGFuZG9yZHMvbG9iYnkva3VhbmdrdWFuZy5za1wiLCB0eXBlOkxheWEuTG9hZGVyLkJVRkZFUn0sXHJcbiAgICAgICAge3VybDpcImdhbWVzL2xhbmRvcmRzL2xvYmJ5L2t1YW5na3VhbmcucG5nXCIsIHR5cGU6TGF5YS5Mb2FkZXIuSU1BR0V9LFxyXG4gICAgXTtcclxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIGxhbkxvYmJ5RGF0YXtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5tU2VydmVyTGlzdCA9IG5ldyBBcnJheTxhbnk+KCk7IFxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIG1JbnN0YW5jZTpsYW5Mb2JieURhdGE9bnVsbDtcclxuXHJcbiAgICBwcml2YXRlIG1TZXJ2ZXJMaXN0OmFueSA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgaW5zdGFuY2UoKXtcclxuICAgICAgICBpZihsYW5Mb2JieURhdGEubUluc3RhbmNlPT1udWxsKXtcclxuICAgICAgICAgICAgbGFuTG9iYnlEYXRhLm1JbnN0YW5jZSA9IG5ldyBsYW5Mb2JieURhdGEoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxhbkxvYmJ5RGF0YS5tSW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFNlcnZlcnMoKTpBcnJheTxhbnk+e1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1TZXJ2ZXJMaXN0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0U2VydmVycyhkYXRhOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICBsZXQgZ3JvdXBpZCA9IFwiXCI7IFxyXG4gICAgICAgIHRoaXMubVNlcnZlckxpc3QubGVuZ3RoPTA7XHJcbiAgICAgICAgbGV0IG5hbWUgPSBkYXRhLmdldFVURlN0cmluZygpO1xyXG4gICAgICAgIHdoaWxlKChncm91cGlkID0gZGF0YS5nZXRVVEZTdHJpbmcoKSkgIT0gXCJcIiYmZGF0YS5wb3M8ZGF0YS5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgaXRlbTogT2JqZWN0ID0ge307XHJcbiAgICAgICAgICAgIGl0ZW1bXCJncm91cGlkXCJdICAgICAgICAgPSBncm91cGlkO1xyXG4gICAgICAgICAgICBpdGVtW1wiZ3JvdXBuYW1lXCJdICAgICAgID0gZGF0YS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICAgICAgaXRlbVtcImdhbWVwZWlsdlwiXSAgICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICAgICAgaXRlbVtcImlwXCJdICAgICAgICAgICAgICA9IGRhdGEuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJwb3J0XCJdICAgICAgICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJjdXJyb25saW5lXCJdICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJtYXhvbmxpbmVcIl0gICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJpc2d1aWxkcm9vbVwiXSAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJpc3RvdXJyb29tXCJdICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJhdF9sZWFzdF9nb2xkXCJdICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJhdF9tb3N0X2dvbGRcIl0gICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJpc2hpZ2hyb29tXCJdICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJpc2h1YW5sZVwiXSAgICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJub2NoZWF0XCJdICAgICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJjaG91c2h1aVwiXSAgICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgICAgIGl0ZW1bXCJuYW1lXCJdICAgICAgICAgICAgPSBuYW1lO1xyXG4gICAgICAgICAgICB0aGlzLm1TZXJ2ZXJMaXN0LnB1c2goaXRlbSk7XHJcbiAgICAgICAgfSBcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyB1aSB9IGZyb20gXCIuLi8uLi8uLi91aS9sYXlhTWF4VUlcIjtcclxuaW1wb3J0IHsgZHphcHAgfSBmcm9tIFwiLi4vLi4vLi4vTWFpblwiO1xyXG5pbXBvcnQgbGFuTG9iYnlEYXRhIGZyb20gXCIuLi9kYXRhL2xhbmxvYmJ5ZGF0YVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGFuTG9iYnlWaWV3IGV4dGVuZHMgdWkuZ2FtZXMubGFuZHJvZHMuTGFuTG9iYnlVSXtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuICBcclxuICAgIG9uRW5hYmxlKCk6dm9pZHsgIFxyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW4oKTtcclxuICAgICAgICB0aGlzLnNob3dSb29tcygpOyBcclxuICAgICAgICB0aGlzLmV2ZW50QmluZGluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50TGlzdGVuKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5FdmVudHMuTGlzdGVuKDEsXCJnc19jb25uZXRlZFwiLHRoaXMsdGhpcy5zdGFydEdhbWUpO1xyXG4gICAgfVxyXG4gICAgZXZlbnRCaW5kaW5nKCk6dm9pZHtcclxuICAgICAgICB0aGlzLmJ0bkJhY2sub24oTGF5YS5FdmVudC5DTElDSyx0aGlzLHRoaXMuZ290b0xvYmJ5KTtcclxuICAgICAgICB0aGlzLmJ0blJvb20ub24oTGF5YS5FdmVudC5DTElDSyx0aGlzLHRoaXMuZW50ZXJSb29tKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93Um9vbXMoKTp2b2lke1xyXG4gICAgICAgIGxldCBzZXJ2ZXJzOkFycmF5PGFueT4gPSBsYW5Mb2JieURhdGEuaW5zdGFuY2UuZ2V0U2VydmVycygpO1xyXG4gICAgICAgIHRoaXMubGJsVGlwcy50ZXh0ID0gXCJXZWxjb21lIFwiK2R6YXBwLlBsYXllci5tTmlja05hbWUrXCIsaWQ6XCIrZHphcHAuUGxheWVyLm1Vc2VySWQrXCJcXG4gUm9vbSBMaXN0IENvdW50OlwiK3NlcnZlcnMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGdvdG9Mb2JieSgpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuZW50ZXJMb2JieSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGVudGVyUm9vbSgpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuTmV0LmVudGVyUm9vbShcImVudGVyXCIsXCJkZHpfZnJlZVwiLCBwYXJzZUludChsYW5Mb2JieURhdGEuaW5zdGFuY2UuZ2V0U2VydmVycygpWzBdLmdyb3VwaWQpKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgbVJvb21JZDpudW1iZXI9MDtcclxuICAgIHN0YXJ0R2FtZShieXRlOkxheWEuQnl0ZSk6dm9pZHtcclxuICAgICAgICAgdGhpcy5tUm9vbUlkID0gYnl0ZS5nZXRJbnQzMigpO1xyXG4gICAgICAgICBsZXQgcmVzdWx0Om51bWJlciA9IGJ5dGUuZ2V0SW50MzIoKTtcclxuICAgICAgICAgaWYoMT09cmVzdWx0KXtcclxuICAgICAgICAgICAgIGR6YXBwLnNob3dUb2FzdChcIui/m+WFpeaIv+mXtC4uLnJvb21pZDpcIit0aGlzLm1Sb29tSWQpO1xyXG4gICAgICAgICAgICAgdGhpcy5idG5TZW5kLm9uKExheWEuRXZlbnQuQ0xJQ0ssdGhpcyx0aGlzLnNlbmRNZXNzYWdlKTtcclxuICAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNlbmRNZXNzYWdlKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5OZXQuc2VuZE1zZ1BhY2thZ2UodGhpcy5tUm9vbUlkLFwieHh4eHhcIiwxLDIsMyk7XHJcbiAgICAgICAgZHphcHAuTmV0LnNlbmRNc2codGhpcy5tUm9vbUlkLFwieHh4eHhcIixuZXcgTGF5YS5CeXRlKCkpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjbGFzcyBzenJlc3sgXHJcbiAgICBwdWJsaWMgc3RhdGljIGxvYmJ5OmFueVtdID0gW1xyXG4gICAgICAgIHt1cmw6XCJnYW1lcy9zYW56aGFuZy9tYWluMS5wbmdcIiwgdHlwZTpMYXlhLkxvYWRlci5JTUFHRX1cclxuICAgIF07XHJcbn0iLCJpbXBvcnQgeyB1aSB9IGZyb20gXCIuLi8uLi8uLi91aS9sYXlhTWF4VUlcIjtcclxuaW1wb3J0IHsgZHphcHAgfSBmcm9tIFwiLi4vLi4vLi4vTWFpblwiO1xyXG4vL2V4cG9ydCBtb2R1bGUgZHpnYW1lc3sgXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHN6bG9iYnl2aWV3IGV4dGVuZHMgdWkuZ2FtZXMuc2FuemhhbmdfZXhhbXBsZS5zemxvYmJ5VUl7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9wdWJsaWMgYnRuQmFjazpMYXlhLkJ1dHRvbjtcclxuXHJcbiAgICBvbkVuYWJsZSgpOnZvaWR7XHJcbiAgICAgICAvLyB0aGlzLmJ0bkJhY2sub24oTGF5YS5FdmVudC5DTElDSyx0aGlzLHRoaXMuZ290b0xvYmJ5KTsgXHJcbiAgICB9XHJcblxyXG4gICAgZ290b0xvYmJ5KCk6dm9pZHtcclxuICAgICAgICBkemFwcC5lbnRlckxvYmJ5KCk7XHJcbiAgICB9XHJcbn1cclxuLy99IiwiZXhwb3J0IGNsYXNzIHNvaGFyZXN7IFxyXG4gICAgcHVibGljIHN0YXRpYyBsb2JieTphbnlbXSA9IFtcclxuICAgICAgICAvLyB7dXJsOlwicmVzL2F0bGFzL2dhbWVzL3NvaGEvbG9iYnkuYXRsYXNcIn0sXHJcbiAgICAgICAge3VybDpcImdhbWVzL3NvaGEvbG9iYnkvYmcuanBnXCIsIHR5cGU6TGF5YS5Mb2FkZXIuSU1BR0V9LFxyXG4gICAgXTtcclxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwSW5mb3tcclxuXHJcbiAgICAvL+aIv+mXtElEXHJcbiAgICBwdWJsaWMgbUlkOm51bWJlciA9IDA7XHJcbiAgICAvL+aIv+mXtOWQjeWtl1xyXG4gICAgcHVibGljIG1OYW1lOnN0cmluZyA9IFwiXCI7XHJcbiAgICAvL+aIv+mXtOi1lOeOh1xyXG4gICAgcHVibGljIG1HYW1lUGVpbHY6bnVtYmVyID0gMDtcclxuICAgIC8v5oi/6Ze0aXBcclxuICAgIHB1YmxpYyBtSXA6c3RyaW5nID0gXCJcIlxyXG4gICAgLy/miL/pl7Tnq6/lj6NcclxuICAgIHB1YmxpYyBtUG9ydDpudW1iZXIgPSAwO1xyXG4gICAgLy/lvZPliY3lnKjnur/kurrmlbBcclxuICAgIHB1YmxpYyBtQ3Vyck9ubGluZTpudW1iZXIgPSAwO1xyXG4gICAgLy/mnIDlpKflnKjnur/kurrmlbBcclxuICAgIHB1YmxpYyBtTWF4T25saW5lOm51bWJlciA9IDA7XHJcbiAgICAvL+aYr+WQpuWFrOS8muaIv+mXtFxyXG4gICAgcHVibGljIG1Jc0d1aWxkUm9vbTpudW1iZXIgPSAwO1xyXG4gICAgLy/mmK/lkKbnq57mioDlnLrmiL/pl7RcclxuICAgIHB1YmxpYyBtSXNUb3VyUm9vbTpudW1iZXIgPSAwO1xyXG4gICAgLy/miL/pl7TmnIDlsI/mkLrluKZcclxuICAgIHB1YmxpYyBtQXRMZWFzdEdvbGQ6bnVtYmVyID0gMDtcclxuICAgIC8v5oi/6Ze05pyA5aSn5pC65bimXHJcbiAgICBwdWJsaWMgbUF0TW9zdEdvbGQ6bnVtYmVyID0gMDtcclxuICAgIC8v5piv5ZCm6IO95Z2Q5LiLXHJcbiAgICBwdWJsaWMgbUlzQ2FuU2l0Om51bWJlciA9IDA7XHJcbiAgICAvL+aYr+WQpuasouS5kOixhuWculxyXG4gICAgcHVibGljIG1pc0h1YW5sZTpudW1iZXIgPSAwO1xyXG4gICAgLy/mmK/lkKbmlL7kvZzlvIrlnLpcclxuICAgIHB1YmxpYyBtTm9DaGVhdDpudW1iZXIgPSAwO1xyXG4gICAgLy/miL/pl7Tmir3msLQo5peg55So5Y+C5pWw77yM5pyJ5Lqb5ri45oiP5piv5Yqo5oCB5oq95rC0KVxyXG4gICAgcHVibGljIG1DaG91c2h1aTpudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBzZXREYXRhKGdyb3VwSWQ6bnVtYmVyLCBkYXRhOkxheWEuQnl0ZSl7XHJcbiAgICAgICAgdGhpcy5tSWQgICAgICAgICAgICA9IGdyb3VwSWQ7XHJcbiAgICAgICAgdGhpcy5tTmFtZSAgICAgICAgICA9IGRhdGEuZ2V0VVRGU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5tR2FtZVBlaWx2ICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1JcCAgICAgICAgICAgID0gZGF0YS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLm1Qb3J0ICAgICAgICAgID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUN1cnJPbmxpbmUgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tTWF4T25saW5lICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1Jc0d1aWxkUm9vbSAgID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUlzVG91clJvb20gICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5tQXRMZWFzdEdvbGQgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1BdE1vc3RHb2xkICAgID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUlzQ2FuU2l0ICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICAgICAgdGhpcy5taXNIdWFubGUgICAgICA9IGRhdGEuZ2V0SW50MzIoKTtcclxuICAgICAgICB0aGlzLm1Ob0NoZWF0ICAgICAgID0gZGF0YS5nZXRJbnQzMigpO1xyXG4gICAgICAgIHRoaXMubUNob3VzaHVpICAgICAgPSBkYXRhLmdldEludDMyKCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyB1aSB9IGZyb20gXCIuLi8uLi8uLi91aS9sYXlhTWF4VUlcIjtcclxuaW1wb3J0IHsgZHphcHAgfSBmcm9tIFwiLi4vLi4vLi4vTWFpblwiO1xyXG5pbXBvcnQgR3JvdXBJbmZvIGZyb20gXCIuLi9kYXRhL0dyb3VwSW5mb1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29oYUxvYmJ5VmlldyBleHRlbmRzIHVpLmdhbWVzLnNvaGEuU29oYUxvYmJ5VUl7XHJcbiAgICAvL+aIv+mXtOWIl+ihqOaVsOaNrlxyXG4gICAgcHJpdmF0ZSBtUm9vbUxpc3Q6QXJyYXk8R3JvdXBJbmZvPiA9IG51bGw7XHJcbiAgICAvL+WcuuaZr+aYr+WQpuWKoOi9veWujOaIkFxyXG4gICAgcHJpdmF0ZSBtTG9hZE9LOkJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW4oKTtcclxuICAgIH1cclxuICBcclxuICAgIG9uRW5hYmxlKCk6dm9pZHsgIFxyXG4gICAgICAgIHRoaXMubUxvYWRPSyA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRCaW5kaW5nKCk7XHJcbiAgICAgICAgLy/lnLrmma/liqDovb3lrozmiJDvvIzlsJ3or5XmmL7npLrmiL/pl7TliJfooahcclxuICAgICAgICB0aGlzLnNob3dSb29tcygpOyBcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGV2ZW50TGlzdGVuKCk6dm9pZHtcclxuICAgICAgICBkemFwcC5FdmVudHMuTGlzdGVuKDEsXCJSRUdJXCIsdGhpcyx0aGlzLm9uUmVjdlJvb21MaXN0KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZXZlbnRCaW5kaW5nKCk6dm9pZHtcclxuICAgICAgICB0aGlzLmJ0bkJhY2sub24oTGF5YS5FdmVudC5DTElDSyx0aGlzLHRoaXMuZ290b0xvYmJ5KTtcclxuICAgICAgICAvLyB0aGlzLmJ0blJvb20ub24oTGF5YS5FdmVudC5DTElDSyx0aGlzLHRoaXMuZW50ZXJSb29tKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdvdG9Mb2JieSgpOnZvaWR7XHJcbiAgICAgICAgZHphcHAuZW50ZXJMb2JieSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25SZWN2Um9vbUxpc3QoZGF0YTpMYXlhLkJ5dGUpe1xyXG4gICAgICAgIHRoaXMubVJvb21MaXN0ID0gbmV3IEFycmF5KCk7XHJcbiAgICAgIFxyXG4gICAgICAgIGxldCBncm91cElkOnN0cmluZyA9IFwiXCI7IFxyXG4gICAgICAgIGxldCBncm91cEluZm86R3JvdXBJbmZvO1xyXG4gICAgICAgIGxldCBuYW1lID0gZGF0YS5nZXRVVEZTdHJpbmcoKTtcclxuICAgICAgICB3aGlsZSgoZ3JvdXBJZCA9IGRhdGEuZ2V0VVRGU3RyaW5nKCkpICE9IFwiXCIgJiYgZGF0YS5wb3MgPCBkYXRhLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdyb3VwSW5mbyA9IG5ldyBHcm91cEluZm8oKTtcclxuICAgICAgICAgICAgZ3JvdXBJbmZvLnNldERhdGEoTnVtYmVyKGdyb3VwSWQpLCBkYXRhKVxyXG4gICAgICAgICAgICB0aGlzLm1Sb29tTGlzdC5wdXNoKGdyb3VwSW5mbyk7XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgLy/mlLbliLDmlbDmja7lrozmiJDvvIzlsJ3or5XmmL7npLrmiL/pl7TliJfooahcclxuICAgICAgICB0aGlzLnNob3dSb29tcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2hvd1Jvb21zKCk6dm9pZHtcclxuICAgICAgICBpZighdGhpcy5tTG9hZE9LIHx8ICF0aGlzLm1Sb29tTGlzdCkgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBcclxuICAgIH1cclxufVxyXG4iLCIvKipUaGlzIGNsYXNzIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGJ5IExheWFBaXJJREUsIHBsZWFzZSBkbyBub3QgbWFrZSBhbnkgbW9kaWZpY2F0aW9ucy4gKi9cbmltcG9ydCBCYXNlVmlldyBmcm9tIFwiLi4vZHpnYW1lcy9jb21wb25lbnRzL2R6cGFnZS9CYXNlVmlld1wiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4uL2R6Z2FtZXMvY29tcG9uZW50cy9kenBhZ2UvQmFzZURhaWxvZ1wiO1xuaW1wb3J0IEJhc2VTY2VuZSBmcm9tIFwiLi4vZHpnYW1lcy9jb21wb25lbnRzL2R6cGFnZS9CYXNlU2NlbmVcIjtcbmV4cG9ydCBtb2R1bGUgdWkuZHpnYW1lLmNvbW1vbiB7XHJcbiAgICBleHBvcnQgY2xhc3MgTG9hZGluZ1VJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG5cdFx0cHVibGljIGxibFRpcHM6TGF5YS5MYWJlbDtcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVZpZXdcIixcInByb3BzXCI6e1wid2lkdGhcIjoxNzI4LFwiaGVpZ2h0XCI6ODY0fSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6Mzc1LFwieFwiOjY2OCxcInZhclwiOlwibGJsVGlwc1wiLFwidGV4dFwiOlwibG9hZGluZy4uLlwiLFwiZm9udFNpemVcIjozNSxcImNvbG9yXCI6XCIjRkZGRkZGXCIsXCJhbmNob3JZXCI6MC41LFwiYW5jaG9yWFwiOjAuNX0sXCJjb21wSWRcIjozfV0sXCJsb2FkTGlzdFwiOltdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhMb2FkaW5nVUkudWlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgY2xhc3MgTWFza1VJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgIHVpVmlldzphbnkgPXtcInR5cGVcIjpcIkJhc2VWaWV3XCIsXCJwcm9wc1wiOntcIndpZHRoXCI6MTcyOCxcInJlbmRlclR5cGVcIjpcIm1hc2tcIixcImhlaWdodFwiOjg2NCxcImF1dG9EZXN0cm95QXRDbG9zZWRcIjp0cnVlfSxcImNvbXBJZFwiOjIsXCJsb2FkTGlzdFwiOltdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhNYXNrVUkudWlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgY2xhc3MgUHJlbG9hZFVJIGV4dGVuZHMgQmFzZVNjZW5lIHtcclxuXHRcdHB1YmxpYyBsYmxUaXBzOkxheWEuTGFiZWw7XG5cdFx0cHVibGljIGJ0bkxvZ2luOkxheWEuQnV0dG9uO1xuICAgICAgICBwdWJsaWMgc3RhdGljICB1aVZpZXc6YW55ID17XCJ0eXBlXCI6XCJCYXNlU2NlbmVcIixcInByb3BzXCI6e1wid2lkdGhcIjoxNzI4LFwibmFtZVwiOlwiZ2FtZUJveFwiLFwiaGVpZ2h0XCI6ODY0fSxcImNvbXBJZFwiOjEsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJTcHJpdGVcIixcInByb3BzXCI6e1wieVwiOjAsXCJ4XCI6MCxcIndpZHRoXCI6MTMzNixcIm5hbWVcIjpcIlVJXCIsXCJoZWlnaHRcIjo3NTB9LFwiY29tcElkXCI6MTQsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6Mzc1LFwieFwiOjY2OCxcInZhclwiOlwibGJsVGlwc1wiLFwidmFsaWduXCI6XCJtaWRkbGVcIixcInRleHRcIjpcIkdhbWUgaXMgc3RhcnRpbmcsUGxzIHdhaXQuLi5cIixcImZvbnRTaXplXCI6NDAsXCJjb2xvclwiOlwiI2M2MzAyZVwiLFwiYW5jaG9yWVwiOjAuNSxcImFuY2hvclhcIjowLjUsXCJhbGlnblwiOlwiY2VudGVyXCJ9LFwiY29tcElkXCI6MTZ9LHtcInR5cGVcIjpcIlNwcml0ZVwiLFwicHJvcHNcIjp7XCJ5XCI6MzI5LFwieFwiOjMyNixcInRleHR1cmVcIjpcInRlc3QvYzEucG5nXCJ9LFwiY29tcElkXCI6MjJ9LHtcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6MzY3LjUsXCJ4XCI6OTMxLFwidmlzaWJsZVwiOmZhbHNlLFwidmFyXCI6XCJidG5Mb2dpblwiLFwic2tpblwiOlwiY29tcC9idXR0b24ucG5nXCIsXCJsYWJlbFwiOlwibG9naW5cIn0sXCJjb21wSWRcIjoyNX1dfV0sXCJsb2FkTGlzdFwiOltcInRlc3QvYzEucG5nXCIsXCJjb21wL2J1dHRvbi5wbmdcIl0sXCJsb2FkTGlzdDNEXCI6W119O1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7IHN1cGVyKCl9XHJcbiAgICAgICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KFByZWxvYWRVSS51aVZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBQcm9ncmVzc1VJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG5cdFx0cHVibGljIGxibFRpcHM6TGF5YS5MYWJlbDtcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVZpZXdcIixcInByb3BzXCI6e1wid2lkdGhcIjoxNzI4LFwiaGVpZ2h0XCI6NzUwfSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6Mzc1LFwieFwiOjY2OCxcInZhclwiOlwibGJsVGlwc1wiLFwiYW5jaG9yWVwiOjAuNSxcImFuY2hvclhcIjowLjV9LFwiY29tcElkXCI6M31dLFwibG9hZExpc3RcIjpbXSxcImxvYWRMaXN0M0RcIjpbXX07XHJcbiAgICAgICAgY29uc3RydWN0b3IoKXsgc3VwZXIoKX1cclxuICAgICAgICBjcmVhdGVDaGlsZHJlbigpOnZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5jcmVhdGVDaGlsZHJlbigpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVZpZXcoUHJvZ3Jlc3NVSS51aVZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBUb2FzdFVJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG5cdFx0cHVibGljIGxibFRpcHM6TGF5YS5MYWJlbDtcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVZpZXdcIixcInByb3BzXCI6e1wid2lkdGhcIjoxNzI4LFwiaGVpZ2h0XCI6ODY0fSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6Mzc1LFwieFwiOjY2OCxcInZhclwiOlwibGJsVGlwc1wiLFwidGV4dFwiOlwiLVwiLFwiZm9udFNpemVcIjo0NSxcImNvbG9yXCI6XCIjRkZGRkZGXCIsXCJhbmNob3JZXCI6MC41LFwiYW5jaG9yWFwiOjAuNX0sXCJjb21wSWRcIjozfV0sXCJsb2FkTGlzdFwiOltdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhUb2FzdFVJLnVpVmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBtb2R1bGUgdWkuZHpnYW1lLkdhbWVMb2JieSB7XHJcbiAgICBleHBvcnQgY2xhc3MgTG9iYnlVSSBleHRlbmRzIEJhc2VTY2VuZSB7XHJcblx0XHRwdWJsaWMgYnRuRERaOkxheWEuQnV0dG9uO1xuXHRcdHB1YmxpYyBidG5Sb29tOkxheWEuQnV0dG9uO1xuXHRcdHB1YmxpYyBidG5Mb2dpbjpMYXlhLkJ1dHRvbjtcblx0XHRwdWJsaWMgYnRuU29oYTpMYXlhLkJ1dHRvbjtcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVNjZW5lXCIsXCJwcm9wc1wiOntcIndpZHRoXCI6MTcyOCxcIm5hbWVcIjpcIkxvYmJ5XCIsXCJoZWlnaHRcIjo4NjR9LFwiY29tcElkXCI6MixcImNoaWxkXCI6W3tcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6MzUyLFwieFwiOjU0MSxcInZhclwiOlwiYnRuRERaXCIsXCJza2luXCI6XCJjb21wL2J1dHRvbi5wbmdcIixcImxhYmVsXCI6XCLmlpflnLDkuLtcIn0sXCJjb21wSWRcIjozfSx7XCJ0eXBlXCI6XCJCdXR0b25cIixcInByb3BzXCI6e1wieVwiOjM1MixcInhcIjo4MDEsXCJ2aXNpYmxlXCI6ZmFsc2UsXCJ2YXJcIjpcImJ0blJvb21cIixcInNraW5cIjpcImNvbXAvYnV0dG9uLnBuZ1wiLFwibGFiZWxcIjpcIui/m+WFpeaIv+mXtFwifSxcImNvbXBJZFwiOjV9LHtcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6MzUyLFwieFwiOjQxMSxcInZhclwiOlwiYnRuTG9naW5cIixcInNraW5cIjpcImNvbXAvYnV0dG9uLnBuZ1wiLFwibGFiZWxcIjpcImxvZ2luIEdDXCJ9LFwiY29tcElkXCI6Nn0se1widHlwZVwiOlwiQnV0dG9uXCIsXCJwcm9wc1wiOntcInlcIjozNTIsXCJ4XCI6NjcxLFwid2lkdGhcIjo3NSxcInZhclwiOlwiYnRuU29oYVwiLFwic2tpblwiOlwiY29tcC9idXR0b24ucG5nXCIsXCJsYWJlbFwiOlwi5bm46L+Q5LqU5bygXCIsXCJoZWlnaHRcIjoyM30sXCJjb21wSWRcIjoxN31dLFwibG9hZExpc3RcIjpbXCJjb21wL2J1dHRvbi5wbmdcIl0sXCJsb2FkTGlzdDNEXCI6W119O1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7IHN1cGVyKCl9XHJcbiAgICAgICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KExvYmJ5VUkudWlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IG1vZHVsZSB1aS5nYW1lcy5nbG9iYWx2aWV3IHtcclxuICAgIGV4cG9ydCBjbGFzcyBnYW1lc1VJIGV4dGVuZHMgQmFzZVZpZXcge1xyXG5cdFx0cHVibGljIGJ0bkxhbjpMYXlhLkJ1dHRvbjtcblx0XHRwdWJsaWMgYnRuU1o6TGF5YS5CdXR0b247XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgIHVpVmlldzphbnkgPXtcInR5cGVcIjpcIkJhc2VWaWV3XCIsXCJwcm9wc1wiOntcIndpZHRoXCI6NTAwLFwiaGVpZ2h0XCI6MzAwfSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJCdXR0b25cIixcInByb3BzXCI6e1wieVwiOjUwLFwieFwiOjUwLFwid2lkdGhcIjo3OCxcInZhclwiOlwiYnRuTGFuXCIsXCJza2luXCI6XCJjb21wL2J1dHRvbi5wbmdcIixcImxhYmVsXCI6XCLmlpflnLDkuLtcIixcImhlaWdodFwiOjQ5fSxcImNvbXBJZFwiOjN9LHtcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6NjMsXCJ4XCI6MTY1LFwidmFyXCI6XCJidG5TWlwiLFwic2tpblwiOlwiY29tcC9idXR0b24ucG5nXCIsXCJsYWJlbFwiOlwi5LiJ5bygXCJ9LFwiY29tcElkXCI6NH1dLFwibG9hZExpc3RcIjpbXCJjb21wL2J1dHRvbi5wbmdcIl0sXCJsb2FkTGlzdDNEXCI6W119O1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7IHN1cGVyKCl9XHJcbiAgICAgICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KGdhbWVzVUkudWlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IG1vZHVsZSB1aS5nYW1lcy5sYW5kcm9kcyB7XHJcbiAgICBleHBvcnQgY2xhc3MgTGFuTG9iYnlVSSBleHRlbmRzIEJhc2VTY2VuZSB7XHJcblx0XHRwdWJsaWMgYnRuQmFjazpMYXlhLkJ1dHRvbjtcblx0XHRwdWJsaWMgbGJsVGlwczpMYXlhLkxhYmVsO1xuXHRcdHB1YmxpYyBidG5Sb29tOkxheWEuQnV0dG9uO1xuXHRcdHB1YmxpYyBidG5TZW5kOkxheWEuQnV0dG9uO1xuICAgICAgICBwdWJsaWMgc3RhdGljICB1aVZpZXc6YW55ID17XCJ0eXBlXCI6XCJCYXNlU2NlbmVcIixcInByb3BzXCI6e1wid2lkdGhcIjoxMzM2LFwiaGVpZ2h0XCI6NzUwfSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJTcHJpdGVcIixcInByb3BzXCI6e1wieVwiOjAsXCJ4XCI6MCxcIndpZHRoXCI6MTMzNixcInRleHR1cmVcIjpcImdhbWVzL2xhbmRvcmRzL2xvYmJ5L21haW4ucG5nXCIsXCJoZWlnaHRcIjo3NTB9LFwiY29tcElkXCI6M30se1widHlwZVwiOlwiQnV0dG9uXCIsXCJwcm9wc1wiOntcInlcIjo2NCxcInhcIjo2MixcIndpZHRoXCI6MTgzLFwidmFyXCI6XCJidG5CYWNrXCIsXCJza2luXCI6XCJjb21wL2J1dHRvbi5wbmdcIixcImxhYmVsU2l6ZVwiOjQwLFwibGFiZWxcIjpcIui/lOWbnuWkp+WOhVwiLFwiaGVpZ2h0XCI6MTA1fSxcImNvbXBJZFwiOjR9LHtcInR5cGVcIjpcIkxhYmVsXCIsXCJwcm9wc1wiOntcInlcIjo2MDIsXCJ4XCI6Mzc3LFwidmFyXCI6XCJsYmxUaXBzXCIsXCJ0ZXh0XCI6XCJsYWJlbFwifSxcImNvbXBJZFwiOjV9LHtcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6MjA4LFwieFwiOjcwMyxcIndpZHRoXCI6MTgxLFwidmFyXCI6XCJidG5Sb29tXCIsXCJza2luXCI6XCJjb21wL2J1dHRvbi5wbmdcIixcImxhYmVsXCI6XCLov5vlhaXnrKzkuIDkuKrmiL/pl7RcIixcImhlaWdodFwiOjExM30sXCJjb21wSWRcIjo2fSx7XCJ0eXBlXCI6XCJCdXR0b25cIixcInByb3BzXCI6e1wieVwiOjYwMixcInhcIjoxMDc2LFwidmFyXCI6XCJidG5TZW5kXCIsXCJza2luXCI6XCJjb21wL2J1dHRvbi5wbmdcIixcImxhYmVsXCI6XCLlj5HpgIHmtojmga9cIn0sXCJjb21wSWRcIjo3fV0sXCJsb2FkTGlzdFwiOltcImdhbWVzL2xhbmRvcmRzL2xvYmJ5L21haW4ucG5nXCIsXCJjb21wL2J1dHRvbi5wbmdcIl0sXCJsb2FkTGlzdDNEXCI6W119O1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7IHN1cGVyKCl9XHJcbiAgICAgICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KExhbkxvYmJ5VUkudWlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IG1vZHVsZSB1aS5nYW1lcy5sb2JieSB7XHJcbiAgICBleHBvcnQgY2xhc3MgR2FtZUxvYmJ5VUkgZXh0ZW5kcyBCYXNlVmlldyB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVZpZXdcIixcInByb3BzXCI6e1wid2lkdGhcIjoxNzI4LFwiaGVpZ2h0XCI6ODY0fSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJCdXR0b25cIixcInByb3BzXCI6e1wieVwiOjMyNyxcInhcIjo1MjAsXCJza2luXCI6XCJjb21wL2J1dHRvbi5wbmdcIixcImxhYmVsXCI6XCJsYWJlbFwifSxcImNvbXBJZFwiOjN9XSxcImxvYWRMaXN0XCI6W1wiY29tcC9idXR0b24ucG5nXCJdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhHYW1lTG9iYnlVSS51aVZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgbW9kdWxlIHVpLmdhbWVzLnNhbnpoYW5nX2V4YW1wbGUge1xyXG4gICAgZXhwb3J0IGNsYXNzIHN6bG9iYnlVSSBleHRlbmRzIEJhc2VTY2VuZSB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyAgdWlWaWV3OmFueSA9e1widHlwZVwiOlwiQmFzZVNjZW5lXCIsXCJwcm9wc1wiOntcIndpZHRoXCI6NTAwLFwiaGVpZ2h0XCI6MzAwfSxcImNvbXBJZFwiOjIsXCJjaGlsZFwiOlt7XCJ0eXBlXCI6XCJTcHJpdGVcIixcInByb3BzXCI6e1wieVwiOjAsXCJ4XCI6MCxcIndpZHRoXCI6MTMzNixcInRleHR1cmVcIjpcImdhbWVzL3NhbnpoYW5nL21haW4xLnBuZ1wiLFwiaGVpZ2h0XCI6NzUwfSxcImNvbXBJZFwiOjR9XSxcImxvYWRMaXN0XCI6W1wiZ2FtZXMvc2FuemhhbmcvbWFpbjEucG5nXCJdLFwibG9hZExpc3QzRFwiOltdfTtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpeyBzdXBlcigpfVxyXG4gICAgICAgIGNyZWF0ZUNoaWxkcmVuKCk6dm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLmNyZWF0ZUNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmlldyhzemxvYmJ5VUkudWlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IG1vZHVsZSB1aS5nYW1lcy5zb2hhIHtcclxuICAgIGV4cG9ydCBjbGFzcyBTb2hhTG9iYnlVSSBleHRlbmRzIEJhc2VTY2VuZSB7XHJcblx0XHRwdWJsaWMgYnRuQmFjazpMYXlhLkJ1dHRvbjtcblx0XHRwdWJsaWMgaW1nX3Jvb20xOkxheWEuSW1hZ2U7XG5cdFx0cHVibGljIGltZ19yb29tMjpMYXlhLkltYWdlO1xuXHRcdHB1YmxpYyBpbWdfcm9vbTM6TGF5YS5JbWFnZTtcblx0XHRwdWJsaWMgaW1nX3Jvb200OkxheWEuSW1hZ2U7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgIHVpVmlldzphbnkgPXtcInR5cGVcIjpcIkJhc2VTY2VuZVwiLFwicHJvcHNcIjp7XCJ3aWR0aFwiOjE3MjgsXCJoZWlnaHRcIjo4NjR9LFwiY29tcElkXCI6MixcImNoaWxkXCI6W3tcInR5cGVcIjpcIlNwcml0ZVwiLFwicHJvcHNcIjp7XCJ5XCI6MCxcInhcIjowLFwidGV4dHVyZVwiOlwiZ2FtZXMvc29oYS9sb2JieS9iZy5qcGdcIn0sXCJjb21wSWRcIjoxM30se1widHlwZVwiOlwiU3ByaXRlXCIsXCJwcm9wc1wiOntcInlcIjoyNyxcInhcIjo3MzcsXCJ0ZXh0dXJlXCI6XCJnYW1lcy9zb2hhL2xvYmJ5LzMucG5nXCJ9LFwiY29tcElkXCI6MTV9LHtcInR5cGVcIjpcIkJ1dHRvblwiLFwicHJvcHNcIjp7XCJ5XCI6NDAsXCJ4XCI6NDIsXCJ2YXJcIjpcImJ0bkJhY2tcIixcInNraW5cIjpcImdhbWVzL3NvaGEvbG9iYnkvMS5wbmdcIn0sXCJjb21wSWRcIjoxNH0se1widHlwZVwiOlwiSW1hZ2VcIixcInByb3BzXCI6e1wieVwiOjE5MSxcInhcIjoxMzAsXCJ2YXJcIjpcImltZ19yb29tMVwiLFwic2tpblwiOlwiZ2FtZXMvc29oYS9sb2JieS81LnBuZ1wifSxcImNvbXBJZFwiOjY1LFwiY2hpbGRcIjpbe1widHlwZVwiOlwiU3ByaXRlXCIsXCJwcm9wc1wiOntcInlcIjoyODYsXCJ4XCI6MTYsXCJ0ZXh0dXJlXCI6XCJnYW1lcy9zb2hhL2xvYmJ5LzIucG5nXCIsXCJzY2FsZVlcIjowLjgsXCJzY2FsZVhcIjowLjh9LFwiY29tcElkXCI6NDZ9LHtcInR5cGVcIjpcIkZvbnRDbGlwXCIsXCJwcm9wc1wiOntcInlcIjoyOTcsXCJ4XCI6NTAsXCJ3aWR0aFwiOjI1MCxcInZhbHVlXCI6XCIyMDAtMjDkuIdcIixcInNwYWNlWFwiOi0yLFwic2tpblwiOlwiZ2FtZXMvc29oYS9sb2JieS84LnBuZ1wiLFwic2hlZXRcIjpcIi0wMTIzNDU2Nzg55LiH5Lq/XCIsXCJuYW1lXCI6XCJsYmxfbGltaXRcIixcImhlaWdodFwiOjM2LFwiYWxpZ25cIjpcImNlbnRlclwifSxcImNvbXBJZFwiOjQ3fSx7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6MzcwLFwieFwiOjQzLFwid2lkdGhcIjoyNTAsXCJ0ZXh0XCI6XCLmu6Ey5bGA6YCB56S85Yi4eDFcIixcIm5hbWVcIjpcImxibF9kZXNjXCIsXCJoZWlnaHRcIjozMixcImZvbnRTaXplXCI6MzAsXCJmb250XCI6XCJNaWNyb3NvZnQgWWFIZWlcIixcImNvbG9yXCI6XCIjZmZmZmZmXCIsXCJhbGlnblwiOlwiY2VudGVyXCJ9LFwiY29tcElkXCI6NDh9XX0se1widHlwZVwiOlwiSW1hZ2VcIixcInByb3BzXCI6e1wieVwiOjE5MSxcInhcIjo1MDgsXCJ2YXJcIjpcImltZ19yb29tMlwiLFwic2tpblwiOlwiZ2FtZXMvc29oYS9sb2JieS80LnBuZ1wifSxcImNvbXBJZFwiOjY2LFwiY2hpbGRcIjpbe1widHlwZVwiOlwiU3ByaXRlXCIsXCJwcm9wc1wiOntcInlcIjoyODYsXCJ4XCI6MTYsXCJ0ZXh0dXJlXCI6XCJnYW1lcy9zb2hhL2xvYmJ5LzIucG5nXCIsXCJzY2FsZVlcIjowLjgsXCJzY2FsZVhcIjowLjh9LFwiY29tcElkXCI6Njd9LHtcInR5cGVcIjpcIkZvbnRDbGlwXCIsXCJwcm9wc1wiOntcInlcIjoyOTcsXCJ4XCI6NTAsXCJ3aWR0aFwiOjI1MCxcInZhbHVlXCI6XCIyMDAtMjDkuIdcIixcInNwYWNlWFwiOi0yLFwic2tpblwiOlwiZ2FtZXMvc29oYS9sb2JieS84LnBuZ1wiLFwic2hlZXRcIjpcIi0wMTIzNDU2Nzg55LiH5Lq/XCIsXCJuYW1lXCI6XCJsYmxfbGltaXRcIixcImhlaWdodFwiOjM2LFwiYWxpZ25cIjpcImNlbnRlclwifSxcImNvbXBJZFwiOjY4fSx7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6MzcwLFwieFwiOjQzLFwid2lkdGhcIjoyNTAsXCJ0ZXh0XCI6XCLmu6Ey5bGA6YCB56S85Yi4eDFcIixcIm5hbWVcIjpcImxibF9kZXNjXCIsXCJoZWlnaHRcIjozMixcImZvbnRTaXplXCI6MzAsXCJmb250XCI6XCJNaWNyb3NvZnQgWWFIZWlcIixcImNvbG9yXCI6XCIjZmZmZmZmXCIsXCJhbGlnblwiOlwiY2VudGVyXCJ9LFwiY29tcElkXCI6Njl9XX0se1widHlwZVwiOlwiSW1hZ2VcIixcInByb3BzXCI6e1wieVwiOjE5MSxcInhcIjo4ODYsXCJ2YXJcIjpcImltZ19yb29tM1wiLFwic2tpblwiOlwiZ2FtZXMvc29oYS9sb2JieS82LnBuZ1wifSxcImNvbXBJZFwiOjcwLFwiY2hpbGRcIjpbe1widHlwZVwiOlwiU3ByaXRlXCIsXCJwcm9wc1wiOntcInlcIjoyODYsXCJ4XCI6MTYsXCJ0ZXh0dXJlXCI6XCJnYW1lcy9zb2hhL2xvYmJ5LzIucG5nXCIsXCJzY2FsZVlcIjowLjgsXCJzY2FsZVhcIjowLjh9LFwiY29tcElkXCI6NzF9LHtcInR5cGVcIjpcIkZvbnRDbGlwXCIsXCJwcm9wc1wiOntcInlcIjoyOTcsXCJ4XCI6NTAsXCJ3aWR0aFwiOjI1MCxcInZhbHVlXCI6XCIyMDAtMjDkuIdcIixcInNwYWNlWFwiOi0yLFwic2tpblwiOlwiZ2FtZXMvc29oYS9sb2JieS84LnBuZ1wiLFwic2hlZXRcIjpcIi0wMTIzNDU2Nzg55LiH5Lq/XCIsXCJuYW1lXCI6XCJsYmxfbGltaXRcIixcImhlaWdodFwiOjM2LFwiYWxpZ25cIjpcImNlbnRlclwifSxcImNvbXBJZFwiOjcyfSx7XCJ0eXBlXCI6XCJMYWJlbFwiLFwicHJvcHNcIjp7XCJ5XCI6MzcwLFwieFwiOjQzLFwid2lkdGhcIjoyNTAsXCJ0ZXh0XCI6XCLmu6Ey5bGA6YCB56S85Yi4eDFcIixcIm5hbWVcIjpcImxibF9kZXNjXCIsXCJoZWlnaHRcIjozMixcImZvbnRTaXplXCI6MzAsXCJmb250XCI6XCJNaWNyb3NvZnQgWWFIZWlcIixcImNvbG9yXCI6XCIjZmZmZmZmXCIsXCJhbGlnblwiOlwiY2VudGVyXCJ9LFwiY29tcElkXCI6NzN9XX0se1widHlwZVwiOlwiSW1hZ2VcIixcInByb3BzXCI6e1wieVwiOjE5MSxcInhcIjoxMjY0LFwidmFyXCI6XCJpbWdfcm9vbTRcIixcInNraW5cIjpcImdhbWVzL3NvaGEvbG9iYnkvNy5wbmdcIn0sXCJjb21wSWRcIjo3NCxcImNoaWxkXCI6W3tcInR5cGVcIjpcIlNwcml0ZVwiLFwicHJvcHNcIjp7XCJ5XCI6Mjg2LFwieFwiOjE2LFwidGV4dHVyZVwiOlwiZ2FtZXMvc29oYS9sb2JieS8yLnBuZ1wiLFwic2NhbGVZXCI6MC44LFwic2NhbGVYXCI6MC44fSxcImNvbXBJZFwiOjc1fSx7XCJ0eXBlXCI6XCJGb250Q2xpcFwiLFwicHJvcHNcIjp7XCJ5XCI6Mjk3LFwieFwiOjUwLFwid2lkdGhcIjoyNTAsXCJ2YWx1ZVwiOlwiMjAwLTIw5LiHXCIsXCJzcGFjZVhcIjotMixcInNraW5cIjpcImdhbWVzL3NvaGEvbG9iYnkvOC5wbmdcIixcInNoZWV0XCI6XCItMDEyMzQ1Njc4OeS4h+S6v1wiLFwibmFtZVwiOlwibGJsX2xpbWl0XCIsXCJoZWlnaHRcIjozNixcImFsaWduXCI6XCJjZW50ZXJcIn0sXCJjb21wSWRcIjo3Nn0se1widHlwZVwiOlwiTGFiZWxcIixcInByb3BzXCI6e1wieVwiOjM3MCxcInhcIjo0MyxcIndpZHRoXCI6MjUwLFwidGV4dFwiOlwi5ruhMuWxgOmAgeekvOWIuHgxXCIsXCJuYW1lXCI6XCJsYmxfZGVzY1wiLFwiaGVpZ2h0XCI6MzIsXCJmb250U2l6ZVwiOjMwLFwiZm9udFwiOlwiTWljcm9zb2Z0IFlhSGVpXCIsXCJjb2xvclwiOlwiI2ZmZmZmZlwiLFwiYWxpZ25cIjpcImNlbnRlclwifSxcImNvbXBJZFwiOjc3fV19XSxcImxvYWRMaXN0XCI6W1wiZ2FtZXMvc29oYS9sb2JieS9iZy5qcGdcIixcImdhbWVzL3NvaGEvbG9iYnkvMy5wbmdcIixcImdhbWVzL3NvaGEvbG9iYnkvMS5wbmdcIixcImdhbWVzL3NvaGEvbG9iYnkvNS5wbmdcIixcImdhbWVzL3NvaGEvbG9iYnkvMi5wbmdcIixcImdhbWVzL3NvaGEvbG9iYnkvOC5wbmdcIixcImdhbWVzL3NvaGEvbG9iYnkvNC5wbmdcIixcImdhbWVzL3NvaGEvbG9iYnkvNi5wbmdcIixcImdhbWVzL3NvaGEvbG9iYnkvNy5wbmdcIl0sXCJsb2FkTGlzdDNEXCI6W119O1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7IHN1cGVyKCl9XHJcbiAgICAgICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVWaWV3KFNvaGFMb2JieVVJLnVpVmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHIiXX0=
