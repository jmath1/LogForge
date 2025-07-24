resource "aws_instance" "logging_server" {
  ami                         = "ami-04b4f1a9cf54c11d0"
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.deployer.key_name
  vpc_security_group_ids      = [aws_security_group.ec2_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  subnet_id                   = null
  associate_public_ip_address = true

  user_data = <<-EOF
    #!/bin/bash
    set -ex

    apt update -y
    apt install -y docker.io nginx unzip net-tools postgresql-client

    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu

    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install


  EOF

  tags = {
    Name = "logging-server"
  }
}

resource "aws_security_group" "ec2_sg" {
  name        = "logging-server-sg"
  description = "Allow HTTP and SSH"
  vpc_id      =  null



 ingress {
   
      from_port = 443
      to_port = 443
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    
  }

  ingress{
      from_port = 80
      to_port = 80
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
