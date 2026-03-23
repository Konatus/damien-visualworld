#!/bin/bash

# Dump all the databases of the server
docker exec -it mongo mongodump --gzip --archive=/data/db/archive-$(date +"%Y%m%d%H%M%S%N").gz

# Restore a database "toto"
# docker exec -it mongo mongorestore  --archive=archive.gz --gzip --drop --nsFrom='toto.*' --nsTo='toto.*'
# docker exec -it mongo mongorestore  --archive=/host/alpha.gz --gzip --drop --nsFrom='toto.*' --nsTo='toto.*'

# Mount volume (with Windows)
# docker run --name mongo1 -p 27017:27017 -v //c/Users/jdequatrebarbes/dev:/host mongo