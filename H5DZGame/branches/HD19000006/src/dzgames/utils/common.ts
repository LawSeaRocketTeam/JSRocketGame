import GameConfig from "../../GameConfig";
import UserConfig from "../configs/customcfg/UserConfig";

/**
 * current game running mode check.
 */
export default class GameVerify{
    constructor(){}
    public static isMiniProgramMode():boolean{
        return UserConfig.runningMode == UserConfig.RunningMode.miniProgram;
    }
    public static isWebMode():boolean{
        return UserConfig.runningMode == UserConfig.RunningMode.web;
    }
    public static isAndroidAppMode():boolean{
        return UserConfig.runningMode == UserConfig.RunningMode.androidApp;
    }
    public static isIOSAppMode():boolean{
        return UserConfig.runningMode == UserConfig.RunningMode.iosApp;
    }
}