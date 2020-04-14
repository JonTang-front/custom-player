import Utils from '../utils';
import flvjs from 'enhance-flvjs';
import API from '../api';
export default class {
    constructor(el, options) {
        this.container = el;
        this.stream = options.stream;
        this.reconnectServer = this.reconnectServer;
        this.appId = options.appId;
        this.deviceId = options.deviceId;
        this.renderVideo();
        this.createPlayer();
        this._eventListener();
    }
    renderVideo() {
        this.container.innerHTML = "<div style='position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);width: 100%;height: 100%;'>"+
                "<video id='player' style='width: 100%;height: 100%;background-color: #000;' muted>" +
                    "Your browser is too old which doesn't support HTML5 video." +
                "</video>" +
            "</div>";
        /**
         * 全屏
         */
        // webkitRequestFullscreen();
        // webkitCancelFullScreen();

        this.ePlayer = document.getElementById('player');
        this.ePlayer.oncontextmenu = function(){
            return false;
        };
    }
    createPlayer() {
        if (flvjs.isSupported()) {
            if (this.pInstance) {
                this.destory();
            }
            if(Utils.checkStream(this.stream)){
                this.pInstance = flvjs.createPlayer({
                    type: 'flv',
                    url: this.stream,
                    hasVideo: true,
                    hasAudio: false,
                    isLive: true,
                    cors: true
                },{
                    enableWorker: true,
                    enableStashBuffer: false,
                    stashInitialSize: 120,
                    autoCleanupSourceBuffer: true,
                    autoCleanupMaxBackwardDuration: 5,
                    autoCleanupMinBackwardDuration: 3,
                    lazyLoadMaxDuration: 3 * 60,
                    seekType: 'range'
                });
                this.pInstance.attachMediaElement(this.ePlayer);
                this.pInstance.load();
                this.pInstance.play();
            }
        }
    }
    load() {
        this.pInstance && this.pInstance.load();
    }
    start() {
        this.pInstance && this.pInstance.play();
    }
    pause() {
        this.pInstance && this.pInstance.pause();
    }
    replaceStream(stream, deviceId, appId) {
        this.stream = stream;
        this.appId = appId;
        this.deviceId = deviceId;
        this.createPlayer();
    }
    reconnect() {
        let times = 0;
        const interval = setInterval(() => {
            console.info(++times+'times reconnect...');
            API.reconnect(this.reconnectServer, {
                appId: this.appId,
                deviceId: this.deviceId,
                type: "flv"
            }).then(res => {
                this.stream = res.data[0].playUrl;
                this.createPlayer();
                if(times>100 && interval){
                    clearInterval(interval);
                }
            });
        }, 2000);
    }
    getCurrentTime() {
        return this.ePlayer.currentTime;
    }
    screenshot() {
        const canvas = document.createElement("canvas");
        canvas.width = this.ePlayer.videoWidth;
        canvas.height = this.ePlayer.videoHeight;
        const canvasCtx = canvas.getContext("2d");
        canvasCtx.drawImage(this.ePlayer, 0, 0, this.ePlayer.videoWidth, this.ePlayer.videoHeight);
        const base64Data = canvas.toDataURL("image/png");
        const aLink = document.createElement('a');
        const blob = Utils.base64ToBlob(base64Data);
        aLink.download = '截图.png';
        aLink.href = URL.createObjectURL(blob);
        aLink.click();
        return base64Data;
    }
    destory() {
        this.pInstance && this.pInstance.pause();
        this.pInstance && this.pInstance.unload();
        this.pInstance && this.pInstance.detachMediaElement();
        this.pInstance && this.pInstance.destroy();
        this.pInstance = null;
    }
    _eventListener() {
        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'disconnect': this.reconnect();
                    break;
                default: 
                    break;
            }  
        }, false);
    }
}