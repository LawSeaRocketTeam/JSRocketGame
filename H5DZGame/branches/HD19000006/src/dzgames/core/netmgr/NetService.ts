/** 
 *  @brief : http handler
 *  @author : wenzuoli
 *  @date : 2018/08/20
 */
    /**
     * http request by get.
     */
	export default class HttpService {
		private mHr: Laya.HttpRequest;
		private mUrl:string;
        private mSendHandler:Laya.Handler=null;
        private mCompletedHandler:Laya.Handler=null;
        private mErrorHandler:Laya.Handler=null;
        private mProgressHandler:Laya.Handler=null;

        public static sendGet():void{
        
        }

        /**
         * init the httpget project.
         * @param url request url include the parameters
         * @param completedCallback completed callback
         * @param errorCallback error callback
         * @param progressCallback progress callback
         * @param sendCallback sended callback
         */
		constructor(url:string,completedCallback?:Laya.Handler,errorCallback?:Laya.Handler,progressCallback?:Laya.Handler,sendCallback?:Laya.Handler) {   
            if(completedCallback!=null){
                this.mCompletedHandler = completedCallback;
            }
            if(errorCallback!=null){
                this.mErrorHandler = errorCallback;
            }
            if(progressCallback!=null){
                this.mProgressHandler = progressCallback;
            }
            if(sendCallback!=null){
                this.mSendHandler = sendCallback;
            }
			this.init(url); 
		}

        /**
         * initial the request object.
         * @param url url
         */
		private init(url:string): void {
            this.mUrl = url;
			this.mHr = new Laya.HttpRequest();
			this.mHr.once(Laya.Event.PROGRESS, this, this.onHttpRequestProgress);
			this.mHr.once(Laya.Event.COMPLETE, this, this.onHttpRequestComplete);
			this.mHr.once(Laya.Event.ERROR, this, this.onHttpRequestError); 
		}

        /**
         * send get request.
         */
        public send():void{ 
            this.mHr.send(this.mUrl, null, 'get', 'text');
             if(this.mSendHandler!=null){
                this.mSendHandler.run();
            }
        }

		/**
         * request error callback
         * @param e e
         */
		private onHttpRequestError(e: any): void {
            this.offAllListener();
            console.log('Perform http request error:'+this.mUrl);
            console.log(this.mHr.offAll())
			if(this.mErrorHandler!=null){
                this.mErrorHandler.runWith(e);
            }
		}

        /**
         * progress callback
         * @param e e
         */
		private onHttpRequestProgress(e: any): void { 
			if(this.mProgressHandler!=null){
                this.mProgressHandler.runWith(e);
            }
		}

        /**
         * completed callback
         * @param e e
         */
		private onHttpRequestComplete(e: any): void {
           this.offAllListener();
            console.log('Perform http request completed.')
			if(this.mCompletedHandler!=null){
                this.mCompletedHandler.runWith(this.mHr.data);
            }
		}

        /**
         * remove all the mHr listen events.
         */
        private offAllListener():void{
             this.mHr.offAll()
        }
	}