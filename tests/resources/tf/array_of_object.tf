 resource "aws_security_group" "aws_security_group_1" {
    name = "allow_all"
    description = "Allow all inbound traffic"
    ingress {
        from_port = 8080
        to_port = 80
        protocol = "TCP"
        cidr_blocks = [
            "192.2.0.0/24",
            "192.3.0.0/24",
        ]
        ipv6_cidr_blocks = [
            "2001:db8::/32",
            "2001:db7::/32",
        ]
    }

    ingress {
        from_port = 9090
        to_port = 90
        protocol = "UDP"
        cidr_blocks = [
            "192.15.0.0/24",
            "192.16.0.0/24",
        ]
        ipv6_cidr_blocks = [
            "2001:dc8::/32",
            "2001:dc7::/32",
        ]
    }
}
