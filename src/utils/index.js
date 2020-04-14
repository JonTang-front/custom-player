export default {
    checkStream(stream) {
        const index = stream.lastIndexOf('.');
        const suffix = stream.substring(index + 1);
        if (suffix === 'flv') {
            return true;
        } else {
            console.error('格式不支持');
            return false;
        }
    },
    base64ToBlob(code) {
        const parts = code.split(';base64,');
        let contentType = parts[0].split(':')[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;
        let uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], {type: contentType});
    },
    formatTime(timeStamp) {
        var date = new Date(timeStamp*1000);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var second = date.getSeconds();
        if(hours<10){
            hours = '0' + hours;
        }
        if(minutes<10){
            minutes = '0' + minutes;
        }
        if(second<10){
            second = '0' + second;
        }
        return hours + ':' + minutes + ':' + second;
    },
    calculatePercent(startTimeStamp, endTimeStamp, currentSeconds) {
        var percent = 0;
        var startDate = new Date(startTimeStamp*1000);
        var endDate = new Date(endTimeStamp*1000);
        var startHours = startDate.getHours();
        var startMinutes = startDate.getMinutes();
        var startSeconds = startDate.getSeconds();
        var endHours = endDate.getHours();
        var endMinutes = endDate.getMinutes();
        var endSeconds = endDate.getSeconds();
        if(startHours===endHours){
            if(startMinutes===endMinutes){
                if(startSeconds===endSeconds){
                    percent = 1;
                }else{
                    percent = currentSeconds / (endSeconds-startSeconds);
                }
            }else{
                percent = currentSeconds / (endMinutes*60 + endSeconds - startMinutes*60 - startSeconds);
            }
        }else{
            percent = currentSeconds / (endHours*3600 + endMinutes*60 + endSeconds - startHours*3600 - startMinutes*60 - startSeconds);
        }
        return percent;
    }
};