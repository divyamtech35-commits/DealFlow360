import app from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  DealFlow360 API Server running on port ${PORT}`);
  console.log(`  Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`  Health:   http://localhost:${PORT}/health`);
  console.log('====================================================');
});
