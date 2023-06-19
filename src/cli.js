#!/usr/bin/env node

const tf = require('./terrafile.js');
const [,, ...args] = process.argv;
tf.main(args);