# Installation Guide

### Front-End installation
1. Install **VsCode** if you have not done so already.
2. In VsCode, navigate to the folder: **[....]/MtCoffee.Web/ClientApp**
3. In terminal, start running these commands... Can *probably* get away with latest versions as well. These are just the versions I currently have installed.
```
npm install -g dart-sass@1.25.0
npm install -g typescript@4.2.4
npm install
```

**Build** the project with `npm run-script build`

**Run** the project with `npm run-script start`


### Back-End installation
1. Install **Vs Studio** if you have not done so already.
2. Set environmental variable `PORTAL_MTCOFFEE_NET_PW` to the AES decryption key. 
3. Run the project. 
4. You can get credentials from Pangamma.

At some point a secret management system will likely be needed, but for now this works well enough.
