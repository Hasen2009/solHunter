# solHunter

1- raydium holding percentage calculation
2- top10 holding percentage calculation
3- listeing to moonshot and pump fun new tokens reaching raydium through checking signer address for both

# 2nd Commit
1- add score function
2- each token from MoonShot will pass

# 3d Commit
1- adjusting score function

# 4th Commit

1- Change token age from 8 minutes to 1 hour
2- loop every 2 minutes to check if token has score < 2/5 else age less than 2 hours we'll stay
3- add volme >= 20K condition in score function
4- if condition match in score function then we'll connect to dex for further info
5- send token which is Mc less than 100K and delete it from file
6- delete each token age less than 1 hours and Mc less than 20K Mc
7- new file for error parsing for loop each 1 minute
8- extract parsing function
9- extracting paths variables to constants.js
10- adding function for storing rejected and accepted tokens async
11- adjusting score function
12- adding new json file for failed parsing signature to try parse it again
13- adding photo to tg msgs && pumpFun api for metaData
14- check if dev sold or not


# 5th Commit
1- Checking time less to 1.5 minutes
2- adding flitered tokens which tokens saved after sent to tg then check it each 20 minutes to send it to another chat

# 6th Commit
1- Collecting Data each 1 minute for each token saved in success_tokens.json which score >= 3
2- adding top10 holders list in each data collection