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

To undo server code changes
```
git add . && git stash && git stash drop
```

Common Commands
```
docker ps
docker stop <id>
sudo systemctl stop nginx
sudo lsof -i :80
```


### NGINX config to get certificate
https://www.programonaut.com/setup-ssl-with-docker-nginx-and-lets-encrypt/
https://www.youtube.com/watch?v=J9jKKeV1XVE

```
events {
    worker_connections  1024;
}

http {
    server_tokens off;
    charset utf-8;

    # always redirect to https
    server {
        listen 80 default_server;

        server_name _;

	location ~ /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

	location / {
            proxy_pass http://app:3000/;
        }
	
    }

   
}
```