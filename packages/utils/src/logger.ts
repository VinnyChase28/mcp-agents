import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export interface Logger {
  info: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
}

export function createLogger(name: string): Logger {
  const logFile = path.join(LOG_DIR, `${name}.log`);
  
  const writeLog = (level: string, message: string, data?: unknown) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: name,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Write to file (async, non-blocking)
    fs.appendFile(logFile, logLine, (err) => {
      if (err) console.error(`Failed to write to log file ${logFile}:`, err);
    });
    
    // Also log to console with prefix
    const consoleMessage = data 
      ? `[${name}] ${message} ${JSON.stringify(data)}`
      : `[${name}] ${message}`;
    
    if (level === 'ERROR') {
      console.error(consoleMessage);
    } else if (level === 'DEBUG') {
      console.debug(consoleMessage);
    } else {
      console.log(consoleMessage);
    }
  };

  return {
    info: (message: string, data?: unknown) => writeLog('INFO', message, data),
    error: (message: string, data?: unknown) => writeLog('ERROR', message, data),
    debug: (message: string, data?: unknown) => writeLog('DEBUG', message, data),
  };
} 