variable "ssh_key_path" {
  description = "Path to the SSH private key used for connecting to the EC2 instances."
  type        = string
  default     = "./keys/logging-server-key.pem"
}

variable "github_thumbprint" {
  type    = string
  default = "6938fd4d98bab03faadb97b34396831e3780aea1"
}

variable "github_token" {
  description = "GitHub personal access token"
  type        = string
}

variable "github_owner" {
  description = "GitHub organization or user that owns the repository"
  type        = string
  default     = "jmath1"
}

variable "github_repository" {
  description = "GitHub repository name"
  type        = string
  default     = "LogForge"
}

variable "ecr_registry" {
  description = "Amazon ECR registry URL"
  type        = string
}

variable "ecr_repository" {
  description = "Amazon ECR repository name"
  type        = string
  default     = "logforge"
}

variable "aws_region" {
  description = "AWS region for the ECR repository"
  type        = string
}

variable "aws_account_number" {
  description = "AWS account number"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the CloudFront distribution"
  type        = string
  default     = "jonathanmath"
}

variable "tld" {
  description = "Top-level domain for the CloudFront distribution"
  type        = string
  default     = "com"
}

variable "cloudfront_price_class" {
  description = "Price class for the CloudFront distribution"
  type        = string
  default     = "PriceClass_100" # Options: PriceClass_All, PriceClass_200, PriceClass_100
}