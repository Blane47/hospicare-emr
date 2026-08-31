# ---------------------------------------------------------------------------
#  HospiCare — AWS infrastructure as code (Terraform)
#
#  This configuration DEFINES the cloud architecture described in the project
#  report. It is a reference / design artifact: review it with `terraform plan`
#  before ever running `terraform apply`, which creates real, billable AWS
#  resources. Region defaults to eu-central-1 (Frankfurt).
# ---------------------------------------------------------------------------

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # For real use, store state remotely (uncomment and create the bucket first):
  # backend "s3" {
  #   bucket = "hospicare-tfstate"
  #   key    = "prod/terraform.tfstate"
  #   region = "eu-central-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Handy data sources reused across the configuration.
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

locals {
  name = "${var.project}-${var.environment}"
  azs  = slice(data.aws_availability_zones.available.names, 0, 2)
}
