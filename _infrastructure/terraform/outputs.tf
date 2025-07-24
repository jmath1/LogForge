output "registry_uri" {
  description = "The URI of the ECR registry where the Docker image is pushed."
  value       = "${var.ecr_registry}/${var.ecr_repository}"
} 

output "logging_server_ip" {
  description = "The public IP address of the EC2 instance where the logging server is deployed."
  value       = aws_instance.logging_server.public_ip
}