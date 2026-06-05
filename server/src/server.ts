import { app } from './app.js';
import { prisma } from './db/index.js';
import { redis } from './db/redis.js';

// Handle outside express unhandled promise rejections (e.g. database connection error)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started at ${PORT}`);
});

// Graceful shutdown. When the load balancer ejects a replica and the container
// is stopped, Docker sends SIGTERM. We stop accepting new connections, let
// in-flight requests finish, then close Redis and Postgres so nothing is cut
// off mid-request. A hard timeout guarantees the process still exits if a
// connection refuses to drain.
let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    console.error('Could not drain in time, forcing exit.');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async () => {
    try {
      await redis.quit();
      await prisma.$disconnect();
    } catch (err) {
      console.error('Error during shutdown cleanup:', err);
    }
    clearTimeout(forceExit);
    console.log('Shutdown complete.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
