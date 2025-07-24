resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../../inventory.ini"
  content  = <<-EOT
  [logging_server]
${local.sidecar_destination_ip} ansible_user=ubuntu ansible_ssh_private_key_file=${var.ssh_key_path}
  
  [logging_sidecar]
    ${local.sidecar_destination_ip} ansible_user=ubuntu ansible_ssh_private_key_file=${var.ssh_key_path}
  EOT

}