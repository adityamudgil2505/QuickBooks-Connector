# QuickBooks-Connector

## Setup
Add following info to the .env file
```
QUICKBOOKS_CLIENT_ID=YOUR_CLIENT_ID
QUICKBOOKS_CLIENT_SECRET=YOUR_CLIENT_SECRET
QUICKBOOKS_REDIRECT_URI=http://localhost:3000/callback
DB_HOST=db
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_DATABASE=your_database
```

Build and Run the Containers

Run the following commands in the directory containing these files:
```
# Build and start the containers
docker-compose up --build

# Access the application
http://localhost:3000/auth
```

To expose port on external server
```
sudo ufw allow 80

```