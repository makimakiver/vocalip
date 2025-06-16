import { Config } from '@remotion/cli/config';

// Set the entry point to your Root component
Config.setEntryPoint('./remotion/Root.tsx');

// Set output directory
Config.setOutputLocation('./tmp');

// Set codec (optional)
Config.setCodec('h264');

// Set pixel format (optional)
Config.setPixelFormat('yuv420p');

// Disable video caching in serverless environments
Config.setCachingEnabled(false);