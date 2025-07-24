locals {
    app_hash = sha1(
      join("", 
        concat(
          [for f in fileset("${path.module}/../../frontend/src", "**"): filesha1("${path.module}/../../frontend/src/${f}")],
          [for f in fileset("${path.module}/../../frontend/public", "**"): filesha1("${path.module}/../../frontend/public/${f}")],
          [filesha1("${path.module}/../../frontend/package.json")],
          [filesha1("${path.module}/../../frontend/package-lock.json")],
        )
      )
    )
    zone_id = data.terraform_remote_state.domain.outputs.route53_zone.id
}