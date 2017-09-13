#!/usr/bin/env node

const args = require("minimist")(process.argv.slice(2));
const {MXDeploy} = require(`${__dirname}/mxdeploy.js`)

const main = async (minimistArgs) => {
    const {app, group, inst, join} = minimistArgs;
    await MXDeploy(app, group, inst, join);
};

main(args).catch(err => console.log(err));
