[![NPM version](https://badge.fury.io/js/slot-framework.svg)](http://badge.fury.io/js/slot-framework)
[![GitHub version](https://badge.fury.io/gh/SlotTeam%2Fslot-framework.svg)](http://badge.fury.io/gh/SlotTeam%2Fslot-framework)
[![Travis CI](https://travis-ci.org/SlotTeam/slot-framework.svg?branch=develop)](http://badge.fury.io/js/slot-framework)
[![Coverage Status](https://coveralls.io/repos/SlotTeam/slot-framework/badge.svg?branch=develop)](https://coveralls.io/r/SlotTeam/slot-framework?branch=develop)

# [Slot framework](http://www.SlotFramework.org)

> Closing the gap between server and client side, Slot is a Cross Side MVC Web Framework that lets developers reuse code on both sides,
 see more at [SlotFramework.org](http://www.SlotFramework.org).


## How to use?
Slot is built in [Node.js](http://nodejs.org/), and is deployed on [Npmjs.org](http://Npmjs.org/) index for easy use and distribution.
Installing the [slot-framework module](https://www.npmjs.org/package/slot-framework) you would enjoy all the necessary components to develop web projects
using Slot Framework, 
but to ease your work, we have created the [Slot Command Line](https://www.npmjs.org/package/slot-cli).

Just execute the next command line to install the framework global on your machine:

    $ npm install -g slot-cli

On your preferred workspace directory, execute the next command to build your HelloWorld project:

    $ slot create hello

Execute the next command to add a `demoPage.html` page:

    $ cd hello
    $ slot add -p demoPage

And finally execute the next command to start up the **Designer Server**, and start prototyping you app:

    $ slot start
      
      
         DESIGNER Server on http://localhost:800/


     * Deployment:
       PID          5544
       Root         /home/hello
     * Framework:
       metaData     /bind
       webRootDir   /www
       mvcRootDir   /app/mvc
       restRootDir  /app/rest
       dbRootDir    /app/db
       restFilter   /rest
       mvcFilter    /mvc
     * Logger:
       logFile      logs/slot.log
       maxsize      104857600
       maxFiles     10
     * Server:
       devMode      true
       compress     true
       caching      true
       cacheType    inMemory

     CTRL + C to shutdown

Now explore on your browser:

    $ http://localhost:800/
    and 
    $ http://localhost:800/demoPage.html



The [Slot Command Line](https://www.npmjs.org/package/slot-cli) will help you to create; Pages, Fragments and REST Services. See more on [Slot Framework Docs](http://www.SlotFramework.org/docs) ...
