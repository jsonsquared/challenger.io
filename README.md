#challenger-io

```
git clone clone git://github.com/jsonsquared/challenger.io.git
cd challenger-io
npm install
node server.js
open localhost:3000
```


You may need to add a rule to iptables if you are hosting in the cloud:

```
sudo iptables -I INPUT 1 -p tcp --dport 3000 -j ACCEPT
```
