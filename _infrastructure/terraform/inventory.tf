resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../../inventory.ini"
  content  = <<-EOT
  [portfolio]
  ${data.terraform_remote_state.web.outputs.ec2_public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=_infrastructure/terraform/stacks/web/${local.ssh_key_name}
  EOT

}