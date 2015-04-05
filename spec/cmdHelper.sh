#!/usr/bin/env bash

WORKING_PATH="$1";
shift;

cd $WORKING_PATH;
echo "$*"

# nohup $*;

$*;

# ps -ef | egrep 'node|grunt'
# kill -9 `ps -ef | egrep 'node|grunt' | awk '{printf $2 " "}'`

# jasmine-node spec/ --verbose

#npm install html-minifier --save-dev