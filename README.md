#     MXDeploy
#### Simple targeted CLI CodeDeploy Trigger

### Why do I want this?
You need to be able to trigger/re-trigger a pre-created CodeDeploy deployment on either existing or newly created EC2 instances.

...or because you're a dev at MASS and Ops told you to do so.

### Okay... but what does it do?

Do you need to:
 - Deploy the latest versions of a CodeDeploy Application/Deployment Group combo?
 - ...to a completely different instance one time only
 - ...or to a completely new instance, and have it automatically added to your deployment group
 - ...while NOT deploying to currently active instances inside that deployment group
 - ...without altering your deployment group if the deployment fails
 - ...and if the deployment fails, roll back your group filter?

Well, this does those things.

**WARNING: Currently, this program does not allow for multiple deployments on the same application/dep group combo at the same time.
To quote the great George Clinton -- "One fun at a time, that's all I'm sayin."**

### Setup

#### Part 1: Get MXDeploy
- Clone this repo and run `npm install` inside it to set up necessary libraries.
- Provide the following as environment variables (depending on your OS, as `export` statements in your `~/.bashrc`, `~/.zshrc` or `profile`, or inside administrative settings in Windows):
    - `awsAccessKeyId`: the ID of the aws credential.
    - `awsSecretAccessKey`: the credential's key
    - `awsRegion`: the aws region being operated on.
- Alternatively, if you want to deploy MXDeploy/something based on it to an Amazon EC2 instance for whatever reason,
you can authenticate using IAM by creating a role with:
    - AmazonEC2ReadOnlyAccess: for grabbing instance names when building deployment failure logs
    - AmazonEC2RoleforAWSCodeDeploy: for accessing S3 buckets in a CodeDeploy Deployment
    - In addition to these two managed AWS roles, an additional role must be created. A json for this role is included in this repo.
- Run `npm link` to symlink the package to your installation of npm's `PATH` directory, making it invokable from your shell.

#### Part 2: Set up some deployment groups.
- See AWS's documentation for this part.

#### Part 3: GET [your deployment pipelines] TRIGGERED.

### Syntax
```bash
mxdeploy --app APPLICATION_NAME --group DEPLOYMENT_GROUP [--inst TARGET_INSTANCE_NAME] [--join]
```

- app: The application to deploy. Requires that a successful deployment already exists.
- group: The deployment group to deploy to.
- inst (optional): A specific target instance name to deploy to. Otherwise, will default to "[APPLICATION_NAME]-[DEPLOYMENT_GROUP]"
- join (optional): If this flag is given, after the deployment is successful, will add the filter used in the deployment to the groups active filter, rather than rolling back to the original.

### Examples

```bash
mxdeploy --app backend --group demo
```
Triggers a deployment of the application "backend" to the "demo" group.

```bash
mxdeploy --app backend --group demo --inst aDifferentInstance
```
Triggers a deployment of the application "backend" using the "demo" group
to an instance named "aDifferentInstance," and that instance only.

```bash
mxdeploy --app backend --group demo --inst aDifferentInstance --join
```
Triggers a deployment of the application "backend" using the "demo" group
to an instance named "aDifferentInstance," and that instance only. After the deployment
is successful, adds that instance to the deployment group.
