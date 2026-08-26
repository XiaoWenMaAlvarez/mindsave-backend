export interface archivoChatIaOptions {
  fileUri: string;
  mimeType: string;
  fileUrl: string | undefined;
  cloudinaryPublicId?: string | null | undefined;
  cloudinaryResourceType?: string | null | undefined;
  geminiFileName?: string | null | undefined;
}
export class ArchivoChatIA {
  
  public fileUri: string;
  public mimeType: string;
  public fileUrl: string;
  public cloudinaryPublicId: string;
  public cloudinaryResourceType: string;
  public geminiFileName: string;

  constructor(options: archivoChatIaOptions){
    const {
      fileUri,
      mimeType,
      fileUrl = "",
      cloudinaryPublicId = "",
      cloudinaryResourceType = "",
      geminiFileName = "",
    } = options;
    this.fileUri = fileUri;
    this.mimeType = mimeType;
    this.fileUrl = fileUrl;
    this.cloudinaryPublicId = cloudinaryPublicId ?? "";
    this.cloudinaryResourceType = cloudinaryResourceType ?? "";
    this.geminiFileName = geminiFileName ?? "";
  }

  static fromJson(object: {[key: string]: any}): ArchivoChatIA {
    const {
      fileUri,
      mimeType,
      fileUrl = "",
      cloudinaryPublicId,
      cloudinaryResourceType,
      geminiFileName,
    } = object;
    const options = {
      fileUri,
      mimeType,
      fileUrl,
      cloudinaryPublicId,
      cloudinaryResourceType,
      geminiFileName,
    };
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
