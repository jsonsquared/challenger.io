#!/bin/bash
echo "Deploying!"
./node_modules/.bin/jitsu login --username nko3-challenger-io --password +wxBxrtv2dHBKEA5
./node_modules/.bin/jitsu deploy


# Ratchet.io
ACCESS_TOKEN=18a7fb80ec994e2cbdd54660fabdb8c5
ENVIRONMENT=production
LOCAL_USERNAME=`whoami`
REVISION=`git log -n 1 --pretty=format:"%H"`

curl https://submit.ratchet.io/api/1/deploy/ \
  -F access_token=$ACCESS_TOKEN \
  -F environment=production \
  -F revision=$REVISION \
  -F local_username=$LOCAL_USERNAME