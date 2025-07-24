provider "aws" {
  region = "us-east-1"
}

provider "github" {
  token = var.github_token
}

terraform {
  backend "s3" {
    bucket = "jonathanmathcom-terraform-state"
    region = "us-east-1"
    key   = "logforge.tfstate"
  }
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }
}
