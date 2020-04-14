import RealPlayer from './player/RealPlayer.js';
import BackPlayer from './player/BackPlayer.js';
export default {
    createPlayer(el, media) {
        if(el) {
            const { mode, options } = media;
            if(mode === 'real') {
                if (options.stream) {
                    return new RealPlayer(el, Object.assign({
                        stream: '',
                        reconnectServer: '',
                        appId: '',
                        deviceId: ''
                    }, options));
                } else {
                    throw new Error('stream is not present');
                }
                
            }else if(mode === 'playback') {
                if(options.startServer && options.stopServer && options.deviceId && options.beginTimeStamp && options.endTimeStamp) {
                    return new BackPlayer(el, Object.assign({
                        startServer: '',
                        stopServer: '',
                        deviceId: '',
                        appId: '',
                        beginTimeStamp: '',
                        endTimeStamp: '',
                        streamType: 'flv',
                        reconnectServer: '',
                        recordType: '',
                        saveType: ''
                    }, options));
                } else {
                    throw new Error('params is not intact');
                }
            }
        }else{
            throw new Error('container dom is not present');
        }
    }
};