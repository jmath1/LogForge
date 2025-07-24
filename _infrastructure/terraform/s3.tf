resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "react_app" {
  bucket        = "logforge-${random_id.bucket_suffix.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_ownership_controls" "react_app" {
  bucket = aws_s3_bucket.react_app.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Critical: Disable all public access blocks
resource "aws_s3_bucket_public_access_block" "react_app" {
  bucket = aws_s3_bucket.react_app.id
  block_public_acls       = false
  block_public_policy     = false  # ← Required for public policies
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "react_app" {
  depends_on = [
    aws_s3_bucket_ownership_controls.react_app,
    aws_s3_bucket_public_access_block.react_app,
  ]
  bucket = aws_s3_bucket.react_app.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "react_app" {
  depends_on = [aws_s3_bucket_public_access_block.react_app]
  bucket = aws_s3_bucket.react_app.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow",
      Principal = "*",
      Action    = "s3:GetObject",
      Resource  = "${aws_s3_bucket.react_app.arn}/*"
    }]
  })
}


resource "aws_s3_bucket_cors_configuration" "react_app" {
  bucket = aws_s3_bucket.react_app.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = [
      "https://logs.${var.domain_name}.${var.tld}"
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}