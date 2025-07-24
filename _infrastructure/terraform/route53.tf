resource "aws_route53_record" "www" {
  zone_id = data.terraform_remote_state.domain.outputs.route53_zone.id
  name    = "logs."
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.react_app.domain_name
    zone_id                = aws_cloudfront_distribution.react_app.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "logs_api" {
  zone_id = data.terraform_remote_state.domain.outputs.route53_zone.id
  name    = "logs-api.${var.domain_name}.${var.tld}"
  type    = "A"
  ttl    = 300
  records = [aws_instance.logging_server.public_ip]
}