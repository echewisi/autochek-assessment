/**
 * Custom logger utility for structured logging
 * Provides consistent logging format across the application
 */
export class LoggerUtil {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Log informational messages
   */
  log(message: string, data?: any): void {
    const logEntry = this.formatLog('INFO', message, data);
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Log error messages
   */
  error(message: string, trace?: string, data?: any): void {
    const logEntry = this.formatLog('ERROR', message, { ...data, trace });
    console.error(JSON.stringify(logEntry));
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any): void {
    const logEntry = this.formatLog('WARN', message, data);
    console.warn(JSON.stringify(logEntry));
  }

  /**
   * Log debug messages
   */
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.formatLog('DEBUG', message, data);
      console.debug(JSON.stringify(logEntry));
    }
  }

  /**
   * Format log entry with metadata
   */
  private formatLog(level: string, message: string, data?: any) {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(data && { data }),
    };
  }
}