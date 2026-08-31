# ---------------------------------------------------------------------------
#  Amazon RDS for PostgreSQL — the managed relational database that holds the
#  highly relational hospital data (patients, visits, prescriptions, ...).
# ---------------------------------------------------------------------------

# Security group for the application tier (referenced by the database rule).
resource "aws_security_group" "app" {
  name        = "${local.name}-app-sg"
  description = "Application tier"
  vpc_id      = aws_vpc.main.id

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-app-sg" }
}

# The database only accepts PostgreSQL connections from the application tier.
resource "aws_security_group" "db" {
  name        = "${local.name}-db-sg"
  description = "PostgreSQL access from the application tier only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from app tier"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = { Name = "${local.name}-db-sg" }
}

resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-db-subnets"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${local.name}-db-subnets" }
}

resource "aws_db_instance" "main" {
  identifier     = "${local.name}-db"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 3
  storage_type          = "gp3"
  storage_encrypted     = true # encryption at rest (KMS)

  multi_az               = var.db_multi_az # high availability across two AZs
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false # reachable only from inside the VPC

  backup_retention_period = 7 # daily automated backups, kept 7 days
  deletion_protection     = true
  skip_final_snapshot     = false
  final_snapshot_identifier = "${local.name}-db-final"

  tags = { Name = "${local.name}-db" }
}
