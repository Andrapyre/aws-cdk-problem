import { Stack, Construct, StackProps, Duration } from "@aws-cdk/core"
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs"
import path from "path"

export class ServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    new NodejsFunction(this, "post-feedback-route-handler", {
      entry: path.join(__dirname, "..", "index.ts"),
      timeout: Duration.seconds(30),
    })
  }
}
