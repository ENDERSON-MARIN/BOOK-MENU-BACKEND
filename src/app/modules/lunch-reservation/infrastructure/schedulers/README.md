# AutoReservationScheduler

The AutoReservationScheduler provides automated daily reservation creation for fixed users in the lunch reservation system.

## Features

- **Daily Execution**: Automatically runs at a configured time (default: midnight)
- **Retry Logic**: Configurable retry attempts with exponential backoff
- **Failure Handling**: Tracks consecutive failures and provides health monitoring
- **Manual Operations**: Support for manual execution and date-specific operations
- **Environment-Aware**: Different configurations for production, development, and testing

## Usage

### Basic Usage with SchedulerManager

```typescript
import {
  initializeGlobalScheduler,
  getSchedulerManager,
} from "./SchedulerManager"

// Initialize the scheduler (typically in your application startup)
const schedulerManager = await initializeGlobalScheduler({
  environment: "production",
  autoStart: true,
})

// The scheduler will now run daily at midnight
```

### Manual Operations

```typescript
import { getSchedulerManager } from "./SchedulerManager"

const manager = getSchedulerManager()

// Execute immediately (for testing)
const result = await manager.executeNow()
console.log(`Created ${result.successfulReservations} reservations`)

// Create reservations for a specific date
const specificDate = new Date("2024-12-15")
const dateResult = await manager.createReservationsForDate(specificDate)

// Create reservations for a date range
const startDate = new Date("2024-12-15")
const endDate = new Date("2024-12-20")
const rangeResults = await manager.createReservationsForDateRange(
  startDate,
  endDate
)
```

### Health Monitoring

```typescript
import { getSchedulerManager } from "./SchedulerManager"

const manager = getSchedulerManager()

// Check scheduler health
const health = manager.getHealthInfo()
console.log("Scheduler is healthy:", health.isHealthy)
console.log("Consecutive failures:", health.status.consecutiveFailures)
console.log("Last execution:", health.status.lastExecution)
console.log("Next execution:", health.status.nextExecution)

// Get detailed status
const status = manager.getStatus()
if (status) {
  console.log("Running:", status.isRunning)
  console.log("Last result:", status.lastResult)
}
```

### Configuration

```typescript
import { makeAutoReservationScheduler } from "../factories"

// Custom configuration
const scheduler = makeAutoReservationScheduler({
  schedulerConfig: {
    enabled: true,
    dailyExecutionHour: 23, // 11 PM
    dailyExecutionMinute: 30, // 11:30 PM
    retryAttempts: 5,
    retryDelayMs: 10000, // 10 seconds
  },
})

scheduler.start()
```

### Integration with Application Lifecycle

```typescript
// In your main server file
import {
  initializeGlobalScheduler,
  shutdownGlobalScheduler,
} from "./path/to/SchedulerManager"

async function startApplication() {
  // ... other initialization code

  // Initialize scheduler
  await initializeGlobalScheduler({
    environment: process.env.NODE_ENV as "production" | "development",
    autoStart: process.env.AUTO_START_SCHEDULER === "true",
  })

  console.log("Application started with scheduler")
}

async function shutdownApplication() {
  // Gracefully shutdown scheduler
  await shutdownGlobalScheduler()

  // ... other cleanup code
  console.log("Application shutdown complete")
}

// Handle process signals
process.on("SIGTERM", shutdownApplication)
process.on("SIGINT", shutdownApplication)

startApplication().catch(console.error)
```

## Environment Variables

You can control the scheduler behavior using environment variables:

```bash
# Enable/disable auto-start
AUTO_START_SCHEDULER=true

# Environment (affects default configuration)
NODE_ENV=production
```

## Error Handling

The scheduler includes comprehensive error handling:

- **Individual User Failures**: If creating a reservation for one user fails, it continues with other users
- **Retry Logic**: Failed operations are retried with configurable attempts and delays
- **Consecutive Failure Tracking**: Monitors system health by tracking consecutive failures
- **Graceful Degradation**: Continues operation even if some components fail

## Monitoring and Logging

The scheduler provides detailed logging for:

- Execution start/completion
- Individual user reservation results
- Retry attempts
- Configuration changes
- Health status changes

All logs include relevant context like user IDs, dates, and error messages for debugging.

## Testing

For testing purposes, use the test-specific factory:

```typescript
import { makeTestScheduler } from "../factories"

// Creates a disabled scheduler suitable for testing
const testScheduler = makeTestScheduler()

// Enable for specific tests
testScheduler.updateConfig({ enabled: true })

// Execute manually in tests
const result = await testScheduler.executeNow()
```

## Requirements Addressed

- **6.1**: Job scheduler for daily execution ✅
- **6.2**: Logic for creating reservations for fixed users ✅
- **6.3**: Failure handling and retry logic ✅
- **6.4**: Configurable execution times and behavior ✅
- **6.5**: Comprehensive error handling and monitoring ✅
