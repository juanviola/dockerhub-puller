'use strict';

var config = require('./config');
var dockerHubAPI = require('docker-hub-api');
var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var child = require('child_process').exec;
var child_process = require('child_process');
var child;

// global vars
let trackers = fs.existsSync('trackers.json') ? JSON.parse(fs.readFileSync('trackers.json','utf8')) : {};

/**
 *  GET TOKEN
 **/
function get_token(user, pass){
  return new Promise((resolv, reject) => {
    dockerHubAPI.login(user, pass).then(function(token, err){
      if (err) return reject(err);
      return resolv(token);
    })
    .catch((err) => {
      return reject(err);
    });
  });
}

/**
 * CHECK REPOSITORY
 * @array repos
 **/
function check_repos(metadata){
   _.forEach(metadata, function(repo, index){
    //  console.log(JSON.stringify(repo));
     if (repo['name'].indexOf('/')!=-1) {
       var user = repo['name'].split('/')[0];
       var name = repo['name'].split('/')[1].split(':')[0];

       let first_time_flag = false;

       if (!trackers.hasOwnProperty(user)) trackers[user] = {}
       if (!trackers[user].hasOwnProperty(name)) {
         trackers[user][name] = '';
         first_time_flag = true;
       }

       dockerHubAPI.repository(user, name).then(function(x){
         if (trackers[user][name]!=x['last_updated']) {
           trackers[user][name] = x['last_updated'];
           if (!first_time_flag) {
             console.log(`There is a new release for ${name}`);

             if (repo['commands'] && repo['commands'].length>0) {
                _.forEach(repo['commands'], function(cmd){
                  console.log(`running... ${cmd}`);
                  try {
                    runcmd(cmd);
                  } catch (err) {
                    console.log(`error ----> ${err}`);
                  }
                })
             }
           }
           save_to_file(trackers);
         }
         else {
           console.log('repo is up to date');
         }
       })
       .catch((e)=>{
         console.log(`error ${e}`);
       })
     } // enf if
   }) // end forEach
  }

/**
 * execute commands
 **/
function runcmd(cmd){
  var output = child_process.execSync(cmd);
  console.log(output);
  console.log(JSON.stringify(output));
}


/**
 * save to file
 **/
function save_to_file(data){
  fs.writeFile('trackers.json', JSON.stringify(data), function(e){
    if (e) return console.log(e);
  })
}

/**
 * Start processing repositories from config file
 **/
_.forEach(config.repositories, function(data, index){
  // if user/password is defined
  if (data['username']!=undefined && data['password']!=undefined && data['username'].length>0 && data['password'].length>0){
    // console.log(JSON.stringify(data));
    // do login with docker hub
    get_token(data['username'], data['password']).then((token, err) => {
      // console.log(`passing metadata as: ${JSON.stringify(data['metadata'])}`);
      // check repositories
      check_repos(data['metadata'], trackers)
    })
    .catch((err) => {
      console.log(err);
    });
  }
  else {
    // check repositories without authentication
    check_repos(data['metadata'], trackers)
  }
})
