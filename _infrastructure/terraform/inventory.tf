resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../../inventory.ini"
  content  = <<-EOT
  [logging_server]
${aws_instance.logging_server.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=${var.ssh_key_path}
  
  [logging_sidecar]
    ${aws_instance.logging_server.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=${var.ssh_key_path}
  EOT

}