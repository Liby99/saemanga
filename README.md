# IMPORTANT

DUE TO http://cartoonmad.com UPDATE, THE ORIGINAL PAGE IS NO LONGER ABLE TO WORK. 
STILL WAITING FOR SOLUTIONS. PR WELCOME.

# 冴えない漫画の育て方

Sae Manga, a minimalist manga reader developed by Liby with love. http://saemanga.com.

The 3.0 version is finally out! Please take a look at the website url above!

# Introduction

Sae Manga is a minimalist manga reader with scrapper from http://cartoonmad.com.

The whole website is built upon [keeling-js](https://github.com/Liby99/keeling-js),
with MongoDB as database and [EJS-Alt](https://github.com/Liby99/ejs-alt) as
render engine.

In 3.0 I rewrote the whole system and completely use keeling-js and ejs-alt.
Now the system has semi-enforced user system, a much more robust front-end and
back-end, and much more user-friendly functionalities such as scaling, managing,
genre filtering and so on. In short future there will be even more great updates.

# Getting Started

First of all, make sure you installed [NodeJS](https://nodejs.org/) and
[NPM](https://www.npmjs.com).

To build this, please first clone this repository, cd into `src/` folder and then
install the dependencies.

```
$ git clone https://github.com/Liby99/saemanga.git
$ cd saemanga/
$ cd src/
$ npm install
```

If you want to integrate the Database, please also install 
[MongoDB](https://www.mongodb.com), set it up, and create a schema called `manga`. 
Then go to `src/data/` and create a file called `mongo.json` which contains

```
{
  "host": "localhost",
  "port": 27017,
  "username": "<Your MongoDB Username>",
  "password": "<Your MongoDB Password>",
  "database": "manga"
}
```

Then type

```
npm run dev
```

to start the development server. You will see a line called 

```
successfully connected to mongo db
```

if you have correctly setup your database. After that, you can go to your browser
and type `localhost:8193` to visit the locally running website.

# License

Coming soon.

# Documentation

Coming soon.

# API

Coming soon.

# Getting Help

Coming soon.

# Issue Tracker

Coming soon.

# Install & Deploy

Coming soon.

# Contributing

Coming soon.

# Reporting Security Issues

Coming soon.
