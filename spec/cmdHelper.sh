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


#    Statements   : 92.68% ( 190/205 )
#    Branches     : 70.83% ( 17/24 )
#    Functions    : 88.24% ( 60/68 )
#    Lines        : 92.68% ( 190/205 )
#
#    Statements   : 92.82% ( 194/209 )
#    Branches     : 70% ( 21/30 )
#    Functions    : 89.86% ( 62/69 )
#    Lines        : 92.82% ( 194/209 )
#
#    Statements   : 93.69% ( 193/206 )
#    Branches     : 70% ( 21/30 )
#    Functions    : 92.54% ( 62/67 )
#    Lines        : 93.69% ( 193/206 )
