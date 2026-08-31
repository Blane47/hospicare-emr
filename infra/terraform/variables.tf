# ---------------------------------------------------------------------------
#  Input variables. Copy terraform.tfvars.example to terraform.tfvars and set
#  the sensitive values there (never commit terraform.tfvars).
# ---------------------------------------------------------------------------

variable "project" {
  description = "Project name, used as a resource name prefix."
  type        = string
  default     = "hospicare"
}

variable "environment" {
  description = "Deployment environment (prod, staging, ...)."
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "eu-central-1"
}

# ---- Networking ------------------------------------------------------------
variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

# ---- Database (Amazon RDS for PostgreSQL) ----------------------------------
variable "db_name" {
  description = "Initial database name."
  type        = string
  default     = "hospicare"
}

variable "db_username" {
  description = "Master username for the database."
  type        = string
  default     = "hospicare_admin"
}

variable "db_password" {
  description = "Master password for the database (set in terraform.tfvars)."
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for the database, in GB."
  type        = number
  default     = 20
}

variable "db_multi_az" {
  description = "Deploy the database across two Availability Zones for high availability."
  type        = bool
  default     = true
}

# ---- Application hosting (AWS Amplify) -------------------------------------
variable "github_repository" {
  description = "GitHub repository URL hosting the application."
  type        = string
  default     = "https://github.com/Blane47/hospicare-emr"
}

variable "amplify_github_token" {
  description = "GitHub personal access token for Amplify to connect the repo (set in tfvars)."
  type        = string
  sensitive   = true
  default     = ""
}

# ---- Operations ------------------------------------------------------------
variable "alert_email" {
  description = "Email address that receives CloudWatch alarm notifications."
  type        = string
  default     = ""
}
