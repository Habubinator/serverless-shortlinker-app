const AWS = require("aws-sdk");

//Delete all but 'keepversions' highest numbered numeric versions
const keepversions = 1;
const lambda = new AWS.Lambda({ region: "eu-central-1" });

async function main() {
  const listfunctions = await lambda.listFunctions().promise();

  for (let func of listfunctions.Functions) {
    let versions = (
      await lambda
        .listVersionsByFunction({ FunctionName: func.FunctionArn })
        .promise()
    ).Versions;
    versions.forEach((_) => (_.versionnumber = parseInt(_.Version))); //eliminate '$LATEST'
    versions = versions.filter((_) => !isNaN(_.versionnumber));
    //sort in reverse order
    versions = versions.sort(
      (lhs, rhs) => rhs.versionnumber - lhs.versionnumber
    );

    let keep = versions.slice(0, keepversions);
    let remove = versions.slice(keepversions);
    console.log(
      `${func.FunctionArn}: Keeping ${JSON.stringify(
        keep.map((_) => _.Version)
      )}, deleting ${JSON.stringify(remove.map((_) => _.Version))}`
    );

    for (let version of remove)
      await lambda
        .deleteFunction({ FunctionName: version.FunctionArn })
        .promise(); //version FunctionArn embeds the version number
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
  });
