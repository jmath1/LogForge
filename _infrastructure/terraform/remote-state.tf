data "terraform_remote_state" "network" {
    backend = "s3"
    config = {
        bucket = "jonathanmathcom-terraform-state"
        key    = "network.tfstate"
        region = "us-east-1"
    }
}

data "terraform_remote_state" "web" {
    backend = "s3"
    config = {
        bucket = "jonathanmathcom-terraform-state"
        key    = "web.tfstate"
        region = "us-east-1"
    }
}