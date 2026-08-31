# ---------------------------------------------------------------------------
#  Application hosting, messaging and monitoring.
# ---------------------------------------------------------------------------

# ---- AWS Amplify — hosts the Next.js application (SSR) ---------------------
# Amplify builds from GitHub and serves the app through its own managed
# CloudFront CDN over HTTPS, so no separate CloudFront resource is needed.
resource "aws_amplify_app" "main" {
  name         = "${local.name}-app"
  repository   = var.github_repository
  access_token = var.amplify_github_token
  platform     = "WEB_COMPUTE" # Next.js server-side rendering

  # Non-secret build settings. Secrets (DATABASE_URL, AUTH_SECRET) should be set
  # as Amplify secured environment variables or pulled from Secrets Manager.
  environment_variables = {
    AUTH_TRUST_HOST     = "true"
    COGNITO_POOL_ID     = aws_cognito_user_pool.main.id
    COGNITO_CLIENT_ID   = aws_cognito_user_pool_client.web.id
    DOCUMENTS_BUCKET    = aws_s3_bucket.documents.bucket
  }

  tags = { Name = "${local.name}-app" }
}

resource "aws_amplify_branch" "main" {
  app_id            = aws_amplify_app.main.id
  branch_name       = "master"
  stage             = "PRODUCTION"
  enable_auto_build = true
}

# ---- Amazon SNS — operational alerts (and the channel for SMS reminders) --
resource "aws_sns_topic" "alerts" {
  name = "${local.name}-alerts"
  tags = { Name = "${local.name}-alerts" }
}

resource "aws_sns_topic_subscription" "alerts_email" {
  count     = var.alert_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ---- Amazon CloudWatch — logs and a sample alarm --------------------------
resource "aws_cloudwatch_log_group" "app" {
  name              = "/hospicare/${var.environment}/app"
  retention_in_days = 30
  tags              = { Name = "${local.name}-logs" }
}

# Alarm if the database CPU stays high — notifies the alerts topic.
resource "aws_cloudwatch_metric_alarm" "db_cpu" {
  alarm_name          = "${local.name}-db-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Database CPU above 80% for 15 minutes"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.identifier
  }
}
