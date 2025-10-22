export interface DirectUploadSuccessResult {
    asset_id: string;
    progress: number;
    created_at: number;
    updated_at: number;
    status: string;
    tag: string[];
    source_id: string;
    collection_id: string;
    input: Input;
    output: Output;
    upload_url: string;
    playlists: string[];
}

interface Output {
    format: string;
    status_url: string;
    playback_url: string;
    thumbnail_url: string[];
}

interface Input {
    transformations: Transformations;
    profile_id: string;
    title: string;
    description: string;
    metadata: Metadata;
    source_url: string;
    call_to_actions: Calltoaction[];
}

interface Calltoaction {
    start_time: number;
    end_time: number;
    text: string;
    url: string;
    html_target: string;
}

interface Metadata {
    headermeta: string;
}

interface Transformations {
    format: string;
    resolution: string[];
    audio_codec: string[];
    video_codec: string[];
    thumbnail: string[];
    thumbnail_format: string;
    mp4_access: boolean;
    per_title_encoding: boolean;
    original_deleted: boolean;
}

export interface AssetDetails {
    asset_id: string;
    progress: number;
    created_at: number;
    updated_at: number;
    status: string;
    tag: string[];
    source_id: string;
    collection_id: string;
    input: Input;
    output: Output;
    processed_at: number;
    folder: string;
    playlists: any[];
}

interface Output {
    format: string;
    status_url: string;
    playback_url: string;
    dash_playback_url: string;
    thumbnail_url: string[];
    storage_details: Storagedetails;
    transcription_word_level_timestamps: string;
    storage_bytes: number;
    preview_thumbnails_url: string;
}

interface Storagedetails {
    video: Video[];
    audio: Audio[];
    playlist: Playlist[];
    thumbnail: Thumbnail[];
    subtitle: Playlist[];
    previewThumbnail: Playlist[];
}

interface Thumbnail {
    fileName: string;
    size: number;
    resolution: string;
}

interface Playlist {
    fileName: string;
    size: number;
}

interface Audio {
    fileName: string;
    size: number;
    duration: number;
}

interface Video {
    fileName: string;
    size: number;
    resolution: string;
    duration: number;
}

interface Input {
    transformations: Transformations;
    profile_id: string;
    title: string;
    description: string;
    chapters: Chapter[];
    source_url: string;
    size: number;
    duration: number;
    aspect_ratio: string;
    fps: number;
    width: number;
    height: number;
}

interface Chapter {
    endTime: number;
    label: string;
}

interface Transformations {
    format: string;
    resolution: string[];
    audio_codec: string[];
    video_codec: string[];
    image_overlay: Imageoverlay;
    thumbnail: string[];
    thumbnail_format: string;
    mp4_access: boolean;
    audio_only: boolean;
    original_deleted: boolean;
    per_title_encoding: boolean;
    generate_subtitles: Generatesubtitles;
    preview_thumbnails: Previewthumbnails;
}

interface Previewthumbnails {
    max_tiles: number;
}

interface Generatesubtitles {
    audio_language: string;
    subtitle_languages: string[];
}

interface Imageoverlay {
    url: string;
    vertical_align: string;
    horizontal_align: string;
    vertical_margin: string;
    horizontal_margin: string;
    width: string;
    height: string;
    image_downloaded: boolean;
}