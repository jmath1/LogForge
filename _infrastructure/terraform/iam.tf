data "aws_iam_policy" "ecr_pull_policy" {
    name = "ECRPullPolicy"
}

resource "aws_iam_policy" "ecr_pull_policy" {
    count = length(data.aws_iam_policy.ecr_pull_policy) == 0 ? 1 : 0

    name        = "ECRPullPolicy"
    description = "Allow EC2 to pull from ECR"
    policy      = <<EOF
{
        "Version": "2012-10-17",
        "Statement": [
                {
                        "Effect": "Allow",
                        "Action": [
                                "ecr:GetAuthorizationToken",
                                "ecr:BatchCheckLayerAvailability",
                                "ecr:GetDownloadUrlForLayer",
                                "ecr:BatchGetImage",
                                "ecr:DescribeRepositories"
                        ],
                        "Resource": "*"
                }
        ]
}
EOF
}


data "aws_iam_policy" "secrets_read_policy" {
    name = "SecretsReadPolicy"
}
resource "aws_iam_policy" "secrets_read_policy" {
  count = length(data.aws_iam_policy.secrets_read_policy) == 0 ? 1 : 0
  name        = "SecretsReadPolicy"
  description = "Allow EC2 to read secrets"
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_role" "logging_server_role" {
  name = "logging_server_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "logging_server_profile"
  role = aws_iam_role.logging_server_role.name
}

resource "aws_iam_role_policy_attachment" "attach_ecr_pull" {
  role       = aws_iam_role.logging_server_role.name
  # Use the data source if the policy exists, otherwise use the created policy
  policy_arn = length(data.aws_iam_policy.ecr_pull_policy) == 0 ? aws_iam_policy.ecr_pull_policy[0].arn : data.aws_iam_policy.ecr_pull_policy.arn
}



resource "aws_iam_role_policy_attachment" "attach_secrets_read" {
  role       = aws_iam_role.logging_server_role.name
  # Use the data source if the policy exists, otherwise use the created policy
  policy_arn = length(data.aws_iam_policy.secrets_read_policy) == 0 ? aws_iam_policy.secrets_read_policy[0].arn : data.aws_iam_policy.secrets_read_policy.arn
}
