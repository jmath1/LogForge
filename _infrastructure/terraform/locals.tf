locals {
  sidecar_destination_ip = data.terraform_remote_state.web.outputs.ec2_public_ip
  ec2_role_name = data.terraform_remote_state.web.outputs.ec2_role_name
}