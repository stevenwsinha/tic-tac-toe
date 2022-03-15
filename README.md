# tic-tac-toe
A tic-tac-toe web application implemented through a RESTful API. The server is express.js running on node, 
with REST requests made using the AJAX XMLHttpRequest() function. The application is intended to be run as a containerized app
with Docker, and will require a few small changes if you wish to run it outside Docker.

# Docker
This application comes with a docker-compose.yml file, and accompanying Dockerfile, that enable easy and portable deployment. The
Dockerfile will clone this repo itself, so if you plan to deploy through docker, you do not need to clone the whole repo yourself, 
just checkout the docker folder.

To run the docker image, merely run the "docker-compose up -d" command from the docker directory.
