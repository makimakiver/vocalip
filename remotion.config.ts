import { Config } from '@remotion/cli/config';
import path from 'path';

// Set the entry point to your Root component
Config.setEntryPoint('./remotion/Root.tsx');

// Set output directory
Config.setOutputLocation('./tmp');

// Disable video caching in serverless environments
Config.setCachingEnabled(false);

