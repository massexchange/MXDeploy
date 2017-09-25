const {mxCodeDeploy, mxaws} = require("mxaws");
const {delay} = mxaws;

exports.MXDeploy = async (app, group, inst, join) => {

    const {deploymentGroupInfo} =
        await mxCodeDeploy.getDeploymentGroupData(app, group)
            .catch(err =>{

                if (err.code == "ApplicationDoesNotExistException" ||
                    err.code == "DeploymentGroupDoesNotExistException"){

                    console.log(err.message);

                } else console.log(err);

                console.log("Exiting.");
                process.exit(1);
            });

    const {
        ec2TagFilters,
        targetRevision,
        lastSuccessfulDeployment
    } = deploymentGroupInfo;

    //Closure
    const changeDeploymentGroupFilter = async (ec2TagFilter, logMessage) => {
        if (logMessage) console.log(logMessage);
        await mxCodeDeploy.updateDeploymentGroupFilter(
            app,
            group,
            ec2TagFilter
        );
    };

    //Closure
    const restoreOriginalDeploymentGroupFilter =
        async () => changeDeploymentGroupFilter(
            ec2TagFilters,
            "Restoring original deployment group filter..."
        );

    const filterForThisDeployment = determineEC2Filter(app, group, inst);
    await changeDeploymentGroupFilter([filterForThisDeployment]);

    const thisDeployment =
        await mxCodeDeploy.deployDeploymentGroup(app, group, targetRevision);

    //Wait 10 seconds so that AWS can finish creating the new deployment and start actually deploying it
    //Else, enjoy a "DeploymentNotStartedException"
    await delay(10);

    await mxCodeDeploy.waitForDeploymentSuccessful(thisDeployment)
        .catch(async err => {
            console.log("Deploy Failed!")

            if (err.code != "ResourceNotReady") {

                console.log("AWS Error:")
                console.log(err);

            } else {

                const errors = await mxCodeDeploy.getAndSimplifyDeploymentErrors(thisDeployment)
                .catch(innerErr => {
                  console.log(`There was an error getting errors. This could be an IAM Role issue.`);
                  console.log(innerErr);
                });

                mxCodeDeploy.printSimplifiedDeploymentErrors(errors);
            }

            await restoreOriginalDeploymentGroupFilter();
            console.log("Exiting.");
            process.exit(1);
        });

    console.log("Deployment successful!");

    if (join) {
        await changeDeploymentGroupFilter(
            filterForThisDeployment.concat(ec2TagFilters),
            `Adding new filter to deployment group ${group}...`
        );
    } else await restoreOriginalDeploymentGroupFilter();

    console.log("MXDeploy Process Complete.");
};

exports.checkIfDeploymentIsLatest = async (app, group, deploymentId) => {
    const depGroupData = await mxCodeDeploy.getDeploymentGroupData(app, group).catch(err=>{
        console.log(err);
        return false;
    });
    if (depGroupData == false) return false;
    const {lastAttemptedDeployment} = depGroupData.deploymentGroupInfo;
    return (lastAttemptedDeployment.deploymentId == deploymentId);
};

const determineEC2Filter = (app, group, inst) => inst
    ? makeNewNameFilter(inst)
    : makeNewNameFilter(`${app}-${group}`);

const makeNewEC2Filter =
    (key, value) => ({Key: key, Value: value, Type: "KEY_AND_VALUE"});

const makeNewNameFilter =
    (instName) => makeNewEC2Filter("Name", instName);

return exports;
