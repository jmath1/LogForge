resource "aws_ecr_repository" "logforge" {
  name                 = var.ecr_repository
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  tags = {
    Name        = "LogForge ECR Repository"
    Environment = "Production"
  }
}