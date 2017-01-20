# App Framework Installation and Setup

# INSTALL ANDROID STUDIO
# https://developer.android.com/studio/index.html
# Open application:
# Configure -> SDK Manager -> Launch Standalone SDK Manager
# 	Check “Android 7.0 (API 24)” and install packages
# 	Android SDK License -> Accept License -> Install

# INSTALL NODEJS:
# https://nodejs.org/en/
sudo chown -R arno /usr/local/lib/node_modules/

# INSTALL IONIC
# https://ionicframework.com/getting-started/
npm install -g ionic
npm install -g cordova ios-sim ios-deploy
ionic state reset
# Sample ionic app: ionic start --v2 myApp tabs; cd myApp; ionic serve

# INSTALL DOCKER
# https://docs.docker.com/engine/installation/
sudo apt install docker-compose

# INSTALL GIRDER
# git clone https://github.com/girder/girder.git
git clone https://github.com/satra/girder.git

# SET UP GIRDER
mkdir apps/db
mkdir apps/assetstore

# Edit docker-compose.yml file to mount mongoldb outside of the docker instance:
/*
 mongodb:
     ports:
         - "27017"
     volumes:
         - “/root/apps/db:/data/db"
 
 girder:
     image: girder/girder
     ports:
         - "8080:8080"
     links:
         - "mongodb:mongodb"
     command: -d mongodb://mongodb:27017/girder
     volumes:
         - “/root/apps/assetstore:/assetstore"
*/

# In OSX/Win Docker, click Docker icon and make sure Docker-File->Sharing includes volumes inside Girder’s dockercompose file.

cd girder
# If installing on computer: pip install -e .
# If installing in docker container: docker-compose up
# On AWS: sudo docker-compose up
sudo docker-compose up

# Within Girder’s console in the browser (http://localhost:8080/#assetstores), 
# create new Filesystem assetstore (set assetstore name: http://localhost:8080/#assetstores):
#	Assetstore name: myAssetstore (example)
#	Root directory: /assetstore

# Girder’s REST API: http://localhost:8080/api/

# SATRA’S VoiceUp APP (JS library that uses Ionic-ResearchKit JS library that uses Girder as a backend):
git clone https://github.com/satra/MIT-VoiceUp-App.git

# Edit MIT-VoiceUp-App/ionic/www/js/app.js:
#	.constant('appConstants', {
#  		'base_url': 'http://localhost:8080/api/v1/',
ionic serve #local browser
