const repositories = [
  {
    'username': process.env.USER_1,
    'password': process.env.PASS_1,
    'repositories': [
      'juanviola/cb-dhcp-api',
      'juanviola/rsyslog'
    ],
    'metadata': [
      {
        'name': 'juanviola/cb-dhcp-api',
        'commands': [
          'docker pull juanviola/cb-dhcp-api',
          'docker stop cb-dhcp-api',
          'docker rm cb-dhcp-api',
          'docker-compose up -f /root/cloudbuilders-dhcp-api/docker-compose.yml -d dhcp-api'
        ]
      },
      {
        'name': 'juanviola/rsyslog',
        'commands': [
          'docker pull juanviola/rsyslog',
          'docker stop rsyslog',
          'docker rm rsyslog'
        ]
      }
    ]
  }
]

module.exports = {
  repositories: repositories
}
