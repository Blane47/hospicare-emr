# ---------------------------------------------------------------------------
#  Identity — Amazon Cognito for end-user authentication, and a GitHub OIDC
#  role for keyless CI/CD deployments (no long-lived AWS keys in the repo).
# ---------------------------------------------------------------------------

# ---- Amazon Cognito user pool (staff & patient sign-in) -------------------
resource "aws_cognito_user_pool" "main" {
  name = "${local.name}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_uppercase = true
    require_symbols   = false
  }

  # Multi-factor authentication available for staff accounts.
  mfa_configuration = "OPTIONAL"
  software_token_mfa_configuration {
    enabled = true
  }

  tags = { Name = "${local.name}-users" }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.name}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}

# ---- GitHub OIDC federation for CI/CD -------------------------------------
# GitHub Actions authenticates to AWS with a short-lived OIDC token; AWS STS
# exchanges it for temporary credentials scoped to the deploy role below.
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_policy_document" "github_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Restrict to this repository only.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:Blane47/hospicare-emr:*"]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = "${local.name}-github-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_assume.json
  tags               = { Name = "${local.name}-github-deploy" }
}

# Least-privilege deploy permissions (tighten further for production).
resource "aws_iam_role_policy" "github_deploy" {
  name = "${local.name}-deploy-policy"
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "amplify:StartDeployment",
          "amplify:StartJob",
          "amplify:GetApp",
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "cloudfront:CreateInvalidation"
        ]
        Resource = "*"
      }
    ]
  })
}
