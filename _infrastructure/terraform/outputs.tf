output "sidecar_destination_ip" {
  description = "The public IP address of the EC2 instance where the logging sidecar will be deployed."
  value       = local.sidecar_destination_ip
}

output "registry_uri" {
  description = "The URI of the ECR registry where the Docker image is pushed."
  value       = "${var.ecr_registry}/${var.ecr_repository}"
} 