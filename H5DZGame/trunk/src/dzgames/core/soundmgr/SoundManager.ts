/** 
 * History: 1. add mini-program support. 2018/12/11 WenZuoli
*/
    import AudioEngine = Laya.SoundManager;
    /**
     * 声音管理
     * @History: 1. add mini-program support. 2018/12/11 WenZuoli
     */
    export class SoundManager {
        /** 音乐状态 */
        private mMusicState:boolean = true;
        /** 音效状态 */
        private mEffectState:boolean = true;  
        /**storage key for the background music. */
        private STOREGEKEY_BACKGROUND_MUSIC:string="background_music_onoff";
        /**storage key for the sound effect. */
        private STOREGEKEY_SOUND_EFFECT:string="SoundEffect_onoff";
        /**save key prefix */
        private KEY_PREFIX:string="";
        /** cache sound files path */
        //private SoundSet:Laya.Dictionary;

        constructor() {
            //this.loadLocalConfigs(); 
            // 跟随设备静音
            AudioEngine.useAudioMusic = false; 
            //this.SoundSet = new Laya.Dictionary();
        }

        /**
         * 获取本地配置
         */
        public loadLocalConfigs(acc:string):any {
            //init account or key
            this.KEY_PREFIX = acc;
            //背景音乐状态
            let _mstatus:any = this.getStorageItem(this.STOREGEKEY_BACKGROUND_MUSIC);
            let _musicStatus:boolean = _mstatus==null||_mstatus==undefined||_mstatus=="true"||_mstatus==true||_mstatus==="";
            this.mMusicState = _musicStatus; 
            // let musicStatus:any = Laya.LocalStorage.getItem(this.STOREGEKEY_BACKGROUND_MUSIC)||"true"; 
            // this.mBackgroundMusicOn = musicStatus=="true";
             
            //背景音效状态
            let _sstatus:any = this.getStorageItem(this.STOREGEKEY_SOUND_EFFECT);
            let _soundstatus:boolean = _sstatus==null||_sstatus==undefined||_sstatus=="true"||_sstatus==true||_sstatus==="";
            this.mEffectState = _soundstatus;

            // let soundStatus:any = Laya.LocalStorage.getItem(this.STOREGEKEY_SOUND_EFFECT)||"true";  
            // this.mSoundEffectOn = soundStatus=="true";
            //跟随设备静音
            //Laya.SoundManager.useAudioMusic=false
        } 

        /**
         * save item to local storage
         * @param itemKey item key
         * @param value 
         */
        private saveStorageItem(itemKey:string,value:any){
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
        }

        /**
         * get item by key from local storage
         * @param key item key
         */
        private getStorageItem(itemKey:string):any{
            // if(bestapp.utils.GameVerify.isMinProgramMode()){
            //     return wx.getStorageSync(itemKey);
            // }else{
                return Laya.LocalStorage.getItem(this.KEY_PREFIX.concat(itemKey));
            //}
        }

        /**
         * 获取音乐播放状态
         */
        public getMusicState():boolean {
            console.log("current status:"+this.mMusicState);
            return this.mMusicState;
        }

        /**
         * 设置音乐播放状态
         * @param state 播放状态
         */
        public setMusicState(state:boolean):void {
            this.mMusicState = state;
            //this.saveStorageItem(this.STOREGEKEY_BACKGROUND_MUSIC,state); 
        }

        /**
         * 获取音效播放状态
         */
        public getEffectState():boolean {
            return this.mEffectState;
        }

        /**
         * 设置音效播放状态
         * @param state 播放状态
         */
        public setEffectState(state:boolean):void {
            this.mEffectState = state;
            //this.saveStorageItem(this.STOREGEKEY_SOUND_EFFECT,state); 
        }

        /**
         * 停止播放所有声音（包括背景音乐和音效）
         */
        public stopAll():void {
            AudioEngine.stopAll();
        }

        /**
         * 停止声音播放。此方法能够停止任意声音的播放（包括背景音乐和音效），只需传入对应的声音播放地址
         * @param url 声音文件地址
         */
        public stopSound(url:string):void {
            AudioEngine.stopSound(url);
        }

        /**
         * 停止播放所有音效（不包括背景音乐）
         */
        public stopAllSound():void {
            AudioEngine.stopAllSound();
        }

        /**
         * 播放音效。音效可以同时播放多个
         * @param url 声音文件地址
         * @param loops 循环次数,0表示无限循环
         * @param complete 声音播放完成回调  Handler对象
         * @param soundClass 使用哪个声音类进行播放，null表示自动选择
         * @param startTime 声音播放起始时间
         */
        public playSound(url:string, loops?:number, complete?:Laya.Handler, soundClass?:any, startTime?:number):void {
            if(this.mEffectState){
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
        }

        /**
         * 停止播放背景音乐 (不包括音效)
         */
        public stopMusic():void {
            AudioEngine.stopMusic();
        }

        /**
         * 播放背景音乐
         * @param url 声音文件地址
         * @param loops 循环次数, 0表示无限循环
         * @param complete 声音播放完成回调
         * @param startTime 声音播放起始时间
         */
        public playMusic(url:string, loops?:number, complete?:Laya.Handler, startTime?:number):void {
            if(this.mMusicState){
                AudioEngine.stopMusic(); 
                AudioEngine.playMusic(url, loops, complete, startTime);
            } 
        }

        /**
         * 释放声音资源
         * @param url 声音播放地址
         */
        public destroySound(url:string):void {
            AudioEngine.destroySound(url);
        }

        /**
         * 设置声音音量。根据参数不同，可以分别设置指定声音（背景音乐或音效）音量或者所有音效（不包括背景音乐）音量
         * @param volume 音量。初始值为1。音量范围从 0（静音）至 1（最大音量）
         * @param url (default = null)声音播放地址。默认为null。为空表示设置所有音效（不包括背景音乐）的音量，不为空表示设置指定声音（背景音乐或音效）的音量
         */
        public setSoundVolume(volume:number, url?:string):void {
            AudioEngine.setSoundVolume(volume, url);
        }

        /**
         * 设置背景音乐音量。音量范围从 0（静音）至 1（最大音量）
         * @param volume 音量。初始值为1。音量范围从 0（静音）至 1（最大音量）
         */
        public setMusicVolume(volume:number):void {
            AudioEngine.setMusicVolume(volume);
        }

        /**
         * download sound file and play.
         * @param url reslurce path,like this: audio/aaa.mp3
         * @param loops loops
         * @param complete complete callback
         * @param soundClass 
         * @param startTime start time 
         */
        private downloadWebSound(url:string, loops?:number, complete?:Laya.Handler, soundClass?:any, startTime?:number):void{
            let _temUrl:string = Laya.URL.formatURL(url);
            let _this:any = this;
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
        }
    }