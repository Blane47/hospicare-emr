# ---------------------------------------------------------------------------
#  Useful values printed after `terraform apply`.
# ---------------------------------------------------------------------------

output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.main.id
}

output "database_endpoint" {
  description = "RDS PostgreSQL connection endpoint."
  value       = aws_db_instance.main.endpoint
}

output "documents_bucket" {
  description = "S3 bucket for documents."
  value       = aws_s3_bucket.documents.bucket
}

output "cognito_user_pool_id" {
  description = "Amazon Cognito user pool ID."
  value       = aws_cognito_user_pool.main.id
}

output "cognito_web_client_id" {
  description = "Cognito app client ID for the web application."
  value       = aws_cognito_user_pool_client.web.id
}

output "amplify_default_domain" {
  description = "Default Amplify domain for the application."
  value       = aws_amplify_app.main.default_domain
}

output "github_deploy_role_arn" {
  description = "IAM role ARN for GitHub Actions to assume via OIDC."
  value       = aws_iam_role.github_deploy.arn
}
