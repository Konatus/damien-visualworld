#!/bin/bash

BRANCH=$(git name-rev --name-only HEAD)

if [[ $BRANCH == legacy ]]
then
  TAG=1.0
elif [[ $BRANCH == master ]]
then
  TAG=2.0
else
  TAG=2.0-development
fi

echo ''

docker build -f dockerfile-api -t ghcr.io/aourrad-vw/api:$TAG . && 
docker push ghcr.io/aourrad-vw/api:$TAG && 
docker build -f dockerfile-front -t ghcr.io/aourrad-vw/front:$TAG . && 
docker push ghcr.io/aourrad-vw/front:$TAG
