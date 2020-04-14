import Utils from '../utils';
import flvjs from 'enhance-flvjs';
import API from '../api';
export default class {
    constructor(el, options) {
        this.container = el;
        this.startServer = options.startServer;
        this.stopServer = options.stopServer;
        this.deviceId = options.deviceId;
        this.appId = options.appId;
        this.streamType = options.streamType;
        this.beginTimeStamp = options.beginTimeStamp;
        this.endTimeStamp = options.endTimeStamp;
        this.currentTime = 0;
        this.getStream(this.beginTimeStamp, this.endTimeStamp);
        this.renderVideo();
        this._eventListener();
    }
    async getStream(beginTimeStamp, endTimeStamp) {
        this.sessionId && await this.stopStream();
        API.startStream(this.startServer, {
            deviceId: this.deviceId,
            start: beginTimeStamp,
            end: endTimeStamp,
            type: this.streamType,
            recordType: this.recordType,
            saveType: this.saveType
        }).then(res => {
            if(res.errorCode==='SUCCESS'){
                this.sessionId = res.data[0].sessionId;
                this.stream = res.data[0].playUrl;
                console.log(this.stream);
                this.createPlayer();
            }else{
                console.error(res.errorCode);
            }
        });
    }
    stopStream() {
        API.stopStream(this.stopServer, {
            deviceId: this.deviceId,
            sessionId: this.sessionId
        }).then(res => {
            if(res.errorCode==='SUCCESS'){
                clearInterval(this.interval);
            }else{
                console.error(res.errorCode);
            }
        });
    }
    renderVideo() {
        this.container.innerHTML = "<div style='position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);width: 100%;height: 100%;'>"+
            "<video id='player' style='width: 100%;height: 100%;background-color: #000;' muted>" +
                "Your browser is too old which doesn't support HTML5 video." +
            "</video>" +
            "<div id='controls' style='position: fixed;bottom: 0;width: 100%;height: 30px;box-sizing: border-box;padding: 0 20px;display: flex;flex-flow: nowrap row;justify-content: space-between;align-items: center;background-color: rgba(0, 0, 0, 0.45);opacity: 0;transition: opacity .8s;'>" +
                "<div id='progress-groove' style='position: relative;width: 80%;height: 20%;border-radius: 5px;background-color: #fff;padding: 0 2px;display: flex;flex-flow: nowrap row;justify-content: flex-start;align-items: center;'>" +
                    "<div id='progress-bar' style='height: 60%;background-color: #00A2E8;border-radius: 3px;'></div>" +
                "</div>" +
                "<div id='time' style='color: #fff;'></div>" +
            "</div>" +
        "</div>";
        this.controlsEle = document.getElementById('controls');
        this.controlsEle.onmouseenter = this.showControls.bind(this);;
        this.controlsEle.onmouseleave = this.hideControls.bind(this);;
        this.controlsEle.onclick = this.updateProgress.bind(this);

        this.ePlayer = document.getElementById('player');
        this.ePlayer.oncontextmenu = function(){
            return false;
        };
        this.ePlayer.onloadeddata = this.onloadeddata.bind(this);

        this.progressBarTotalWidth = document.getElementById('progress-groove').clientWidth;

        this.progressBarEle = document.getElementById('progress-bar');

        this.timeEle = document.getElementById('time');
    }
    onloadeddata() {
        this.interval && clearInterval(this.interval);
        this.interval = setInterval(this.renderProgress.bind(this), 300);
    }
    showControls() {
        this.timeout && clearTimeout(this.timeout);
        this.controlsEle.style.opacity = 1;
    }
    hideControls() {
        this.timeout = setTimeout(() => {
            this.controlsEle.style.opacity = 0;
        }, 3000);
    }
    updateProgress(e) {
        e.stopPropagation();
        this.currentTime = (e.offsetX / this.progressBarTotalWidth) * (this.endTimeStamp - this.beginTimeStamp);
        this.progressBarEle.style.width = e.offsetX + 'px';
        this.getStream(this.beginTimeStamp + this.currentTime, this.endTimeStamp);
    }
    renderProgress() {
        const currentTime = this.currentTime + this.ePlayer.currentTime;
        this.percent = Utils.calculatePercent(this.beginTimeStamp, this.endTimeStamp, currentTime);
        this.timeEle.innerHTML = `${Utils.formatTime(Math.ceil(this.beginTimeStamp + currentTime))} / ${Utils.formatTime(Math.ceil(this.endTimeStamp))}`;
        this.progressBarEle.style.width = (this.percent * this.progressBarTotalWidth) + 'px';
        if((this.endTimeStamp - this.beginTimeStamp - currentTime)<1){
            clearInterval(this.interval);
        }
    }
    createPlayer() {
        if (flvjs.isSupported()) {
            this.pInstance && this.destory();
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
        this.pInstance.load();
    }
    start() {
        this.pInstance.play();
    }
    pause() {
        this.pInstance.pause();
    }
    replaceDevice(deviceId, appId) {
        this.deviceId = deviceId;
        this.appId = appId;
        this.getStream(this.beginTimeStamp, this.endTimeStamp);
    }
    reconnect() {
        if(this.percent>0.98){
            //播放结束
            this.stopStream();
            this.destory();
        }else{
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
    }
    getCurrentTime() {
        return this.currentTime + this.ePlayer.currentTime;
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
    unrender() {
        document.removeChild(this.ePlayer);
    }
    destory() {
        this.pInstance.pause();
        this.pInstance.unload();
        this.pInstance.detachMediaElement();
        this.pInstance.destroy();
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