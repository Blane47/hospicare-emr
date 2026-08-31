# ---------------------------------------------------------------------------
#  Amazon S3 — durable, private storage for documents: lab result scans,
#  imaging and generated PDF receipts.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "documents" {
  bucket = "${local.name}-documents-${data.aws_caller_identity.current.account_id}"
  tags   = { Name = "${local.name}-documents" }
}

# Versioning protects against accidental overwrite or deletion.
resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Encrypt every object at rest.
resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Patient documents must never be public.
resource "aws_s3_bucket_public_access_block" "documents" {
  bucket                  = aws_s3_bucket.documents.id
  block_public_acls       = true
  block_public_policy      = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Move older documents to cheaper storage automatically.
resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  rule {
    id     = "archive-old-documents"
    status = "Enabled"
    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }
  }
}
