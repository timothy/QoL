# QoL
Uses the FHIR api to calculate the current Quality of Life of a person. 

## How to run locally
1. install nodeJS
1. Navigate to repo using terminal e.g. `cd /dir/to/repo/QoL`
1. in the terminal: `npm install`
1. in the terminal: `npm start`
1. in the browser (Chrome/Firefox/etc): `http://localhost:3000/`

## How to run from Docker

**Build docker image**  
`docker build -t qol:latest .`

**Run Docker in detached head mode**  
`docker run -p 49160:3000 -d qol:latest`

**Make sure docker is running and find the `PORTS` mapped to host machine**    
`docker ps` will present something similar to below data

```
# Example output
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                     NAMES
19bad986b95b        qol:latest          "docker-entrypoint.s…"   4 minutes ago       Up 4 minutes        0.0.0.0:49160->3000/tcp   optimistic_blackburn
```
In the example above under `PORTS` you can see `0.0.0.0:49160->3000/tcp`, Docker mapped the `3000` port inside of the container to the port `49160` on your machine.   
 
This means on your host computer you can navigate to `http://0.0.0.0:49160/` to test out the app. You can also use: `http://localhost:49160/` to access the site.

To inspect the server logs take the `docker logs <CONTAINER ID>` an example using the above data `docker logs 19bad986b95b`

**Docker cheatsheet**  
```
docker ps                                 # Get info on containers that are running
docker stop <CONTAINER ID>                # Stop container using container id found with "docker ps"
docker images                             # Show a list of all images on system
docker rmi <IMAGE ID>                     # Delete an image pass the ID returned by "docker images" to "docker rmi". If image is being used then "docker rm <stopped container>"
docker ps -a                              # Get info on all containers
docker logs <container id>                # Print app output
docker exec -it <container id> /bin/bash  # Enter the container
```