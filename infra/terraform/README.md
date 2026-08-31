# HospiCare — AWS Infrastructure (Terraform)

This directory defines the HospiCare cloud architecture as **Infrastructure as
Code** with Terraform. It is the machine-readable counterpart to the
architecture diagram in the project report.

> ⚠️ **This is a design/reference configuration.** Running `terraform apply`
> creates **real, billable AWS resources** (an RDS instance, a NAT gateway,
> etc.). Review every `terraform plan` first, and only apply when you intend to
> incur cost.

## What it provisions

| File | Resources |
|------|-----------|
| `network.tf` | VPC, public/private subnets across 2 AZs, internet & NAT gateways, route tables |
| `database.tf` | RDS PostgreSQL (Multi-AZ, encrypted, private) + security groups |
| `storage.tf` | S3 documents bucket (versioned, encrypted, private, lifecycle) |
| `identity.tf` | Cognito user pool + client; GitHub OIDC provider + deploy role |
| `app.tf` | Amplify app + branch (Next.js SSR), SNS alerts, CloudWatch logs + alarm |
| `outputs.tf` | Endpoints and IDs printed after apply |

## Usage

```bash
# 1. Install Terraform (>= 1.6) and configure AWS credentials.
aws configure

# 2. Provide your values.
cp terraform.tfvars.example terraform.tfvars   # then edit it

# 3. Initialise and review — this does NOT create anything.
terraform init
terraform plan

# 4. Apply only when ready (creates billable resources).
terraform apply

# 5. Tear everything down when finished.
terraform destroy
```

## Notes

- **State**: for team use, enable the S3 backend in `versions.tf`.
- **Secrets**: `terraform.tfvars` is git-ignored. Application secrets
  (`DATABASE_URL`, `AUTH_SECRET`) should be set as Amplify secured environment
  variables or in AWS Secrets Manager, not in this file.
- **Cost**: the NAT gateway and Multi-AZ RDS are the main fixed costs. For a
  cheaper demo, set `db_multi_az = false` and remove the NAT gateway if the
  private tier needs no outbound internet.
