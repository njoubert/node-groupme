# HelloBot

This is a simple bot that simply responds to messages that contain "@BOT"

## Usage:

### Step 1: Get your info:

    node HelloBot.js <ACCESS_TOKEN>

This will print out your user id, your groups info, and the bots you have registered with GroupMe.

### Step 2: Register a bot with GroupMe:

    node HelloBot.js ACCESS_TOKEN USER_ID GROUP_ID BOT_NAME

This registers a bot with your user id and the given group id. 

### Step 3: Fire up your parrotting bot!

Like a parrot, it repeats after you.

    node HelloBot.js ACCESS_TOKEN USER_ID BOT_NAME

The command line output should be pretty informative.  Open your GroupMe app, and send a message of the form "@BOT Hello you". The bot should return.