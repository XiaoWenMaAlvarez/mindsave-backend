export interface archivoChatIaOptions {
  fileUri: string;
  mimeType: string;
  fileUrl: string | undefined;
}
export class ArchivoChatIA {
  
  public fileUri: string;
  public mimeType: string;
  public fileUrl: string;

  constructor(options: archivoChatIaOptions){
    const {fileUri, mimeType, fileUrl = ""} = options;
    this.fileUri = fileUri;
    this.mimeType = mimeType;
    this.fileUrl = fileUrl;
  }

  static fromJson(object: {[key: string]: any}): ArchivoChatIA {
    const {fileUri, mimeType, fileUrl = ""} = object;
    const options = {fileUri, mimeType, fileUrl};
    return new ArchivoChatIA(options);
  }

  toJson() {
    return {
      fileUri: this.fileUri,
      mimeType: this.mimeType,
      fileUrl: this.fileUrl
    }
  }

}
