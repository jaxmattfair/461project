import fs from 'fs';
import path from 'path';

// Retrieve environment variables
const LOG_FILE = process.env.LOG_FILE || 'application.log'; // Default log file if none specified
const LOG_LEVEL = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL, 10) : 0; // Default level 0 (silent)

// Ensure that the log directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Log levels
enum LogLevel {
    SILENT = 0, // No logging
    INFO = 1,   // Informational messages
    DEBUG = 2,  // Debug messages
}

// Function to write log messages to a file
const writeLog = (message: string) => {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage, 'utf8');
};

// Logger functions
export const info = (message: string) => {
    if (LOG_LEVEL >= LogLevel.INFO) {
        writeLog(`INFO: ${message}`);
        console.log(message); // Also output to the console for convenience
    }
};

export const debug = (message: string) => {
    if (LOG_LEVEL >= LogLevel.DEBUG) {
        writeLog(`DEBUG: ${message}`);
        console.debug(message); // Also output to the console for convenience
    }
};



export const error = (message: string | Error, err?: Error) => {
    const errorMessage = err ? `${message}: ${err.message}` : message;
    writeLog(`ERROR: ${errorMessage}`);
    console.error(errorMessage); // Always log errors to console
};
//