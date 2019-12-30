# pooky-monitor

Monitor Supreme for new Pooky/Tohru. Currently supports US/GB.

## Quick Start

```bash
# Rename config.example.json → config.json
mv config.example.json config.json

# Install dependencies
npm install

# Start the monitor.
npm start
```

## Running forever

```bash
# Install pm2 globally
npm install pm2@latest -g
# or
yarn global add pm2

# Run pooky-monitor forever with autorestart
pm2 start ecosystem.config.js

# Check pooky-monitor logs
pm2 logs pooky-monitor
```

## License

[MIT](LICENSE)
