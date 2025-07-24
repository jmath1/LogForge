
resource "null_resource" "build_and_deploy" {
  depends_on = [ aws_s3_bucket.react_app, aws_cloudfront_distribution.react_app ]
  triggers = {
    build_dir_hash = local.app_hash
  }

  provisioner "local-exec" {
    command = <<EOT
      cd ${path.module}/../../frontend && \
      npm install && \
      REACT_APP_BACKEND=logs-api.${var.domain_name}.${var.tld} npm run build && \
      aws s3 sync build/ s3://${aws_s3_bucket.react_app.id}/ --delete
      aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.react_app.id} --paths "/*"

    EOT
  }
}
