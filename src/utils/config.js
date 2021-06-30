export const ACCEPT_CONFIG = {
    image: ['.png', '.jpg', '.jpeg', '.gif', '.bmp','.webp','.psd'],
    video: ['.mp4', '.rmvb', '.mkv', '.wmv', '.flv','.ts','.ps','.avi','.asf','.rm','rmvb','mov','f4v','mxf','3gp','gxf'],
    audio:['.ec3','mp2','.mp3','.wma','.aac','.amr','.ogg','.pcm','.dts'],
    document: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt', '.tif', '.tiff','.wps'],
    getAll(){
        return [...this.image, ...this.video,...this.audio, ...this.document]
    },
  };