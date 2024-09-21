import fs from 'fs';
import path from 'path';

// Retrieve the log file path and log level from environment variables
const LOG_FILE = process.env.LOG_FILE || 'default.log'; // Default log file if not specified
const LOG_LEVEL = parseInt(process.env.LOG_LEVEL || '0', 10); // Default log level is 0 (silent)

// Ensure the log directory exists
const logDirectory = path.dirname(LOG_FILE);
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Enum for log levels
enum LogLevel {
    SILENT = 0,       // No logging
    INFO = 1,         // Informational messages
    DEBUG = 2         // Detailed debug messages
}

// Function to write a log message to the log file
function writeLog(message: string): void {
    fs.appendFileSync(LOG_FILE, message + '\n', { encoding: 'utf-8' });
}

// Log an informational message
export function info(message: string): void {
    if (LOG_LEVEL >= LogLevel.INFO) {
        const logMessage = `[INFO] ${new Date().toISOString()} - ${message}`;
        writeLog(logMessage);
        console.log(logMessage); // Optional: Display on the console
    }
}

// Log a debug message
export function debug(message: string): void {
    if (LOG_LEVEL >= LogLevel.DEBUG) {
        const logMessage = `[DEBUG] ${new Date().toISOString()} - ${message}`;
        writeLog(logMessage);
        console.log(logMessage); // Optional: Display on the console
    }
}

// Log an error message
export function error(message: string): void {
    const logMessage = `[ERROR] ${new Date().toISOString()} - ${message}`;
    writeLog(logMessage);
    console.error(logMessage); // Display errors on the console
}
