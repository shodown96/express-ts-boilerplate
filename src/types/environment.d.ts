
declare namespace NodeJS {
    interface ProcessEnv {
        // NODE_ENV: 'development' | 'production' | 'test';
        DOMAIN: string
        DATABASE_URL: string;
        AWS_ACCESS_KEY_ID: string;
        AWS_SECRET_ACCESS_KEY: string;
        AWS_REGION: string;
        AWS_BUCKET_NAME: string;
        SSO_CALLBACK_URL: string;
        GOOGLE_CLIENT_ID: string
        GOOGLE_CLIENT_SECRET: string
        BASE_API_ENDPOINT: string
        MAIN_APP_URL: string
    }
}