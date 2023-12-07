 resource "aws_security_group" "aws_security_group_1" {
    name = "allow_all"
    description = "Allow all inbound traffic"
    ingress {
        from_port = 8080
        to_port = 80
        protocol = "TCP"
        cidr_blocks = [
            "QSD",
            "LJKK",
        ]
        ipv6_cidr_blocks = [
            "SDQ5",
            "SDF58",
        ]
    }

    ingress {
        from_port = 9090
        to_port = 90
        protocol = "UDP"
        cidr_blocks = [
            "QSqsdD",
            "LJKsdfK",
        ]
        ipv6_cidr_blocks = [
            "SDQxzqsdqsqsd5",
            "SDF5qsdddfg8",
        ]
    }
}
