# How to run docker environment

##  Installation

Install docker on your operation system and be sure that docker version is not under 1.10

[ Install document on Linux ](https://docs.docker.com/engine/installation/linux/ubuntulinux/)
[ Install document on MacOS ](https://docs.docker.com/engine/installation/mac/)
[ Install docker compose ](https://docs.docker.com/compose/install/)


## Pre requirements

If you have Mac OS you need to create docker machine

    docker-machine create -d virtualbox --virtualbox-memory 4096 --virtualbox-disk-size 150000 avaea
    eval "$(docker-machine env dev)"
    
## Running

    docker-compose build
    docker-compose up
    sudo echo '{IP_ADDRESS}  test.com abo.test.com' >> /etc/hosts
    
IP_ADDRESS could be localhost or ip of your docker-machine

## Application

    http://test.com:81
    http://abo.test.com:81