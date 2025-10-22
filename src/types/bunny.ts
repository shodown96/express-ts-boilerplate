export interface VideoAsset {
    videoLibraryId: number;
    guid: string;
    title: string;
    dateUploaded: string;
    views: number;
    isPublic: boolean;
    length: number;
    status: number;
    framerate: number;
    rotation: number;
    width: number;
    height: number;
    availableResolutions: string;
    outputCodecs: string;
    thumbnailCount: number;
    encodeProgress: number;
    storageSize: number;
    captions: {
      srclang: string;
      label: string;
    }[];
    hasMP4Fallback: boolean;
    collectionId: string;
    thumbnailFileName: string;
    averageWatchTime: number;
    totalWatchTime: number;
    category: string;
    chapters: {
      title: string;
      start: number;
      end: number;
    }[];
    moments: {
      label: string;
      timestamp: number;
    }[];
    metaTags: {
      property: string;
      value: string;
    }[];
    transcodingMessages: {
      timeStamp: string;
      level: number;
      issueCode: number;
      message: string;
      value: string;
    }[];
  }
  