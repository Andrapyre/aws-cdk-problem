import { Stack, Stage, StackProps, Construct, StageProps } from "@aws-cdk/core"
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines"
import { CfnConnection } from "@aws-cdk/aws-codestarconnections"

import { Artifact } from "@aws-cdk/aws-codepipeline"
import { CodeStarConnectionsSourceAction } from "@aws-cdk/aws-codepipeline-actions"

import { ServiceStack } from "./service-stack"

class App extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props)

    new ServiceStack(this, "ServiceStack")
  }
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const sourceArtifact = new Artifact()
    const cloudAssemblyArtifact = new Artifact()

    const codeStarConnection = new CfnConnection(this, "BitBucketConnection", {
      connectionName: "BitBucketConnection",
      providerType: "Bitbucket",
    })

    const pipeline = new CdkPipeline(this, "TrialPipeline", {
      crossAccountKeys: false,
      pipelineName: "TrialPipeline",
      cloudAssemblyArtifact,

      sourceAction: new CodeStarConnectionsSourceAction({
        actionName: "BitBucketWebhook",
        owner: "trial",
        connectionArn: codeStarConnection.attrConnectionArn,
        output: sourceArtifact,
        repo: "trial",
        branch: "main",
      }),

      synthAction: SimpleSynthAction.standardYarnSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        environment: {
          privileged: true,
        },
      }),
    })
    const deploy = new App(this, "Deploy")
    pipeline.addApplicationStage(deploy)
  }
}
